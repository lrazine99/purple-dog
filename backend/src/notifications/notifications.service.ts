import { Injectable } from '@nestjs/common';
import { OffersService } from '../offers/offers.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly offersService: OffersService,
    private readonly messagesService: MessagesService,
  ) {}

  async getSellerCounters(sellerId: number) {
    const newOffers = await this.offersService.countNewForSeller(sellerId);
    const unreadMessages = await this.messagesService.countUnread(sellerId);
    return { newOffers, unreadMessages };
  }
}
