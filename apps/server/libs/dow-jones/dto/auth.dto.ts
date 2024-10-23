import { IsOptional, IsString } from 'class-validator';

export class AuthNResponseDto {
  @IsString()
  @IsOptional()
  id_token?: string;

  @IsString()
  @IsOptional()
  access_token?: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;

  @IsString()
  @IsOptional()
  token_type?: string;
}

export class AuthNDto {
  @IsString()
  @IsOptional()
  client_id?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  connection?: string;

  @IsString()
  @IsOptional()
  grant_type?: string;

  @IsString()
  @IsOptional()
  scope?: string;
}

export class AuthZResponseDto {
  @IsString()
  @IsOptional()
  access_token?: string;

  @IsString()
  @IsOptional()
  token_type?: string;

  @IsString()
  @IsOptional()
  expires_in?: number;
}

export class AuthZDto {
  @IsString()
  @IsOptional()
  assertion?: string;

  @IsString()
  @IsOptional()
  client_id?: string;

  @IsString()
  @IsOptional()
  grant_type?: string;

  @IsString()
  @IsOptional()
  scope?: string;
}
