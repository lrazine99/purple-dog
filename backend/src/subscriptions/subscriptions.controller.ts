import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  private stripe: Stripe | null = null;

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20' as any,
      });
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No subscription found',
  })
  async getMySubscription(
    @Request() req,
  ): Promise<SubscriptionResponseDto | null> {
    const userId = req.user.sub;
    return this.subscriptionsService.getSubscriptionByUserId(userId);
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check subscription status (auto-expires if needed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status checked',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No subscription found',
  })
  async checkMySubscriptionStatus(
    @Request() req,
  ): Promise<SubscriptionResponseDto> {
    const userId = req.user.sub;
    return this.subscriptionsService.checkSubscriptionStatus(userId);
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe checkout session for subscription' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request (already on paid plan or not professional)',
  })
  @ApiResponse({
    status: 404,
    description: 'User or subscription not found',
  })
  async createCheckoutSession(
    @Request() req,
  ): Promise<{ checkoutUrl: string }> {
    const userId = req.user.sub;
    return this.subscriptionsService.createSubscriptionCheckout(userId);
  }

  @Post('verify-payment-simple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify payment and activate subscription (no auth)',
  })
  async verifyPaymentSimple(@Request() req): Promise<{ success: boolean; message?: string }> {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return { success: false, message: 'Session ID is required' };
    }

    if (!this.stripe) {
      return { success: false, message: 'STRIPE_SECRET_KEY is not configured' };
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        return { success: false, message: 'Session not found' };
      }

      // Vérifier que c'est bien une session d'abonnement
      if (session.mode !== 'subscription') {
        return { success: false, message: 'Invalid session mode' };
      }

      // Vérifier le statut du paiement
      if (session.payment_status !== 'paid') {
        return { 
          success: false, 
          message: `Payment status is ${session.payment_status}, expected 'paid'` 
        };
      }

      // Vérifier que les métadonnées contiennent l'user_id
      if (!session.metadata?.user_id) {
        return { success: false, message: 'User ID not found in session metadata' };
      }

      const userId = parseInt(session.metadata.user_id, 10);
      
      if (isNaN(userId)) {
        return { success: false, message: 'Invalid user ID in session metadata' };
      }

      await this.subscriptionsService.activatePaidSubscription(userId);
      return { success: true };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during verification' 
      };
    }
  }

  @Post('cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel user subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelMySubscription(@Request() req): Promise<{ success: boolean }> {
    const userId = req.user.sub;
    await this.subscriptionsService.cancelSubscription(userId);
    return { success: true };
  }
}
