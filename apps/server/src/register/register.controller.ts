import { Controller } from '@nestjs/common';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  // @Post()
  // async createUser(@Body() createUserDto: CreateUserDto) {
  //   return this.registerService.register(createUserDto);
  // }
}
