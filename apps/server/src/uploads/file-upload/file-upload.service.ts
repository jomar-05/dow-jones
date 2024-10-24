import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DowJonesService } from '@secom/dow-jones/dow-jones.service';
import { promises as fs } from 'fs';
import { DowJonesRiskEntityDto } from 'libs/dow-jones/dto';
import { NameDTO } from 'libs/dow-jones/dto/name.dto';
import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { WatchListRepository } from 'src/entity-repository/watchlist-repository';
import * as XLSX from 'xlsx';
import { formatData } from '../utils/formattedData';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: WatchListRepository,
    @Inject(DowJonesService)
    private readonly dowjonesService: DowJonesService,
  ) {}

  async handleFile(file: Express.Multer.File, data: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const userEmail = JSON.parse(data?.email).email;
      const fileBuffer = await fs.readFile(file.path);
      const workbook = await XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = await workbook.SheetNames[0];
      const worksheet = await workbook.Sheets[firstSheetName];
      const jsonData = await XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = jsonData[0];
      // Extract data from each row using map
      const extractedData = jsonData.slice(1).map((row) => {
        const rowData: Record<string, any> = {};
        headers.forEach((header, index) => {
          // Ensure each value is treated as a string
          rowData[header] = String(row[index] || ''); // Convert to string and handle undefined
        });
        return rowData;
      });
      // Construct the full path to the file
      const formattedData = formatData(extractedData);
      let c = 0;
      const results = await Promise.all(
        (await formattedData).map(async (item) => {
          const ckycId = item.ckyc_id ?? '';
          const lastName = item.LastName ?? '';
          const firstName = item.FirstName ?? '';
          const middleName = item.MiddleName ?? '';

          const searchResultFromDowJones =
            await this.searchDowJonesWatchlistApi({
              lastName,
              firstName,
              middleName,
            });
          console.log(
            'Search result:',
            `${firstName}, ${lastName}, ${middleName}`,
            searchResultFromDowJones,
          );
          console.log('count: ' + ++c);
          if (!searchResultFromDowJones.length) {
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
              await this.insertIntoWatchlist(searchResultFromDowJones, {
                firstName,
                lastName,
                middleName,
                ckycId,
                createdBy: userEmail,
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
            await this.updateIconHints(searchResultFromDowJones, ckycId);
          }
          return {
            data: item,
          };
        }),
      );

      return results;
    } catch (error) {
      throw new BadRequestException(`Error reading file: ${error.message}`);
    }
  }

  private async updateIconHints(resultSearchDowjones: any[], ckycId: string) {
    const result = resultSearchDowjones.map(async (entry) => {
      const iconHints = entry?.attributes?.iconHints || [];
      const iconHintString = iconHints
        .map((e: any) => e.iconHint)
        .filter(
          (hint: string | null) =>
            typeof hint === 'string' && hint.trim() !== '',
        )
        .join(', ');
      console.log('Icon hints: ' + iconHintString);
      const query = `CALL watchlist_updateiconhint(?, ?, ?)`;
      const params = [ckycId, entry.id, iconHintString];
      console.log('Cheking with parameters:', params);
      try {
        await this.watchlistRepository.query(query, params);
      } catch (error: any) {
        throw new Error('Error passing data: ' + error.message);
      }
    });
    await Promise.all(result);
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

  async getPersonRemarks(personId: string): Promise<any> {
    const result =
      await this.dowjonesService.dowJonesSearchRiskEntitesProfileApi(personId);
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
      const query = `CALL dow_jones.watchlist_insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

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
        '',
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
