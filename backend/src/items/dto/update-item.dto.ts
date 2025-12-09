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

export class UpdateItemDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  seller_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  category_id?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width_cm?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height_cm?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  depth_cm?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight_kg?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price_desired?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price_min?: number;

  @ApiProperty({ required: false, enum: SaleMode })
  @IsEnum(SaleMode)
  @IsOptional()
  sale_mode?: string;

  @ApiProperty({ required: false, enum: ItemStatus })
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
}

