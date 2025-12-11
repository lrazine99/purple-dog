import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  providers: [MessagesService, EmailService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
