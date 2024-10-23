import { Users } from 'src/database/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Users)
export class UserRepository extends Repository<Users> {}
