import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/entity-repository/user-repository';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [RegisterController],
  providers: [RegisterService, UserRepository],
  exports: [UserRepository],
})
export class RegisterModule {}
