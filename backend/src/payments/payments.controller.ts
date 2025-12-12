import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ConfigService } from '@nestjs/config';
import type { RequestWithUser } from '../common/types/request.types';

interface RawBodyRequest extends RequestWithUser {
  rawBody: Buffer;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Checkout Session created',
    type: PaymentResponseDto,
  })
  async create(
    @Body() dto: CreatePaymentDto,
    @Req() req: RequestWithUser,
  ): Promise<PaymentResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    const { payment, checkoutUrl } =
      await this.paymentsService.createCheckoutSession(dto, userId);
    return PaymentResponseDto.fromEntity(payment, checkoutUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a Stripe Checkout Session after redirection' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment verified',
    type: PaymentResponseDto,
  })
  async verify(
    @Body() dto: VerifyPaymentDto,
    @Req() req: RequestWithUser,
  ): Promise<{ verified: boolean; payment: PaymentResponseDto }> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    const { verified, payment } = await this.paymentsService.verifyPayment(
      dto,
      userId,
    );
    return {
      verified,
      payment: PaymentResponseDto.fromEntity(payment),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all payments for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
    type: [PaymentResponseDto],
  })
  async findAll(@Req() req: RequestWithUser): Promise<PaymentResponseDto[]> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    const payments = await this.paymentsService.findAll(userId);
    return payments.map((p) => PaymentResponseDto.fromEntity(p));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: PaymentResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<PaymentResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    const payment = await this.paymentsService.findOne(id, userId);
    if (!payment) {
      throw new Error(`Payment ${id} not found`);
    }
    return PaymentResponseDto.fromEntity(payment);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by Order ID' })
  @ApiParam({ name: 'orderId', type: 'number', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found for order',
    type: PaymentResponseDto,
  })
  async findByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: RequestWithUser,
  ): Promise<PaymentResponseDto | null> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    const payment = await this.paymentsService.findByOrderId(orderId, userId);
    if (!payment) {
      return null;
    }
    const checkoutUrl = payment.stripe_checkout_session_id
      ? await this.paymentsService.getCheckoutUrl(payment.id, userId)
      : null;
    return PaymentResponseDto.fromEntity(payment, checkoutUrl || undefined);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint (no auth required)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    const nodeEnv = this.config.get<string>('NODE_ENV') || 'development';
    const allowLocalTest =
      this.config.get<string>('STRIPE_ALLOW_LOCAL_TEST') === 'true';

    let event: Stripe.Event;

    // Mode test local : accepter les événements sans signature si configuré
    if (nodeEnv === 'development' && allowLocalTest && !webhookSecret) {
      console.warn(
        '⚠️  Mode test local activé - Vérification de signature désactivée',
      );
      // Pour les tests locaux, on peut accepter les événements directement
      // mais en production, la signature est obligatoire
      throw new BadRequestException(
        'Webhook secret required even in development mode',
      );
    }

    // Mode production : vérification de signature obligatoire
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    if (!signature) {
      throw new Error('stripe-signature header is required');
    }

    try {
      // Verify webhook signature using Stripe
      const stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
        apiVersion: '2024-06-20' as any,
      });
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    await this.paymentsService.handleWebhook(event);

    return { received: true };
  }
}

