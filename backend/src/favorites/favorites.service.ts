import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  private toResponseDto(favorite: Favorite): FavoriteResponseDto {
    return favorite as FavoriteResponseDto;
  }

  async addFavorite(
    userId: number,
    itemId: number,
  ): Promise<FavoriteResponseDto> {
    const existing = await this.favoriteRepository.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    if (existing) {
      throw new ConflictException('Item already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      user_id: userId,
      item_id: itemId,
    });

    const saved = await this.favoriteRepository.save(favorite);

    const withItem = await this.favoriteRepository.findOne({
      where: { id: saved.id },
      relations: ['item'],
    });

    if (!withItem) {
      throw new NotFoundException('Favorite not found after creation');
    }

    return this.toResponseDto(withItem);
  }

  async removeFavorite(userId: number, itemId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<FavoriteResponseDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user_id: userId },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });

    return favorites.map((fav) => this.toResponseDto(fav));
  }

  async isFavorite(userId: number, itemId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    return !!favorite;
  }
}
