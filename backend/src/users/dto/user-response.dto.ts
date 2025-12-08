import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  role: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  address_line?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  postal_code?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  website_company?: string;

  @ApiProperty({ required: false })
  items_preference?: string;

  @ApiProperty({ required: false })
  speciality?: string;

  @ApiProperty({ required: false })
  profile_picture?: string;

  @ApiProperty()
  newsletter: boolean;

  @ApiProperty()
  rgpd_accepted: boolean;

  @ApiProperty({ required: false })
  company_name?: string;

  @ApiProperty({ required: false })
  siret?: string;

  @ApiProperty({ required: false })
  official_document_url?: string;

  @ApiProperty()
  cgv_accepted: boolean;

  @ApiProperty()
  is_verified: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

