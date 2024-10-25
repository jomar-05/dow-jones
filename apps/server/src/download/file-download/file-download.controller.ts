import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileDownloadService } from './file-download.service';

@Controller('download')
export class FileDownloadController {
  constructor(private readonly fileDownloadService: FileDownloadService) {}

  @Get('watchlist')
  async downloadWatchlist(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Res() res: Response,
  ) {
    try {
      const { data: watchlistEntries, total } =
        await this.fileDownloadService.getWatchlistData(page, limit);
      return res.status(HttpStatus.OK).json({ watchlistEntries, total }); // Return both data and total count
    } catch (error) {
      console.log(error);
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: error.message });
    }
  }

  @Get('request-user')
  async requestData(@Query() query: any) {
    // Validate the incoming query parameters
    if (!query || (!query.createdDate && !query.userRequest)) {
      throw new Error(
        'Invalid request: must provide either createdDate or userRequest.',
      );
    }

    // Check if userRequest is provided and structured correctly
    const userRequest = query.userRequest || {};
    const {
      firstName = '',
      lastName = '',
      middleName = '',
    } = userRequest.userRequestName || {};

    // Log the request for debugging
    console.log('Received request with query:', query);

    try {
      // Pass the structured object to the service
      const result = await this.fileDownloadService.requestWatchlistData(
        { userRequestName: { firstName, lastName, middleName } },
        query.createdDate,
        query.offset,
        query.limit,
      );
      return result;
    } catch (error) {
      console.error('Error in requestData:', error.message);
      throw new Error(
        'Failed to fetch watchlist data. Please try again later.',
      );
    }
  }
}
