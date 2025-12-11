import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/email.service';
import { MessagesModule } from '../messages/messages.module';
import { StripeService } from '../payments/stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Item, User]), MessagesModule],
  providers: [OffersService, EmailService, StripeService],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
