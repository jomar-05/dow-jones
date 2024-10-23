import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const apiPrefix = 'api';
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());
  app.use(helmet());
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
