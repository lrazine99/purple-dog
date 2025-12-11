import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { Bid } from './entities/bid.entity';
import { Item } from '../items/entities/item.entity';
import { EmailService } from '../common/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Item])],
  controllers: [BidsController],
  providers: [BidsService, EmailService],
  exports: [BidsService],
})
export class BidsModule {}

