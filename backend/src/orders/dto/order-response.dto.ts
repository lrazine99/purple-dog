import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  buyer_id: number;

  @ApiProperty()
  seller_id: number;

  @ApiProperty()
  total_amount: string;

  @ApiProperty({ enum: OrderStatus })
  status: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  created_at: Date;
}
