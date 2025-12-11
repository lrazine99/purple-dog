import { Injectable } from '@nestjs/common';

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

  constructor() {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (secret) {
      // Lazy require to avoid hard dependency if not installed yet
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      this.stripe = new Stripe(secret, { apiVersion: '2024-11-20' });
    }
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe non configuré. Définissez STRIPE_SECRET_KEY et installez le paquet stripe.');
    }
    const successUrl = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3001/paiement/success';
    const cancelUrl = process.env.STRIPE_CANCEL_URL || 'http://localhost:3001/paiement/cancel';

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
