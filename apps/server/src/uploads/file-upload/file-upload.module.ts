import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowJonesModule } from '@secom/dow-jones';
import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist]),
    DowJonesModule, // Importing the module that contains DowJonesService
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService], // Optional: Include if using directly
})
export class FileUploadModule {}
