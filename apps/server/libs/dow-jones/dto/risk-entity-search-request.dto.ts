import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DateOfBirth {
  @IsString()
  @IsOptional()
  day?: string;

  @IsString()
  @IsOptional()
  month?: string;

  @IsString()
  @IsOptional()
  year?: string;
}

export class IconHints {
  @IsString()
  @IsOptional()
  iconHint?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class DowJonesRiskEntityAttributes {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  primaryName?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  countryTerritoryCode?: string;

  @IsString()
  @IsOptional()
  countryTerritoryName?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsOptional()
  isSubsidiary?: boolean;

  @IsString()
  @IsOptional()
  score?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DateOfBirth)
  dateOfBirth?: DateOfBirth[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IconHints)
  iconHints?: IconHints[];
}

export class DowJonesRiskEntityDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DowJonesRiskEntityAttributes)
  attributes?: DowJonesRiskEntityAttributes;
}
