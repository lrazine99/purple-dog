import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  PlanType,
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20' as any,
      });
    }
  }

  async createTrialSubscription(userId: number): Promise<Subscription> {
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const subscription = this.subscriptionRepository.create({
      user_id: userId,
      plan_type: PlanType.FREE_TRIAL,
      status: SubscriptionStatus.ACTIVE,
      price: 0,
      trial_start_date: now,
      trial_end_date: trialEndDate,
      next_billing_date: trialEndDate,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async checkSubscriptionStatus(
    userId: number,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    if (
      subscription.plan_type === PlanType.FREE_TRIAL &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      const now = new Date();
      if (subscription.trial_end_date && now > subscription.trial_end_date) {
        subscription.status = SubscriptionStatus.PENDING_PAYMENT;
        await this.subscriptionRepository.save(subscription);
      }
    }

    return this.toResponseDto(subscription);
  }

  async expireTrialSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    subscription.status = SubscriptionStatus.PENDING_PAYMENT;
    return await this.subscriptionRepository.save(subscription);
  }

  async activatePaidSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    subscription.plan_type = PlanType.PAID;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.price = 49.0;
    subscription.next_billing_date = nextBillingDate;

    return await this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionByUserId(
    userId: number,
  ): Promise<SubscriptionResponseDto | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      return null;
    }

    return this.toResponseDto(subscription);
  }

  async createSubscriptionCheckout(
    userId: number,
  ): Promise<{ checkoutUrl: string }> {
    // Vérifier que l'utilisateur existe et est professionnel
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role !== 'professional') {
      throw new BadRequestException(
        'Only professional users can subscribe to paid plans',
      );
    }

    // Vérifier que l'utilisateur a une subscription, sinon en créer une
    let subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      // Créer automatiquement une subscription de trial si elle n'existe pas
      subscription = await this.createTrialSubscription(userId);
    }

    // Vérifier que l'utilisateur n'est pas déjà sur un plan payant actif
    if (
      subscription.plan_type === PlanType.PAID &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      throw new BadRequestException('You are already on a paid plan');
    }

    // Vérifier que Stripe est configuré
    if (!this.stripe) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not configured. Please set the STRIPE_SECRET_KEY environment variable.',
      );
    }

    // Créer ou récupérer le client Stripe
    let stripeCustomerId: string;

    try {
      // Chercher un customer_id existant dans les paiements précédents
      const existingCustomer = await this.stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomer.data.length > 0) {
        stripeCustomerId = existingCustomer.data[0].id;
      } else {
        // Créer un nouveau client Stripe
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          metadata: {
            user_id: userId.toString(),
          },
        });
        stripeCustomerId = customer.id;
      }
    } catch (error) {
      console.error('Stripe customer creation/retrieval error:', error);
      throw new InternalServerErrorException(
        `Failed to create or retrieve Stripe customer: ${error.message || 'Unknown error'}`,
      );
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successUrl = `${frontendUrl}/abonnement/verification?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/abonnement?canceled=true`;

    // Récupérer le Price ID depuis les variables d'environnement
    let priceId = this.config.get<string>('STRIPE_PRICE_ID');

    // Si pas de Price ID, essayer de récupérer depuis le Product ID
    if (!priceId) {
      const productId = this.config.get<string>('STRIPE_PRODUCT_ID');

      if (!productId) {
        throw new InternalServerErrorException(
          'Either STRIPE_PRICE_ID or STRIPE_PRODUCT_ID must be configured. Please create a product in Stripe Dashboard and set the price ID or product ID.',
        );
      }

      // Récupérer le prix par défaut du produit
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        throw new InternalServerErrorException(
          `No active price found for product ${productId}. Please create a price in Stripe Dashboard.`,
        );
      }

      priceId = prices.data[0].id;
    }

    // Créer la session de checkout Stripe pour l'abonnement
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId, // Utiliser le Price ID de Stripe
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId.toString(),
          subscription_id: subscription.id.toString(),
        },
      });

      if (!session.url) {
        throw new InternalServerErrorException(
          'Failed to create checkout session: no URL returned',
        );
      }

      return {
        checkoutUrl: session.url,
      };
    } catch (error) {
      console.error('Stripe checkout session creation error:', error);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create checkout session: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private toResponseDto(subscription: Subscription): SubscriptionResponseDto {
    return {
      id: subscription.id,
      plan_type: subscription.plan_type,
      status: subscription.status,
      price: Number(subscription.price),
      trial_start_date: subscription.trial_start_date,
      trial_end_date: subscription.trial_end_date,
      next_billing_date: subscription.next_billing_date,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
    };
  }
}
