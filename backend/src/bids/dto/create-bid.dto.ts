import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBidDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  min_amount?: number;
}

