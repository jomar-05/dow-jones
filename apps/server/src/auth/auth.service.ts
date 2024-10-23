import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/entity-repository/user-repository';
import { UserDto } from 'src/users/dto/user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: LoginDto): Promise<UserDto> {
    const { email, password } = data;
    const query = `
    CALL admin_login(?, ?)
  `;

    const result = await this.usersRepository.query(query, [email, password]);
    console.log('Query Result:', result);
    const users = result[0];
    console.log('Users:', users);

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find the user by email
    const user = users.find((e: { email: string }) => e.email === email);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user as UserDto; // Return the user data
  }

  async login(data: LoginDto): Promise<{ email: string; token: string }> {
    try {
      const { name, email } = await this.validateUser(data);

      // Using non-null assertion operator
      const payload = { username: name!, email: email! };

      const token = await this.jwtService.signAsync(payload);

      return {
        email: email!,
        token,
      };
    } catch (error) {
      throw new Error('Login failed: ' + error);
    }
  }

  async validity(token: string): Promise<string> {
    let decodedToken = null;
    try {
      decodedToken = await this.jwtService.verifyAsync(token);
      return decodedToken;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return decodedToken;
    }
  }
}
