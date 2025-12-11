import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EmailService } from '../common/email.service';
import { Item } from '../items/entities/item.entity';
import { BidResponseDto } from './dto/bid-response.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { Bid, BidType } from './entities/bid.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Calcule le palier d'enchère selon le prix
   */
  private getBidIncrement(price: number): number {
    if (price < 100) return 10;
    if (price < 500) return 50;
    if (price < 1000) return 100;
    if (price < 5000) return 200;
    return 500; // Pour les objets de plus de 5000€
  }

  /**
   * Calcule le prochain montant d'enchère valide (strictement supérieur)
   */
  private getNextBidAmount(currentAmount: number): number {
    const increment = this.getBidIncrement(currentAmount);
    const nextAmount = Math.ceil(currentAmount / increment) * increment;
    // Si le montant calculé est égal au montant actuel, ajouter l'incrément
    return nextAmount <= currentAmount ? currentAmount + increment : nextAmount;
  }

  /**
   * Récupère l'enchère gagnante actuelle pour un item (méthode privée)
   */
  private async getCurrentWinningBidEntity(
    itemId: number,
  ): Promise<Bid | null> {
    try {
      return await this.bidRepository.findOne({
        where: { item_id: itemId, is_winning: true, is_active: true },
        relations: ['user'],
        order: { amount: 'DESC', created_at: 'DESC' },
      });
    } catch (error) {
      console.error('Error fetching winning bid:', error);
      return null;
    }
  }

  /**
   * Traite les enchères automatiques après une nouvelle enchère (dans une transaction)
   */
  private async processAutoBidsInTransaction(
    manager: any,
    itemId: number,
    newBidAmount: number,
  ): Promise<void> {
    const bidRepo = manager.getRepository(Bid);

    const autoBids = await bidRepo.find({
      where: {
        item_id: itemId,
        type: BidType.AUTO,
        is_active: true,
        is_winning: false,
      },
      relations: ['user'],
      order: { max_amount: 'DESC', created_at: 'ASC' },
    });

    let currentAmount = newBidAmount;
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      for (const autoBid of autoBids) {
        if (!autoBid.max_amount || autoBid.max_amount <= currentAmount) {
          continue;
        }

        // Calculer le prochain montant selon les paliers
        let increment: number;
        if (currentAmount < 100) increment = 10;
        else if (currentAmount < 500) increment = 50;
        else if (currentAmount < 1000) increment = 100;
        else if (currentAmount < 5000) increment = 200;
        else increment = 500;

        const nextBidByIncrement =
          Math.ceil(currentAmount / increment) * increment;

        // Déterminer le montant à utiliser :
        // 1. Si le palier suivant est <= max_amount, utiliser le palier
        // 2. Sinon, si max_amount > currentAmount, utiliser max_amount comme prix libre
        let nextAmount: number;
        if (nextBidByIncrement <= autoBid.max_amount) {
          // Utiliser le palier
          nextAmount = nextBidByIncrement;
        } else if (autoBid.max_amount > currentAmount) {
          // Utiliser le montant libre (max_amount) si le palier dépasse le max
          nextAmount = autoBid.max_amount;
        } else {
          // Le max_amount n'est pas suffisant
          continue;
        }

        if (nextAmount > currentAmount) {
          // Créer une nouvelle enchère automatique
          const newAutoBid = bidRepo.create({
            item_id: itemId,
            user_id: autoBid.user_id,
            amount: nextAmount,
            max_amount: autoBid.max_amount,
            type: BidType.AUTO,
            is_active: true,
            is_winning: true,
          });

          // Désactiver l'ancienne enchère automatique
          autoBid.is_active = false;
          autoBid.is_winning = false;

          await bidRepo.save([autoBid, newAutoBid]);

          // Désactiver l'enchère précédente
          const previousWinning = await bidRepo.findOne({
            where: { item_id: itemId, is_winning: true },
          });

          if (previousWinning && previousWinning.id !== newAutoBid.id) {
            previousWinning.is_winning = false;
            await bidRepo.save(previousWinning);
          }

          currentAmount = nextAmount;
          hasChanges = true;

          // Envoyer une notification si le palier max est proche
          if (autoBid.max_amount - nextAmount <= increment) {
            await this.emailService.sendMail(
              autoBid.user.email,
              'Votre enchère automatique atteint son maximum',
              `Votre enchère automatique pour l'objet a atteint ${nextAmount}€ sur ${autoBid.max_amount}€. Une nouvelle enchère pourrait vous dépasser.`,
            );
          }

          break; // Traiter une enchère à la fois
        }
      }
    }
  }

  /**
   * Traite les enchères automatiques après une nouvelle enchère (méthode publique pour les appels externes)
   */
  private async processAutoBids(
    itemId: number,
    newBidAmount: number,
  ): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      await this.processAutoBidsInTransaction(manager, itemId, newBidAmount);
    });
  }

  async createBid(
    userId: number,
    itemId: number,
    dto: CreateBidDto,
  ): Promise<BidResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.sale_mode !== 'auction') {
      throw new BadRequestException('Item is not available for auction');
    }

    if (item.status !== 'published') {
      throw new BadRequestException('Item is not published');
    }

    if (item.seller_id === userId) {
      throw new BadRequestException('Cannot bid on your own item');
    }

    // Utiliser une transaction pour garantir la cohérence
    return await this.dataSource.transaction(async (manager) => {
      const bidRepo = manager.getRepository(Bid);
      const itemRepo = manager.getRepository(Item);

      const currentWinning = await bidRepo.findOne({
        where: { item_id: itemId, is_winning: true, is_active: true },
        order: { amount: 'DESC' },
      });

      const suggestedBidAmount = currentWinning
        ? this.getNextBidAmount(currentWinning.amount)
        : item.auction_start_price || item.price_min || 0;

      // Montant minimum absolu : soit le palier suggéré, soit 1€ de plus que la dernière enchère
      const absoluteMinAmount = currentWinning
        ? Math.max(suggestedBidAmount, currentWinning.amount + 1)
        : suggestedBidAmount;

      // Une enchère doit être strictement supérieure à la dernière enchère (minimum 1€ de plus)
      if (currentWinning && dto.amount <= currentWinning.amount) {
        throw new BadRequestException(
          `Bid amount must be greater than ${currentWinning.amount}€. Minimum bid is ${absoluteMinAmount.toFixed(2)}€`,
        );
      }

      if (dto.amount < absoluteMinAmount) {
        throw new BadRequestException(
          `Minimum bid amount is ${absoluteMinAmount.toFixed(2)}€ (1€ more than the last bid)`,
        );
      }

      // Désactiver l'enchère gagnante précédente
      if (currentWinning) {
        currentWinning.is_winning = false;
        await bidRepo.save(currentWinning);
      }

      // Créer la nouvelle enchère
      const bid = bidRepo.create({
        item_id: itemId,
        user_id: userId,
        amount: dto.amount,
        max_amount: dto.max_amount || null,
        type: dto.max_amount ? BidType.AUTO : BidType.MANUAL,
        is_active: true,
        is_winning: true,
      });

      const savedBid = await bidRepo.save(bid);

      // Traiter les enchères automatiques dans la même transaction
      await this.processAutoBidsInTransaction(manager, itemId, dto.amount);

      return this.toResponseDto(savedBid);
    });
  }

  async getItemBids(itemId: number): Promise<BidResponseDto[]> {
    const bids = await this.bidRepository.find({
      where: { item_id: itemId, is_active: true },
      order: { amount: 'DESC', created_at: 'DESC' },
    });

    return bids.map((bid) => this.toResponseDto(bid));
  }

  async getUserBids(userId: number): Promise<BidResponseDto[]> {
    const bids = await this.bidRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });

    return bids.map((bid) => this.toResponseDto(bid));
  }

  async getCurrentWinningBid(itemId: number): Promise<BidResponseDto | null> {
    try {
      const bid = await this.getCurrentWinningBidEntity(itemId);
      return bid ? this.toResponseDto(bid) : null;
    } catch (error) {
      console.error('Error in getCurrentWinningBid:', error);
      return null;
    }
  }

  private toResponseDto(bid: Bid): BidResponseDto {
    return {
      id: bid.id,
      item_id: bid.item_id,
      user_id: bid.user_id,
      amount: Number(bid.amount),
      max_amount: bid.max_amount ? Number(bid.max_amount) : null,
      type: bid.type,
      is_active: bid.is_active,
      is_winning: bid.is_winning,
      created_at: bid.created_at,
      updated_at: bid.updated_at,
    };
  }
}
