import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

  @IsString()
  @IsNotEmpty()
  email: string | undefined;
}
