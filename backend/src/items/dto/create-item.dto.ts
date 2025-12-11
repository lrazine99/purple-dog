import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { SaleMode, ItemStatus } from '../entities/item.entity';

export class CreateItemDto {
  @ApiProperty()
  @IsInt()
  seller_id: number;

  @ApiProperty()
  @IsInt()
  category_id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  width_cm: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  height_cm: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  depth_cm: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight_kg: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price_desired: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price_min: number;

  @ApiProperty({ enum: SaleMode })
  @IsEnum(SaleMode)
  sale_mode: string;

  @ApiProperty({ enum: ItemStatus, default: ItemStatus.DRAFT })
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  auction_start_price?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  auction_end_date?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_amount_bid?: number;
}

