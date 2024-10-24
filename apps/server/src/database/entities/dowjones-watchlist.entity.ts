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
  ckycId?: string; // KYC ID (optional)

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string; // Last Name (optional)

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string; // First Name (optional)

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string; // Middle Name (optional)

  @Column({
    name: 'primary_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  primaryName?: string; // Primary Name (optional)

  @Column({ name: 'title', type: 'varchar', length: 100, nullable: true })
  title?: string; // Title (optional)

  @Column({
    name: 'country_territory_code',
    type: 'char',
    length: 5,
    nullable: true,
  })
  countryTerritoryCode?: string; // Country/Territory Code (optional)

  @Column({
    name: 'country_territory_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  countryTerritoryName?: string; // Country/Territory Name (optional)

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender; // Gender (optional)

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  score?: number; // Score (optional)

  @Column({ name: 'birth_date', type: 'varchar', length: 100, nullable: true })
  birthDate?: string; // Birth Date (optional)

  @Column({ name: 'icon_hints', type: 'varchar', length: 255, nullable: true })
  iconHints?: string; // Icon Hints (optional)

  @Column({ name: 'dow_jones_id', type: 'int', nullable: true })
  dowJonesId?: number; // Dow Jones ID (optional)

  @Column({ name: 'created_date', type: 'datetime', nullable: true })
  createdDate?: Date; // Created Date (optional)

  @Column({ name: 'created_by', type: 'varchar', length: 255, nullable: true })
  createdBy?: string; // Created By (optional)

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string; // Remarks (optional)
}
