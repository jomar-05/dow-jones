// src/request/request.dto.ts
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestDataDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsDateString()
  createdDate?: string;
}
