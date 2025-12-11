import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { Item, ItemStatus } from './entities/item.entity';
import { ItemPhoto } from './entities/item-photo.entity';
import { ItemCategory } from './entities/item-category.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemPhoto)
    private readonly itemPhotoRepository: Repository<ItemPhoto>,
    @InjectRepository(ItemCategory)
    private readonly itemCategoryRepository: Repository<ItemCategory>,
  ) {}

  private toResponseDto(item: Item): ItemResponseDto {
    const response = item as any;
    // Add categories array for convenience
    if (item.itemCategories) {
      response.categories = item.itemCategories.map((ic) => ({
        id: ic.category_id,
        category: ic.category,
      }));
    }
    return response as ItemResponseDto;
  }

  async create(createItemDto: CreateItemDto): Promise<ItemResponseDto> {
    // Règle métier : si prix >= 5000€, statut = pending_expertise
    let status = createItemDto.status || ItemStatus.DRAFT;
    if (
      createItemDto.price_desired &&
      Number(createItemDto.price_desired) >= 5000
    ) {
      status = ItemStatus.PENDING_EXPERTISE;
    }

    const item = this.itemRepository.create({
      ...createItemDto,
      status,
      auction_end_date: createItemDto.auction_end_date
        ? new Date(createItemDto.auction_end_date)
        : undefined,
    });

    const savedItem = await this.itemRepository.save(item);

    // If category_id is provided, also add to item_categories table
    if (createItemDto.category_id) {
      const itemCategory = this.itemCategoryRepository.create({
        item_id: savedItem.id,
        category_id: createItemDto.category_id,
      });
      await this.itemCategoryRepository.save(itemCategory);
    }

    // Reload with relations
    const reloadedItem = await this.itemRepository.findOne({
      where: { id: savedItem.id },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    return this.toResponseDto(reloadedItem!);
  }

  async findAll(params?: {
    categoryId?: number;
    limit?: number;
    offset?: number;
  }): Promise<ItemResponseDto[]> {
    const { categoryId, limit = 50, offset = 0 } = params || {};

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.photos', 'photos')
      .leftJoinAndSelect('item.itemCategories', 'itemCategories')
      .leftJoinAndSelect('itemCategories.category', 'category')
      .leftJoin('item.category', 'mainCategory')
      .orderBy('item.created_at', 'DESC');

    if (categoryId) {
      // Find items where category_id matches OR where the category's parent_id matches
      // This allows filtering by parent category to show items from subcategories
      queryBuilder.where(
        '(item.category_id = :categoryId OR mainCategory.parent_id = :categoryId)',
        { categoryId },
      );
    }

    queryBuilder.skip(offset).take(limit).orderBy('item.created_at', 'DESC');

    const items = await queryBuilder.getMany();

    return items.map((item) => this.toResponseDto(item));
  }

  async findOne(id: number): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['photos', 'itemCategories'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const updateData: any = { ...updateItemDto };
    if (updateItemDto.auction_end_date) {
      updateData.auction_end_date = new Date(updateItemDto.auction_end_date);
    }

    // Règle métier : si prix >= 5000€ et statut était draft, passer en pending_expertise
    const newPrice = updateItemDto.price_desired ?? item.price_desired;
    if (Number(newPrice) >= 5000 && item.status === ItemStatus.DRAFT) {
      updateData.status = ItemStatus.PENDING_EXPERTISE;
    }

    // Handle category_id update - also sync item_categories
    if (updateItemDto.category_id !== undefined) {
      // Check if this category already exists in item_categories
      const existingCategoryLink = await this.itemCategoryRepository.findOne({
        where: { item_id: id, category_id: updateItemDto.category_id },
      });

      if (!existingCategoryLink) {
        // Add new category link
        const itemCategory = this.itemCategoryRepository.create({
          item_id: id,
          category_id: updateItemDto.category_id,
        });
        await this.itemCategoryRepository.save(itemCategory);
      }
    }

    Object.assign(item, updateData);
    const updatedItem = await this.itemRepository.save(item);

    // Reload with relations
    const reloadedItem = await this.itemRepository.findOne({
      where: { id: updatedItem.id },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    return this.toResponseDto(reloadedItem!);
  }

  async remove(id: number): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // ItemCategories will be deleted automatically due to cascade
    await this.itemRepository.remove(item);
  }

  // Category management methods for items
  async addCategories(
    itemId: number,
    categoryIds: number[],
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['itemCategories'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Get existing category IDs
    const existingCategoryIds = item.itemCategories.map((ic) => ic.category_id);

    // Add new categories
    for (const categoryId of categoryIds) {
      if (!existingCategoryIds.includes(categoryId)) {
        const itemCategory = this.itemCategoryRepository.create({
          item_id: itemId,
          category_id: categoryId,
        });
        await this.itemCategoryRepository.save(itemCategory);

        // Update primary category_id if not set
        if (!item.category_id) {
          item.category_id = categoryId;
          await this.itemRepository.save(item);
        }
      }
    }

    // Reload with relations
    const reloadedItem = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    return this.toResponseDto(reloadedItem!);
  }

  async removeCategory(
    itemId: number,
    categoryId: number,
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['itemCategories'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Remove the category link
    await this.itemCategoryRepository.delete({
      item_id: itemId,
      category_id: categoryId,
    });

    // If this was the primary category, update to another one
    if (item.category_id === categoryId) {
      const remainingCategories = await this.itemCategoryRepository.find({
        where: { item_id: itemId },
      });

      if (remainingCategories.length > 0) {
        item.category_id = remainingCategories[0].category_id;
      } else {
        item.category_id = null;
      }
      await this.itemRepository.save(item);
    }

    // Reload with relations
    const reloadedItem = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    return this.toResponseDto(reloadedItem!);
  }

  async setCategories(
    itemId: number,
    categoryIds: number[],
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Remove all existing category links
    await this.itemCategoryRepository.delete({ item_id: itemId });

    // Add new categories
    for (const categoryId of categoryIds) {
      const itemCategory = this.itemCategoryRepository.create({
        item_id: itemId,
        category_id: categoryId,
      });
      await this.itemCategoryRepository.save(itemCategory);
    }

    // Update primary category
    item.category_id = categoryIds.length > 0 ? categoryIds[0] : null;
    await this.itemRepository.save(item);

    // Reload with relations
    const reloadedItem = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['photos', 'itemCategories', 'itemCategories.category'],
    });

    return this.toResponseDto(reloadedItem!);
  }

  // Photo management methods
  async listPhotos(itemId: number): Promise<ItemPhoto[]> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
    return this.itemPhotoRepository.find({
      where: { item_id: itemId },
      order: { position: 'ASC' },
    });
  }

  async addPhoto(
    itemId: number,
    url: string,
    isPrimary: boolean = false,
  ): Promise<ItemPhoto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['photos'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Check max 10 photos
    if (item.photos && item.photos.length >= 10) {
      throw new BadRequestException('Maximum 10 photos per item');
    }

    // Get next position
    const maxPosition =
      item.photos?.reduce((max, photo) => Math.max(max, photo.position), -1) ??
      -1;

    // If this is the first photo or isPrimary, set as primary
    if (isPrimary || !item.photos || item.photos.length === 0) {
      // Unset other primary photos
      await this.itemPhotoRepository.update(
        { item_id: itemId },
        { is_primary: false },
      );
    }

    const photo = this.itemPhotoRepository.create({
      item_id: itemId,
      url,
      position: maxPosition + 1,
      is_primary: isPrimary || !item.photos || item.photos.length === 0,
    });

    return this.itemPhotoRepository.save(photo);
  }

  async removePhoto(itemId: number, photoId: number): Promise<void> {
    const photo = await this.itemPhotoRepository.findOne({
      where: { id: photoId, item_id: itemId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo not found`);
    }

    const wasPrimary = photo.is_primary;
    await this.itemPhotoRepository.remove(photo);

    // If was primary, set another photo as primary
    if (wasPrimary) {
      const remainingPhotos = await this.itemPhotoRepository.find({
        where: { item_id: itemId },
        order: { position: 'ASC' },
      });

      if (remainingPhotos.length > 0) {
        remainingPhotos[0].is_primary = true;
        await this.itemPhotoRepository.save(remainingPhotos[0]);
      }
    }
  }

  async setPrimaryPhoto(itemId: number, photoId: number): Promise<ItemPhoto> {
    const photo = await this.itemPhotoRepository.findOne({
      where: { id: photoId, item_id: itemId },
    });

    if (!photo) {
      throw new NotFoundException(`Photo not found`);
    }

    // Unset other primary photos
    await this.itemPhotoRepository.update(
      { item_id: itemId },
      { is_primary: false },
    );

    photo.is_primary = true;
    return this.itemPhotoRepository.save(photo);
  }

  async reorderPhotos(
    itemId: number,
    photoIds: number[],
  ): Promise<ItemPhoto[]> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['photos'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Update positions
    for (let i = 0; i < photoIds.length; i++) {
      await this.itemPhotoRepository.update(
        { id: photoIds[i], item_id: itemId },
        { position: i },
      );
    }

    return this.itemPhotoRepository.find({
      where: { item_id: itemId },
      order: { position: 'ASC' },
    });
  }
}