import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/entity-repository/user-repository';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: UserRepository,
  ) {}

  // async register(createUserDto: CreateUserDto): Promise<Users> {
  //   const { email, password, name } = createUserDto;

  //   const existingUser = await this.userRepository.findOne({
  //     where: { email },
  //   });
  //   if (existingUser) {
  //     throw new ConflictException('User with this email already exists.');
  //   }

  //   // Hash the password
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   // Create a new user
  //   const newUser = this.userRepository.create({
  //     name,
  //     email,
  //     password: hashedPassword,
  //   });

  //   // Save the user to the database
  //   return this.userRepository.save(newUser);
  // }
}
