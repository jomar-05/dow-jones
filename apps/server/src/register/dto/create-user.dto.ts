import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string | undefined;

  @IsNotEmpty()
  @IsEmail()
  email: string | undefined;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string | undefined;
}
