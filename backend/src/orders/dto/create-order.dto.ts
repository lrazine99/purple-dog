import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemInput {
  @ApiProperty()
  @IsInt()
  item_id: number;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsInt()
  buyer_id: number;

  @ApiProperty()
  @IsInt()
  seller_id: number;

  @ApiProperty({ type: [OrderItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billing_address_line?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billing_city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billing_postal_code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billing_country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  billing_address_complement?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shipping_address_line?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shipping_city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shipping_postal_code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shipping_country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shipping_address_complement?: string;
}
