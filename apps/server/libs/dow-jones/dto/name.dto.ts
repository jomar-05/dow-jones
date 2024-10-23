import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class NameDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  firstName: string | undefined;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  lastName: string | undefined;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  middleName?: string;
}
