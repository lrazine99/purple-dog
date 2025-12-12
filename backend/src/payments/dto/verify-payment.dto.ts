import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'ID de la session de checkout Stripe' })
  @IsString()
  checkout_session_id: string;
}

