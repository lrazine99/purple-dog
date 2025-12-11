import { ApiProperty } from '@nestjs/swagger';
import { OfferStatus } from '../entities/offer.entity';

export class OfferResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() item_id: number;
  @ApiProperty() buyer_id: number;
  @ApiProperty() seller_id: number;
  @ApiProperty() amount: string;
  @ApiProperty({ enum: OfferStatus }) status: string;
  @ApiProperty({ required: false }) message?: string;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
