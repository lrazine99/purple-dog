import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemPhotoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  is_primary: boolean;
}

export class ItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  seller_id: number;

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  width_cm: number;

  @ApiProperty()
  height_cm: number;

  @ApiProperty()
  depth_cm: number;

  @ApiProperty()
  weight_kg: number;

  @ApiProperty()
  price_desired: number;

  @ApiProperty()
  price_min: number;

  @ApiProperty()
  sale_mode: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  auction_start_price?: number;

  @ApiProperty({ required: false })
  auction_end_date?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional({ type: [ItemPhotoResponseDto] })
  photos?: ItemPhotoResponseDto[];
}
