import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ type: 'varchar', length: 50 })
  name: string | undefined;

  @Column({ type: 'varchar', length: 50 })
  email: string | undefined;

  @Column({ type: 'varchar', length: 255 })
  password: string | undefined;
}
