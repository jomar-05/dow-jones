import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUploadService } from './file-upload.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueSuffix);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5mb
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() data: any,
  ) {
    const result = await this.fileUploadService.handleFile(file, data);
    return result;
  }

  @Get('person/:personId')
  async getPersonRemarks(@Param('personId') personId: string) {
    const result = await this.fileUploadService.getPersonRemarks(personId);
    return result;
  }
}
