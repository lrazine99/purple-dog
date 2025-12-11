import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la commande à payer' })
  @IsInt()
  order_id: number;

  @ApiProperty({
    description: 'URL de redirection après succès du paiement',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  success_url?: string;

  @ApiProperty({
    description: 'URL de redirection après annulation du paiement',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  cancel_url?: string;

  @ApiProperty({
    description: 'ID du client Stripe existant (optionnel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_id?: string;
}

