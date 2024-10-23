import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { FileDownloadController } from './file-download.controller'; // Adjust path as necessary
import { FileDownloadService } from './file-download.service'; // Adjust path as necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist]), // Register the Watchlist entity here
  ],
  providers: [FileDownloadService],
  controllers: [FileDownloadController],
})
export class FileDownloadModule {}
