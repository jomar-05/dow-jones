import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileDownloadService } from './file-download.service';

@Controller('download')
export class FileDownloadController {
  constructor(private readonly fileDownloadService: FileDownloadService) {}

  @Get('watchlist')
  async downloadWatchlist(@Res() res: Response) {
    try {
      const watchlistEntries: any[] =
        await this.fileDownloadService.getWatchlistData();
      return res.status(HttpStatus.OK).json(watchlistEntries);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(status).json({ message: error.message });
    }
  }
}
