import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/entity-repository/user-repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: UserRepository,
  ) {}
}
