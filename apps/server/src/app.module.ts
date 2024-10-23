import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RegisterModule } from './register/register.module';
import { UsersModule } from './users/users.module';
import { FileUploadModule } from './uploads/file-upload/file-upload.module';
import { FileDownloadModule } from './download/file-download/file-download.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    RegisterModule,
    FileUploadModule,
    FileDownloadModule,
  ],
  controllers: [],
  exports: [],
})
export class AppModule {}
