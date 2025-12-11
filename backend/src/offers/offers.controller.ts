import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { OfferStatus } from './entities/offer.entity';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

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
}
