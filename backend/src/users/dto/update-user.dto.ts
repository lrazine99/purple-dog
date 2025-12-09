import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

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

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  age?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  social_links?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  newsletter?: boolean;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  cgv_accepted?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;
}
