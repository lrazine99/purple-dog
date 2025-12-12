import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type CreateCheckoutParams = {
  amount: number;
  currency: 'eur' | 'usd';
  itemId: number;
  offerId: number;
  sellerId: number;
  buyerId: number;
  description?: string;
};

@Injectable()
export class StripeService {
  private stripe: any;

  constructor(private readonly config: ConfigService) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (secret) {
      // Lazy require to avoid hard dependency if not installed yet
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      this.stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });
    }
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe non configuré. Définissez STRIPE_SECRET_KEY et installez le paquet stripe.');
    }
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/paiement/offre/verification?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/paiement/offre/${params.offerId}?canceled=true`;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency,
            unit_amount: Math.round(params.amount * 100),
            product_data: {
              name: params.description || `Objet #${params.itemId}`,
            },
          },
        },
      ],
      metadata: {
        offerId: String(params.offerId),
        itemId: String(params.itemId),
        sellerId: String(params.sellerId),
        buyerId: String(params.buyerId),
      },
    });

    return session.url;
  }
}
