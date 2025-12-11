import {
  Controller,
  Get,
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
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
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
}
