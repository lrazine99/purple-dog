import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { Item, ItemStatus } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
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

  async findAll(params?: {
    categoryId?: number;
    limit?: number;
    offset?: number;
  }): Promise<ItemResponseDto[]> {
    const { categoryId, limit = 50, offset = 0 } = params || {};

    const queryBuilder = this.itemRepository.createQueryBuilder('item');

    if (categoryId) {
      queryBuilder.where('item.category_id = :categoryId', { categoryId });
    }

    queryBuilder.skip(offset).take(limit);

    queryBuilder.orderBy('item.created_at', 'DESC');

    const items = await queryBuilder.getMany();
    return items.map((item) => this.toResponseDto(item));
  }

  async findOne(id: number): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return this.toResponseDto(item);
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne({ where: { id } });

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
}
