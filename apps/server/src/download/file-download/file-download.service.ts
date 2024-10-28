import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { WatchListRepository } from 'src/entity-repository/watchlist-repository';

@Injectable()
export class FileDownloadService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: WatchListRepository,
  ) {}

  async getWatchlistData(
    page: number = 100,
    limit: number = 100,
  ): Promise<{ data: Watchlist[]; total: number }> {
    const [watchlistEntries, total] =
      await this.watchlistRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          id: 'ASC',
        },
      });

    return { data: watchlistEntries, total }; // Return an object containing entries and total count
  }

  async requestWatchlistData(
    userRequest: any,
    offset: number = 0,
    limit: number = 1000000,
    createdDate?: string,
  ): Promise<any[] | []> {
    // Check if userRequest or createdDate are defined
    if (!userRequest && !createdDate) {
      throw new Error(
        'Invalid request: must provide either createdDate or userRequestName.',
      );
    }

    let firstName = '';
    let lastName = '';
    let middleName = '';

    // If userRequest is provided, extract names
    if (userRequest && userRequest.userRequestName) {
      ({ firstName, lastName, middleName } = userRequest.userRequestName);
    }

    // Log the names and date for debugging
    console.log('Requesting watchlist for:', {
      firstName,
      lastName,
      middleName,
      createdDate,
    });

    // If a createdDate is provided, fetch data based on date
    if (createdDate) {
      const formattedDate = this.convertToDateOnly(createdDate);
      const dateQuery = `
      CALL watchlist_getbydate(?, ?, ?)
    `;
      const params = [formattedDate, offset, limit];
      console.log('Fetching by date with params:', params);
      const watchlistEntries = await this.watchlistRepository.query(
        dateQuery,
        params,
      );
      console.log('Fetched watchlist entries by date:', watchlistEntries[0]);
      return watchlistEntries[0] || [];
    }

    const query = `
    CALL watchlist_getbyname(?, ?, ?, ?, ?)
  `;
    const params = [lastName, firstName, middleName || '', offset, limit];
    console.log('Fetching by name with params:', params);

    const watchlistEntries = await this.watchlistRepository.query(
      query,
      params,
    );
    console.log('Fetched watchlist entries by name:', watchlistEntries[0]);
    return watchlistEntries[0] || [];
  }

  private convertToDateOnly(isoDateString) {
    const date = new Date(isoDateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error(
        'Invalid date format. Please provide a valid ISO date string.',
      );
    }

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
  }
}
