import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // Import your DTO

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ email: string; token: string }> {
    const userCredentials = await this.authService.login(loginDto);

    return userCredentials;
  }

  @Get('check-token')
  async checkToken(@Headers('Authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }
    const token = authHeader.split(' ')[1];
    return await this.authService.validity(token);
  }
}
