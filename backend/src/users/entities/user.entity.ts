import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PARTICULAR = 'particular',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.PARTICULAR,
  })
  role: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  first_name: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  last_name: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password_hash: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address_line: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postal_code: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  website_company: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  items_preference: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  speciality: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profile_picture: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  newsletter: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  rgpd_accepted: boolean;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  company_name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  siret: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  official_document_url: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  cgv_accepted: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
