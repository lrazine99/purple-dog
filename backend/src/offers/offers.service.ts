import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer, OfferStatus } from './entities/offer.entity';
import { Item, ItemStatus } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/email.service';
import { MessagesService } from '../messages/messages.service';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../payments/stripe.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private readonly offerRepo: Repository<Offer>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly messagesService: MessagesService,
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateOfferDto): Promise<Offer> {
    const item = await this.itemRepo.findOne({
      where: { id: dto.item_id },
      relations: ['seller'],
    });
    if (!item) throw new NotFoundException(`Item ${dto.item_id} not found`);

    const offer = this.offerRepo.create({
      item_id: item.id,
      buyer_id: dto.buyer_id,
      seller_id: item.seller_id,
      amount: Number(dto.amount).toFixed(2),
      message: dto.message ?? null,
      status: OfferStatus.PENDING,
    });

    const saved = await this.offerRepo.save(offer);

    if (item.seller?.email) {
      await this.emailService.sendMail(
        item.seller.email,
        'Nouvelle offre reçue',
        `Vous avez reçu une nouvelle offre de ${saved.amount}€ pour l’objet "${item.name}".`,
      );
    }

    return saved;
  }

  async listByItem(itemId: number): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { item_id: itemId },
      order: { created_at: 'DESC' },
      relations: ['item'],
    });
  }

  async listBySeller(sellerId: number): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { seller_id: sellerId },
      order: { created_at: 'DESC' },
      relations: ['item'],
    });
  }

  async listByBuyer(buyerId: number): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { buyer_id: buyerId },
      order: { created_at: 'DESC' },
      relations: ['item'],
    });
  }

  async updateStatus(offerId: number, status: OfferStatus): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException(`Offer ${offerId} not found`);

    if (status === OfferStatus.REJECTED) {
      offer.status = OfferStatus.REJECTED;
      const saved = await this.offerRepo.save(offer);
      await this.messagesService.send(
        offer.item_id,
        offer.seller_id,
        offer.buyer_id,
        `Votre offre de ${offer.amount}€ a été refusée.`,
      );
      return saved;
    }

    if (status === OfferStatus.ACCEPTED) {
      offer.status = OfferStatus.ACCEPTED;
      const saved = await this.offerRepo.save(offer);

      const sessionUrl = await this.stripeService.createCheckoutSession({
        amount: Number(offer.amount),
        currency: 'eur',
        itemId: offer.item_id,
        offerId: offer.id,
        sellerId: offer.seller_id,
        buyerId: offer.buyer_id,
        description: `Achat de l’objet #${offer.item_id} via offre acceptée`,
      });

      const frontendUrl =
        this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const paymentPage = `${frontendUrl}/paiement/offre/${offer.id}`;

      await this.messagesService.send(
        offer.item_id,
        offer.seller_id,
        offer.buyer_id,
        `Votre offre de ${offer.amount}€ a été acceptée. Payez ici: ${paymentPage}`,
      );

      const buyer = await this.userRepo.findOne({
        where: { id: offer.buyer_id },
      });

      if (buyer?.email) {
        await this.emailService.sendMail(
          buyer.email,
          'Offre acceptée — Procédez au paiement',
          `Votre offre de ${offer.amount}€ a été acceptée.

Rendez-vous sur ${paymentPage} pour procéder au paiement.

Si vous ne pouvez pas accéder à la page, voici un lien Stripe alternatif: ${sessionUrl}`,
        );
      }

      return saved;
    }

    offer.status = status;
    return this.offerRepo.save(offer);
  }

  async countNewForSeller(sellerId: number): Promise<number> {
    return this.offerRepo.count({
      where: { seller_id: sellerId, status: OfferStatus.PENDING },
    });
  }

  async findOne(id: number): Promise<Offer | null> {
    return this.offerRepo.findOne({
      where: { id },
      relations: ['item', 'buyer', 'seller'],
    });
  }

  async createCheckoutLink(offerId: number): Promise<{ url: string }> {
    const offer = await this.offerRepo.findOne({ where: { id: offerId } });
    if (!offer) throw new NotFoundException(`Offer ${offerId} not found`);

    const url = await this.stripeService.createCheckoutSession({
      amount: Number(offer.amount),
      currency: 'eur',
      itemId: offer.item_id,
      offerId: offer.id,
      sellerId: offer.seller_id,
      buyerId: offer.buyer_id,
      description: `Achat de l’objet #${offer.item_id} via offre acceptée`,
    });

    return { url };
  }

  async markItemAsSold(itemId: number, offerId: number): Promise<Item> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);
    
    // Get the offer details to create the order
    const offer = await this.offerRepo.findOne({ 
      where: { id: offerId }
    });
    
    if (!offer) throw new NotFoundException(`Offer ${offerId} not found`);
    
    // Update item status to SOLD
    item.status = ItemStatus.SOLD;
    const updatedItem = await this.itemRepo.save(item);

    // Update the paid offer status to PAID
    await this.offerRepo.update({ id: offerId }, { status: OfferStatus.PAID });

    // Reject all other pending or accepted offers for this item
    await this.offerRepo
      .createQueryBuilder()
      .update(Offer)
      .set({ status: OfferStatus.REJECTED })
      .where('item_id = :itemId', { itemId })
      .andWhere('id != :offerId', { offerId })
      .andWhere('status IN (:...statuses)', { 
        statuses: [OfferStatus.PENDING, OfferStatus.ACCEPTED] 
      })
      .execute();

    // Create an order from the paid offer
    await this.ordersService.createOrderFromOffer({
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      item_id: offer.item_id,
      amount: Number(offer.amount),
      offer_id: offerId,
    });

    return updatedItem;
  }
}
