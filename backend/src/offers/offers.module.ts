import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Offer } from './entities/offer.entity';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/email.service';
import { MessagesModule } from '../messages/messages.module';
import { OrdersModule } from '../orders/orders.module';
import { StripeService } from '../payments/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Item, User]),
    MessagesModule,
    OrdersModule,
    ConfigModule,
  ],
  providers: [OffersService, EmailService, StripeService],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
