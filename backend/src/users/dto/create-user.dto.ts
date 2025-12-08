import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ enum: UserRole, default: UserRole.PARTICULAR })
  @IsEnum(UserRole)
  @IsOptional()
  role?: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address_line?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  website_company?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  items_preference?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  speciality?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profile_picture?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  newsletter?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  rgpd_accepted?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  siret?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  official_document_url?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  cgv_accepted?: boolean;
}
