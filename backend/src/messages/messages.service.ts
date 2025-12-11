import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/email.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async send(item_id: number, sender_id: number, receiver_id: number, content: string): Promise<Message> {
    const msg = this.messageRepo.create({ item_id, sender_id, receiver_id, content, is_read: false });
    const saved = await this.messageRepo.save(msg);
    const receiver = await this.userRepo.findOne({ where: { id: receiver_id } });
    if (receiver?.email) {
      await this.emailService.sendMail(
        receiver.email,
        'Nouveau message reçu',
        `Vous avez reçu un nouveau message à propos de l’objet #${item_id}.\n\n${content}`
      );
    }
    return saved;
  }

  async listByItem(itemId: number): Promise<Message[]> {
    return this.messageRepo.find({ where: { item_id: itemId }, order: { created_at: 'DESC' } });
  }

  async listForUser(userId: number): Promise<Message[]> {
    return this.messageRepo.find({ where: { receiver_id: userId }, order: { created_at: 'DESC' } });
  }

  async markRead(id: number): Promise<Message> {
    const msg = await this.messageRepo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException(`Message ${id} not found`);
    msg.is_read = true;
    return this.messageRepo.save(msg);
  }

  async countUnread(userId: number): Promise<number> {
    return this.messageRepo.count({ where: { receiver_id: userId, is_read: false } });
  }
}
