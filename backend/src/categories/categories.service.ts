import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Category } from './entities/category.entity';
import { Item } from '../items/entities/item.entity';
import { ItemCategory } from '../items/entities/item-category.entity';

const DEFAULT_CATEGORY_NAME = 'Autre';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemCategory)
    private readonly itemCategoryRepository: Repository<ItemCategory>,
  ) {}

  private toResponseDto(category: Category): CategoryResponseDto {
    return category as CategoryResponseDto;
  }

  /**
   * Ensures the default "Autre" category exists
   * Called on module initialization
   */
  async ensureDefaultCategory(): Promise<Category> {
    let defaultCategory = await this.categoryRepository.findOne({
      where: { is_default: true },
    });

    if (!defaultCategory) {
      // Check if a category named "Autre" already exists
      const existingAutre = await this.categoryRepository.findOne({
        where: { name: DEFAULT_CATEGORY_NAME },
      });

      if (existingAutre) {
        // Mark existing "Autre" as default
        existingAutre.is_default = true;
        defaultCategory = await this.categoryRepository.save(existingAutre);
        console.log(`✅ Marked existing "${DEFAULT_CATEGORY_NAME}" category as default`);
      } else {
        // Create new default category
        defaultCategory = this.categoryRepository.create({
          name: DEFAULT_CATEGORY_NAME,
          is_default: true,
          parent_id: null,
        });
        defaultCategory = await this.categoryRepository.save(defaultCategory);
        console.log(`✅ Created default category "${DEFAULT_CATEGORY_NAME}" with ID ${defaultCategory.id}`);
      }
    }

    return defaultCategory;
  }

  /**
   * Get the default category
   */
  async getDefaultCategory(): Promise<Category> {
    const defaultCategory = await this.categoryRepository.findOne({
      where: { is_default: true },
    });

    if (!defaultCategory) {
      return this.ensureDefaultCategory();
    }

    return defaultCategory;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Validate: subcategories can't have subcategories (max 2 levels)
    if (createCategoryDto.parent_id) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parent_id} not found`);
      }

      // If parent already has a parent, it's a subcategory - can't add sub to sub
      if (parentCategory.parent_id !== null) {
        throw new BadRequestException(
          'Cannot create a subcategory of a subcategory. Only root categories can have subcategories.',
        );
      }
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      is_default: false, // Can't create another default category
    });
    const savedCategory = await this.categoryRepository.save(category);
    return this.toResponseDto(savedCategory);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { is_default: 'DESC', name: 'ASC' },
    });
    return categories.map((category) => this.toResponseDto(category));
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.toResponseDto(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Can't change default category's is_default status
    if (category.is_default && updateCategoryDto.name === '') {
      throw new BadRequestException('Cannot modify default category name to empty');
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);
    return this.toResponseDto(updatedCategory);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Can't delete the default category
    if (category.is_default) {
      throw new BadRequestException('Cannot delete the default category');
    }

    // Get the default category
    const defaultCategory = await this.getDefaultCategory();

    // Reassign all items with this category as primary to the default category
    await this.itemRepository
      .createQueryBuilder()
      .update(Item)
      .set({ category_id: defaultCategory.id })
      .where('category_id = :categoryId', { categoryId: id })
      .execute();

    // Reassign all item_categories entries to the default category
    // First, get items that would lose this category
    const itemCategoriesWithThisCategory = await this.itemCategoryRepository.find({
      where: { category_id: id },
    });

    // For each item that has this category, add the default category if not already present
    for (const ic of itemCategoriesWithThisCategory) {
      const hasDefaultCategory = await this.itemCategoryRepository.findOne({
        where: { item_id: ic.item_id, category_id: defaultCategory.id },
      });

      if (!hasDefaultCategory) {
        const newItemCategory = this.itemCategoryRepository.create({
          item_id: ic.item_id,
          category_id: defaultCategory.id,
        });
        await this.itemCategoryRepository.save(newItemCategory);
      }
    }

    // Delete all item_categories entries for this category
    await this.itemCategoryRepository.delete({ category_id: id });

    // Also reassign any child categories to be root categories
    await this.categoryRepository
      .createQueryBuilder()
      .update(Category)
      .set({ parent_id: null })
      .where('parent_id = :parentId', { parentId: id })
      .execute();

    // Finally, delete the category
    await this.categoryRepository.remove(category);
  }

  /**
   * Get items count for a category
   */
  async getItemsCount(categoryId: number): Promise<number> {
    const count = await this.itemRepository.count({
      where: { category_id: categoryId },
    });
    return count;
  }
}
