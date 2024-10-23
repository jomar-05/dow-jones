import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DowJonesService } from '@secom/dow-jones/dow-jones.service';
import { DowJonesRiskEntityDto } from 'libs/dow-jones/dto';
import { NameDTO } from 'libs/dow-jones/dto/name.dto';
import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { WatchListRepository } from 'src/entity-repository/watchlist-repository';
import { parseFileCSV } from '../utils';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: WatchListRepository,
    @Inject(DowJonesService)
    private readonly dowjonesService: DowJonesService,
  ) {}

  async handleFile(fileText: string) {
    let c = 0;
    const arrayOfData = await parseFileCSV(
      JSON.parse(JSON.stringify(fileText))?.text,
    );
    // Parse the file text to extract email and CSV data
    const parsedFileText = JSON.parse(JSON.stringify(fileText));
    const email = JSON.parse(parsedFileText.email).email;

    const results = await Promise.all(
      arrayOfData.map(async (item) => {
        const ckycId = item.ckyc_id ?? ''; // Extract ckyc_id
        const lastName = item.last_name ?? '';
        const firstName = item.first_name ?? '';
        const middleName = item.middle_name ?? '';

        /*  */
        const searchResult = await this.searchDowJonesWatchlistApi({
          lastName,
          firstName,
          middleName,
        });
        console.log(
          'Search result:',
          `${firstName}, ${lastName}, ${middleName}`,
          searchResult,
        );
        console.log('count: ' + ++c);
        if (!searchResult.length) {
          return;
        }
        const existsToDatabase = await this.isExistsToDatabase({
          lastName,
          firstName,
          middleName,
        });
        // checking in local database
        if (!existsToDatabase) {
          const arr: any = [];
          if (!firstName && !lastName) {
            return;
          }
          try {
            await this.insertIntoWatchlist(searchResult, {
              firstName,
              lastName,
              middleName,
              ckycId, // Pass ckycId
              createdBy: email, // Pass createdBy using email
            });
            arr.push({
              first_name: firstName,
              last_name: lastName,
              middle_name: middleName,
            });
            return arr;
          } catch (error) {
            console.error('Error inserting into watchlist:', error);
            throw new Error('Failed to insert records into the watchlist');
          }
        } else {
          const watchlistEntries = await this.watchlistRepository.find({
            where: {
              firstName,
              lastName,
              ckycId,
            },
          });

          console.log(watchlistEntries);
          console.log(watchlistEntries.length);
        }
        /* */

        // const exists = await this.isExistsToDatabase({
        //   lastName,
        //   firstName,
        //   middleName,
        // });

        // if (!exists) {
        //   const searchResult = await this.searchDowJonesWatchlistApi({
        //     lastName,
        //     firstName,
        //     middleName,
        //   });
        //   console.log(
        //     'Search result:',
        //     `${firstName}, ${lastName}, ${middleName}`,
        //     searchResult,
        //   );

        //   // Include ckycId and createdBy when inserting into the watchlist
        //   await this.insertIntoWatchlist(searchResult, {
        //     firstName,
        //     lastName,
        //     middleName,
        //     ckycId, // Pass ckycId
        //     createdBy: email, // Pass createdBy using email
        //   });
        // }

        return {
          data: item,
        };
      }),
    );

    return results;
  }

  private async isExistsToDatabase(data: NameDTO): Promise<number> {
    const { lastName, firstName, middleName } = data;

    const query = `
    CALL watchlist_search(?, ?, ?)
  `;
    const result = await this.watchlistRepository.query(query, [
      lastName,
      firstName,
      middleName,
    ]);

    console.log(result[0][0]?.COUNT);
    return parseInt(result[0][0]?.COUNT);
  }

  async searchDowJonesWatchlistApi(
    data: NameDTO,
  ): Promise<DowJonesRiskEntityDto[] | []> {
    const result = await this.dowjonesService.dowJonesSearchWatchlistApi(data);
    return result;
  }

  async insertIntoWatchlist(
    results: unknown[],
    fullName: NameDTO & { ckycId: string; createdBy: string },
  ): Promise<unknown[]> {
    if (!results.length) {
    }

    const { firstName, lastName, middleName, ckycId, createdBy } = fullName;

    const insertPromises = results.map(async (person) => {
      if (!person?.attributes) {
        return; // Skip if attributes are missing
      }

      const { attributes } = person;

      // Extract fields
      const primaryName = attributes.primaryName;
      const title = attributes.title || '';
      const countryCode = attributes.countryTerritoryCode || null;
      const countryName = attributes.countryTerritoryName || null;
      const gender = attributes.gender === 'Female' ? 'FEMALE' : 'MALE';
      const score = attributes.score || null;

      // Extract and format date of birth
      const birthDate = attributes.dateOfBirth.length
        ? attributes.dateOfBirth[0]
        : null;
      const { day, month, year } = birthDate || {
        day: '',
        month: '',
        year: '',
      };
      const dowJonesId = person.id;

      const iconHints = attributes?.iconHints || [];
      const iconHintString = iconHints
        .map((e: any) => e.iconHint)
        .filter(
          (hint: string | null) =>
            typeof hint === 'string' && hint.trim() !== '',
        )
        .join(', ');
      console.log('Icon hints: ' + iconHintString);

      const birthDay = `${year}-${month}-${day}`;
      const query = `CALL dow_jones.watchlist_insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // Log parameters for debugging
      const params = [
        ckycId,
        lastName,
        firstName,
        middleName || null,
        primaryName,
        title,
        countryCode,
        countryName,
        gender,
        score,
        birthDay,
        iconHintString,
        dowJonesId,
        createdBy,
      ];
      console.log('Inserting with parameters:', params);

      try {
        await this.watchlistRepository.query(query, params);
      } catch (error: any) {
        throw new Error('Error inserting data: ' + error.message);
      }
    });

    return await Promise.all(insertPromises);
  }
}
