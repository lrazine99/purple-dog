import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, DataSource } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { Bid } from './entities/bid.entity';
import { OrdersService } from '../orders/orders.service';
import { EmailService } from '../common/email.service';

@Injectable()
export class AuctionFinalizationService {
  private readonly logger = new Logger(AuctionFinalizationService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Cron job qui s'exécute toutes les minutes pour vérifier les enchères expirées
   * Format: * * * * * (minute heure jour mois jour-semaine)
   * Pour modifier la fréquence, changer CronExpression.EVERY_MINUTE
   * Exemples: CronExpression.EVERY_5_MINUTES, CronExpression.EVERY_HOUR
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredAuctions() {
    this.logger.log('Vérification des enchères expirées...');
    
    try {
      const now = new Date();
      
      // Trouver tous les items en enchère qui sont expirés et toujours publiés
      const expiredItems = await this.itemRepository.find({
        where: {
          sale_mode: 'auction',
          status: 'published',
        },
        relations: ['seller'],
      });

      const expiredItemsToProcess = expiredItems.filter((item) => {
        if (!item.auction_end_date) return false;
        const endDate = new Date(item.auction_end_date);
        return endDate <= now;
      });

      this.logger.log(
        `${expiredItemsToProcess.length} enchère(s) expirée(s) trouvée(s)`,
      );

      for (const item of expiredItemsToProcess) {
        await this.finalizeAuction(item.id);
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification des enchères expirées: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Finalise une enchère expirée
   * - Trouve l'enchère gagnante
   * - Met toutes les enchères à is_active = false
   * - Crée une commande si une enchère gagnante existe
   * - Met à jour le statut de l'item
   */
  async finalizeAuction(itemId: number): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const itemRepo = manager.getRepository(Item);
      const bidRepo = manager.getRepository(Bid);

      const item = await itemRepo.findOne({
        where: { id: itemId },
        relations: ['seller'],
      });

      if (!item) {
        this.logger.warn(`Item ${itemId} non trouvé`);
        return;
      }

      // Vérifier que l'enchère est bien expirée
      if (item.auction_end_date) {
        const endDate = new Date(item.auction_end_date);
        if (endDate > new Date()) {
          this.logger.warn(
            `L'enchère pour l'item ${itemId} n'est pas encore expirée`,
          );
          return;
        }
      }

      // Trouver l'enchère gagnante
      const winningBid = await bidRepo.findOne({
        where: {
          item_id: itemId,
          is_winning: true,
          is_active: true,
        },
        relations: ['user'],
        order: { amount: 'DESC' },
      });

      // Mettre toutes les enchères de cet item à is_active = false
      await bidRepo.update(
        { item_id: itemId, is_active: true },
        { is_active: false },
      );

      if (winningBid) {
        // Il y a une enchère gagnante, créer une commande
        this.logger.log(
          `Enchère gagnante trouvée pour l'item ${itemId}: ${winningBid.amount}€ par l'utilisateur ${winningBid.user_id}`,
        );

        try {
          // Créer la commande depuis l'enchère gagnante
          await this.createOrderFromWinningBid(winningBid, item);

          // Mettre l'item à "sold"
          item.status = 'sold';
          await itemRepo.save(item);

          // Envoyer une notification email au gagnant
          if (winningBid.user?.email) {
            await this.emailService.sendMail(
              winningBid.user.email,
              'Félicitations ! Vous avez remporté l\'enchère',
              `Vous avez remporté l'enchère pour "${item.name}" avec une offre de ${winningBid.amount}€. Une commande a été créée automatiquement.`,
            );
          }

          // Envoyer une notification email au vendeur
          if (item.seller?.email) {
            await this.emailService.sendMail(
              item.seller.email,
              'Votre enchère s\'est terminée',
              `L'enchère pour "${item.name}" s'est terminée. L'article a été vendu pour ${winningBid.amount}€. Une commande a été créée automatiquement.`,
            );
          }

          this.logger.log(
            `Enchère ${itemId} finalisée avec succès. Commande créée.`,
          );
        } catch (error) {
          this.logger.error(
            `Erreur lors de la création de la commande pour l'enchère ${itemId}: ${error.message}`,
            error.stack,
          );
          // Mettre l'item en erreur plutôt que sold
          item.status = 'draft';
          await itemRepo.save(item);
          throw error;
        }
      } else {
        // Pas d'enchère gagnante, l'enchère se termine sans vente
        this.logger.log(
          `Aucune enchère gagnante pour l'item ${itemId}. L'enchère se termine sans vente.`,
        );

        // Remettre l'item en draft ou un autre statut approprié
        item.status = 'draft';
        await itemRepo.save(item);

        // Notifier le vendeur
        if (item.seller?.email) {
          await this.emailService.sendMail(
            item.seller.email,
            'Votre enchère s\'est terminée sans vente',
            `L'enchère pour "${item.name}" s'est terminée sans enchère gagnante. L'article a été remis en brouillon.`,
          );
        }
      }
    });
  }

  /**
   * Crée une commande depuis une enchère gagnante
   */
  private async createOrderFromWinningBid(
    winningBid: Bid,
    item: Item,
  ): Promise<void> {
    // Récupérer les informations complètes de l'enchère avec les relations
    const bidWithRelations = await this.bidRepository.findOne({
      where: { id: winningBid.id },
      relations: ['user', 'item', 'item.seller'],
    });

    if (!bidWithRelations || !bidWithRelations.user || !bidWithRelations.item) {
      throw new Error('Impossible de récupérer les informations complètes de l\'enchère');
    }

    // Créer la commande avec le montant de l'enchère gagnante
    await this.ordersService.createOrderFromAuction({
      buyer_id: bidWithRelations.user_id,
      seller_id: bidWithRelations.item.seller_id,
      item_id: bidWithRelations.item_id,
      amount: Number(bidWithRelations.amount),
    });
  }
}

