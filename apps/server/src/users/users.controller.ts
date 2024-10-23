import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth-guard/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(AuthGuard)
@Controller('account')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
