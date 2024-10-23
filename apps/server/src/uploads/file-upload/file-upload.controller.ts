import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NameDTO } from 'libs/dow-jones/dto/name.dto';
import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() data: string) {
    return this.fileUploadService.handleFile(data);
  }

  // @Post('test')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@Body() data: string) {
  //   return this.fileUploadService.handleFile(data);
  // }

  @Post('')
  async upload(@Body() data: NameDTO) {
    return await this.fileUploadService.searchDowJonesWatchlistApi(data);
  }
}
