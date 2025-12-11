import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, Payment } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ description: 'ID du paiement' })
  id: number;

  @ApiProperty({ description: 'ID de la commande associée' })
  order_id: number;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  user_id: number;

  @ApiProperty({
    description: 'ID du Payment Intent Stripe',
    nullable: true,
  })
  stripe_payment_intent_id?: string;

  @ApiProperty({
    description: 'ID de la Checkout Session Stripe',
    nullable: true,
  })
  stripe_checkout_session_id?: string;

  @ApiProperty({
    description: 'ID du client Stripe',
    nullable: true,
  })
  stripe_customer_id?: string;

  @ApiProperty({ description: 'Montant du paiement' })
  amount: string;

  @ApiProperty({ description: 'Devise du paiement' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Statut du paiement' })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Indique si le paiement a déjà été utilisé (évite les doubles traitements)',
    default: false,
  })
  is_used: boolean;

  @ApiProperty({
    description: 'URL de redirection vers Stripe Checkout',
    nullable: true,
  })
  checkout_url?: string;

  @ApiProperty({ description: 'Date de création' })
  created_at: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updated_at: Date;

  static fromEntity(
    entity: Payment,
    checkoutUrl?: string,
  ): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = entity.id;
    dto.order_id = entity.order_id;
    dto.user_id = entity.user_id;
    dto.stripe_payment_intent_id = entity.stripe_payment_intent_id;
    dto.stripe_checkout_session_id = entity.stripe_checkout_session_id;
    dto.stripe_customer_id = entity.stripe_customer_id || undefined;
    dto.amount = entity.amount;
    dto.currency = entity.currency;
    dto.status = entity.status as PaymentStatus;
    dto.is_used = entity.is_used;
    dto.checkout_url = checkoutUrl;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    return dto;
  }
}

