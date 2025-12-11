import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { OffersModule } from '../offers/offers.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [OffersModule, MessagesModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
