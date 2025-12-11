import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  item_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  buyer_id: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
