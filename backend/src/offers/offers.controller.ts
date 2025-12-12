import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Request } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { OfferStatus } from './entities/offer.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  private stripe: Stripe;

  constructor(
    private readonly offersService: OffersService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-06-20' as any,
      });
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create an offer' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({ status: 201, type: OfferResponseDto })
  async create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Get('/item/:itemId')
  @ApiOperation({ summary: 'List offers for an item' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({ status: 200, type: [OfferResponseDto] })
  async listByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.offersService.listByItem(itemId);
  }

  @Get('/seller/:sellerId')
  @ApiOperation({ summary: 'List offers for a seller' })
  @ApiParam({ name: 'sellerId', type: 'number' })
  @ApiResponse({ status: 200, type: [OfferResponseDto] })
  async listBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.offersService.listBySeller(sellerId);
  }

  @Get('/buyer/:buyerId')
  @ApiOperation({ summary: 'List offers for a buyer' })
  @ApiParam({ name: 'buyerId', type: 'number' })
  @ApiResponse({ status: 200, type: [OfferResponseDto] })
  async listByBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
    return this.offersService.listByBuyer(buyerId);
  }

  @Patch('/:id/status')
  @ApiOperation({ summary: 'Update offer status' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ schema: { properties: { status: { enum: Object.values(OfferStatus) } } } })
  @ApiResponse({ status: 200, type: OfferResponseDto })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: OfferStatus }) {
    return this.offersService.updateStatus(id, body.status);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get offer details' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: OfferResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne(id);
  }

  @Post('/:id/checkout')
  @ApiOperation({ summary: 'Create checkout session for offer' })
  @ApiParam({ name: 'id', type: 'number' })
  async createCheckout(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.createCheckoutLink(id);
  }

  @Post('/verify-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify offer payment (no auth)' })
  async verifyPayment(@Request() req): Promise<{ success: boolean; message?: string }> {
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return { success: false, message: 'Session ID is required' };
    }

    if (!this.stripe) {
      return { success: false, message: 'Stripe not configured' };
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        return { success: false, message: 'Session not found' };
      }

      // Vérifier que c'est bien une session de paiement
      if (session.mode !== 'payment') {
        return { success: false, message: 'Invalid session mode' };
      }

      // Vérifier le statut du paiement
      if (session.payment_status !== 'paid') {
        return { 
          success: false, 
          message: `Payment status is ${session.payment_status}, expected 'paid'` 
        };
      }

      // Vérifier que les métadonnées contiennent l'offerId
      if (!session.metadata?.offerId) {
        return { success: false, message: 'Offer ID not found in session metadata' };
      }

      const offerId = parseInt(session.metadata.offerId, 10);
      
      if (isNaN(offerId)) {
        return { success: false, message: 'Invalid offer ID in session metadata' };
      }

      // Mark the item as sold and update offer status
      const offer = await this.offersService.findOne(offerId);
      if (offer) {
        await this.offersService.markItemAsSold(offer.item_id, offerId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying offer payment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during verification' 
      };
    }
  }
}
