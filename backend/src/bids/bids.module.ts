import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { AuctionFinalizationService } from './auction-finalization.service';
import { Bid } from './entities/bid.entity';
import { Item } from '../items/entities/item.entity';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Item]),
    ItemsModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [BidsController],
  providers: [BidsService, AuctionFinalizationService, EmailService],
  exports: [BidsService],
})
export class BidsModule {}
