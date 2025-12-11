import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async createCheckoutSession(
    dto: CreatePaymentDto,
    userId: number,
  ): Promise<{ payment: Payment; checkoutUrl: string }> {
    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await this.orderRepo.findOne({
      where: { id: dto.order_id },
      relations: ['buyer', 'seller'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.order_id} not found`);
    }

    if (order.buyer_id !== userId) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.DRAFT && order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order status must be draft or pending_payment, current: ${order.status}`,
      );
    }

    // Vérifier si un paiement existe déjà pour cette commande
    const existingPayment = await this.paymentRepo.findOne({
      where: { order_id: dto.order_id, user_id: userId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('This order has already been paid');
    }

    // Récupérer ou créer un client Stripe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    let stripeCustomerId = dto.customer_id;

    // Si pas de customer_id fourni, chercher dans les paiements précédents
    if (!stripeCustomerId) {
      const previousPayment = await this.paymentRepo.findOne({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      });
      if (previousPayment?.stripe_customer_id) {
        stripeCustomerId = previousPayment.stripe_customer_id;
      }
    }

    // Créer un client Stripe si nécessaire
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          user_id: userId.toString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successUrl =
      dto.success_url ||
      `${frontendUrl}/paiements/verification?checkout_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      dto.cancel_url || `${frontendUrl}/paiements?canceled=true`;

    // Créer la session de checkout Stripe
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: `Commande #${order.id}`,
              description: `Paiement pour la commande ${order.id}`,
            },
            unit_amount: Math.round(parseFloat(order.total_amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: order.id.toString(),
        user_id: userId.toString(),
      },
    });

    // Créer ou mettre à jour l'enregistrement de paiement
    let payment: Payment;
    if (existingPayment) {
      existingPayment.stripe_checkout_session_id = session.id;
      existingPayment.stripe_customer_id = stripeCustomerId || null;
      existingPayment.amount = order.total_amount;
      existingPayment.currency = order.currency;
      existingPayment.status = PaymentStatus.PENDING;
      payment = await this.paymentRepo.save(existingPayment);
    } else {
      payment = this.paymentRepo.create({
        order_id: dto.order_id,
        user_id: userId,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: stripeCustomerId || null,
        amount: order.total_amount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
        is_used: false,
      });
      payment = await this.paymentRepo.save(payment);
    }

    // Mettre à jour le statut de la commande
    await this.orderRepo.update(
      { id: order.id },
      { status: OrderStatus.PENDING_PAYMENT },
    );

    return {
      payment,
      checkoutUrl: session.url as string,
    };
  }

  async verifyPayment(
    dto: VerifyPaymentDto,
    userId: number,
  ): Promise<{ verified: boolean; payment: Payment }> {
    // Récupérer la session Stripe
    const session = await this.stripe.checkout.sessions.retrieve(
      dto.checkout_session_id,
      {
        expand: ['payment_intent'],
      },
    );

    // Vérifier que la session appartient à l'utilisateur
    if (session.metadata?.user_id !== userId.toString()) {
      throw new BadRequestException('This payment does not belong to you');
    }

    // Trouver le paiement correspondant
    const payment = await this.paymentRepo.findOne({
      where: {
        stripe_checkout_session_id: dto.checkout_session_id,
        user_id: userId,
      },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Vérifier le statut de la session
    if (session.status === 'complete' && session.payment_status === 'paid') {
      // Marquer le paiement comme utilisé si pas déjà fait
      if (!payment.is_used) {
        payment.status = PaymentStatus.SUCCEEDED;
        payment.is_used = true;
        if (session.payment_intent) {
          const pi = session.payment_intent as Stripe.PaymentIntent;
          payment.stripe_payment_intent_id = pi.id;
        }
        await this.paymentRepo.save(payment);

        // Mettre à jour le statut de la commande
        if (payment.order) {
          await this.orderRepo.update(
            { id: payment.order_id },
            { status: OrderStatus.PAID_ESCROW },
          );
        }
      }

      return { verified: true, payment };
    }

    // Si le paiement a échoué
    if (session.payment_status === 'unpaid') {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      return { verified: false, payment };
    }

    return { verified: false, payment };
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    // Gérer les événements Stripe (webhooks)
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processCheckoutSession(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentIntent(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.processPaymentFailure(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async processCheckoutSession(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.payment_status === 'paid' && session.metadata?.order_id) {
      const orderId = parseInt(session.metadata.order_id, 10);
      const payment = await this.paymentRepo.findOne({
        where: { stripe_checkout_session_id: session.id },
      });

      if (payment && !payment.is_used) {
        payment.status = PaymentStatus.SUCCEEDED;
        payment.is_used = true;
        if (session.payment_intent) {
          const pi = session.payment_intent as Stripe.PaymentIntent;
          payment.stripe_payment_intent_id = pi.id;
        }
        await this.paymentRepo.save(payment);

        await this.orderRepo.update(
          { id: orderId },
          { status: OrderStatus.PAID_ESCROW },
        );
      }
    }
  }

  private async processPaymentIntent(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (payment && !payment.is_used) {
      payment.status = PaymentStatus.SUCCEEDED;
      payment.is_used = true;
      await this.paymentRepo.save(payment);

      await this.orderRepo.update(
        { id: payment.order_id },
        { status: OrderStatus.PAID_ESCROW },
      );
    }
  }

  private async processPaymentFailure(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
    }
  }

  async findOne(id: number, userId: number): Promise<Payment | null> {
    return this.paymentRepo.findOne({
      where: { id, user_id: userId },
      relations: ['order'],
    });
  }

  async findByOrderId(orderId: number, userId: number): Promise<Payment | null> {
    return this.paymentRepo.findOne({
      where: { order_id: orderId, user_id: userId },
      relations: ['order'],
    });
  }

  async findAll(userId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { user_id: userId },
      relations: ['order'],
      order: { created_at: 'DESC' },
    });
  }

  async getCheckoutUrl(paymentId: number, userId: number): Promise<string | null> {
    const payment = await this.findOne(paymentId, userId);
    if (!payment || !payment.stripe_checkout_session_id) {
      return null;
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(
        payment.stripe_checkout_session_id,
      );
      return session.url || null;
    } catch {
      return null;
    }
  }
}

