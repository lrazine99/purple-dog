import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export enum PaymentMethodType {
  CARD = 'card',
  SEPA = 'sepa_debit',
  BOTH = 'both',
}

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

  @ApiProperty({
    description: 'Type de méthode de paiement (card, sepa_debit, both)',
    enum: PaymentMethodType,
    default: PaymentMethodType.BOTH,
    required: false,
  })
  @IsEnum(PaymentMethodType)
  @IsOptional()
  payment_method_type?: PaymentMethodType;
}

