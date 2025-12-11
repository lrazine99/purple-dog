import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get counters for seller notifications' })
  @ApiQuery({ name: 'sellerId', type: Number })
  @ApiResponse({ status: 200, schema: { properties: { newOffers: { type: 'number' }, unreadMessages: { type: 'number' } } } })
  async getCounters(@Query('sellerId') sellerId: string) {
    const id = parseInt(sellerId, 10);
    return this.notificationsService.getSellerCounters(id);
  }
}
