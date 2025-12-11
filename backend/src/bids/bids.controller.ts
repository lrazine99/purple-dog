import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidResponseDto } from './dto/bid-response.dto';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('items/:itemId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a bid on an item' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiBody({ type: CreateBidDto })
  @ApiResponse({
    status: 201,
    description: 'Bid placed successfully',
    type: BidResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid bid amount' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async createBid(
    @Req() req: any,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CreateBidDto,
  ): Promise<BidResponseDto> {
    return this.bidsService.createBid(req.user.sub, itemId, dto);
  }

  @Get('items/:itemId')
  @ApiOperation({ summary: 'Get all bids for an item' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'List of bids',
    type: [BidResponseDto],
  })
  async getItemBids(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<BidResponseDto[]> {
    return this.bidsService.getItemBids(itemId);
  }

  @Get('items/:itemId/winning')
  @ApiOperation({ summary: 'Get current winning bid for an item' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Current winning bid',
    type: BidResponseDto,
  })
  async getCurrentWinningBid(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<BidResponseDto | null> {
    return this.bidsService.getCurrentWinningBid(itemId);
  }

  @Get('my-bids')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bids by current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user bids',
    type: [BidResponseDto],
  })
  async getUserBids(@Req() req: any): Promise<BidResponseDto[]> {
    return this.bidsService.getUserBids(req.user.sub);
  }
}

