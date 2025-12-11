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
    itemMinAmountBid: number | null,
  ): Promise<void> {
    const bidRepo = manager.getRepository(Bid);
    const itemRepo = manager.getRepository(Item);

    // Récupérer l'item pour avoir le min_amount_bid
    const item = await itemRepo.findOne({ where: { id: itemId } });
    if (!item || !item.min_amount_bid) {
      return; // Pas d'enchères automatiques si pas de min_amount_bid défini
    }

    const autoBids = await bidRepo.find({
      where: {
        item_id: itemId,
        type: BidType.AUTO,
        is_active: true,
        is_winning: false,
      },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    let currentAmount = newBidAmount;
    let hasChanges = true;

    while (hasChanges) {
      hasChanges = false;

      for (const autoBid of autoBids) {
        // Utiliser le min_amount de l'enchère automatique si défini, sinon le min_amount_bid de l'item
        const maxAmount = autoBid.min_amount || item.min_amount_bid;
        
        // Si aucune limite n'est définie, passer à l'enchère suivante
        if (!maxAmount) {
          continue;
        }

        // L'enchère automatique continue tant que le montant actuel est inférieur au montant maximum
        if (currentAmount >= maxAmount) {
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
        // 1. Si le palier suivant est < maxAmount, utiliser le palier
        // 2. Sinon, utiliser maxAmount directement pour atteindre le maximum
        let nextAmount: number;
        if (nextBidByIncrement < maxAmount) {
          // Utiliser le palier tant qu'on n'a pas atteint le maxAmount
          nextAmount = nextBidByIncrement;
        } else {
          // Atteindre directement le maxAmount
          nextAmount = maxAmount;
        }

        if (nextAmount > currentAmount) {
          // Créer une nouvelle enchère automatique
          const newAutoBid = bidRepo.create({
            item_id: itemId,
            user_id: autoBid.user_id,
            amount: nextAmount,
            min_amount: autoBid.min_amount, // Conserver le min_amount de l'enchère originale
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

          // Envoyer une notification quand le montant maximum est atteint
          if (nextAmount >= maxAmount && autoBid.user?.email) {
            const maxAmountText = autoBid.min_amount 
              ? `votre montant maximum de ${autoBid.min_amount}€`
              : `le montant minimum requis de ${item.min_amount_bid}€`;
            await this.emailService.sendMail(
              autoBid.user.email,
              'Votre enchère automatique a atteint le montant maximum',
              `Votre enchère automatique pour l'objet a atteint ${nextAmount}€, ${maxAmountText}. L'enchère peut maintenant être conclue ou vous pouvez augmenter votre montant maximum.`,
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
    itemMinAmountBid: number | null,
  ): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      await this.processAutoBidsInTransaction(
        manager,
        itemId,
        newBidAmount,
        itemMinAmountBid,
      );
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

      // Déterminer le type d'enchère : AUTO si min_amount est fourni, sinon MANUAL
      const bidType = dto.min_amount ? BidType.AUTO : BidType.MANUAL;

      // Si c'est une enchère automatique, vérifier que min_amount est supérieur à amount
      if (bidType === BidType.AUTO && dto.min_amount && dto.min_amount <= dto.amount) {
        throw new BadRequestException(
          'Le montant maximum pour une enchère automatique doit être supérieur au montant initial',
        );
      }

      // Créer la nouvelle enchère
      const bid = bidRepo.create({
        item_id: itemId,
        user_id: userId,
        amount: dto.amount,
        min_amount: dto.min_amount || null,
        type: bidType,
        is_active: true,
        is_winning: bidType === BidType.MANUAL, // Les enchères auto ne sont pas gagnantes immédiatement
      });

      const savedBid = await bidRepo.save(bid);

      // Traiter les enchères automatiques dans la même transaction
      await this.processAutoBidsInTransaction(
        manager,
        itemId,
        dto.amount,
        item.min_amount_bid,
      );

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

  async getUserBids(userId: number): Promise<any[]> {
    const bids = await this.bidRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['item', 'item.photos', 'item.category'],
      order: { created_at: 'DESC' },
    });

    return bids.map((bid) => ({
      ...this.toResponseDto(bid),
      item: bid.item
        ? {
            id: bid.item.id,
            name: bid.item.name,
            description: bid.item.description,
            auction_start_price: bid.item.auction_start_price
              ? Number(bid.item.auction_start_price)
              : null,
            auction_end_date: bid.item.auction_end_date,
            created_at: bid.item.created_at,
            status: bid.item.status,
            sale_mode: bid.item.sale_mode,
            photos: bid.item.photos || [],
          }
        : null,
    }));
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
      min_amount: bid.min_amount ? Number(bid.min_amount) : null,
      type: bid.type,
      is_active: bid.is_active,
      is_winning: bid.is_winning,
      created_at: bid.created_at,
      updated_at: bid.updated_at,
    };
  }
}
