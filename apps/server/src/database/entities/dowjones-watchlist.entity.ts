import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

@Entity('watchlist')
export class Watchlist {
  @PrimaryGeneratedColumn() // Auto-incrementing primary key
  id: number; // ID (no need for undefined here)

  @Column({ name: 'ckyc_id', type: 'varchar', length: 255, nullable: true })
  ckyc_id?: string; // KYC ID (optional)

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  last_name?: string; // Last Name (optional)

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  first_name?: string; // First Name (optional)

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middle_name?: string; // Middle Name (optional)

  @Column({
    name: 'primary_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  primary_name?: string; // Primary Name (optional)

  @Column({ name: 'title', type: 'varchar', length: 100, nullable: true })
  title?: string; // Title (optional)

  @Column({
    name: 'country_territory_code',
    type: 'char',
    length: 5,
    nullable: true,
  })
  country_territory_code?: string; // Country/Territory Code (optional)

  @Column({
    name: 'country_territory_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country_territory_name?: string; // Country/Territory Name (optional)

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender; // Gender (optional)

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  score?: number; // Score (optional)

  @Column({ name: 'birth_date', type: 'varchar', length: 100, nullable: true })
  birth_date?: string; // Birth Date (optional)

  @Column({ name: 'icon_hints', type: 'varchar', length: 255, nullable: true })
  icon_hints?: string; // Icon Hints (optional)

  @Column({ name: 'dow_jones_id', type: 'int', nullable: true })
  dow_jones_id?: number; // Dow Jones ID (optional)

  @Column({ name: 'created_date', type: 'datetime', nullable: true })
  created_date?: Date; // Created Date (optional)

  @Column({ name: 'created_by', type: 'varchar', length: 255, nullable: true })
  created_by?: string; // Created By (optional)

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string; // Remarks (optional)
}
