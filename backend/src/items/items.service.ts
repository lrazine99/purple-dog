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

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemPhoto)
    private readonly itemPhotoRepository: Repository<ItemPhoto>,
  ) {}

  private toResponseDto(item: Item): ItemResponseDto {
    return item as ItemResponseDto;
  }

  async create(createItemDto: CreateItemDto): Promise<ItemResponseDto> {
    const item = this.itemRepository.create({
      ...createItemDto,
      status: createItemDto.status || ItemStatus.DRAFT,
      auction_end_date: createItemDto.auction_end_date
        ? new Date(createItemDto.auction_end_date)
        : undefined,
    });

    const savedItem = await this.itemRepository.save(item);
    return this.toResponseDto(savedItem);
  }

  async findAll(): Promise<ItemResponseDto[]> {
    const items = await this.itemRepository.find({
      relations: ['photos'],
      order: { created_at: 'DESC' },
    });
    return items.map((item) => this.toResponseDto(item));
  }

  async findOne(id: number): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['photos'],
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
      relations: ['photos'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const updateData: any = { ...updateItemDto };
    if (updateItemDto.auction_end_date) {
      updateData.auction_end_date = new Date(updateItemDto.auction_end_date);
    }

    Object.assign(item, updateData);
    const updatedItem = await this.itemRepository.save(item);
    return this.toResponseDto(updatedItem);
  }

  async remove(id: number): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    await this.itemRepository.remove(item);
  }

  // Photo management methods
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
    const maxPosition = item.photos?.reduce(
      (max, photo) => Math.max(max, photo.position),
      -1,
    ) ?? -1;

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
