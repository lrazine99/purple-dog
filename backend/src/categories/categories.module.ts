import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Item } from '../items/entities/item.entity';
import { ItemCategory } from '../items/entities/item-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Item, ItemCategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule implements OnModuleInit {
  constructor(private readonly categoriesService: CategoriesService) {}

  async onModuleInit() {
    // Ensure default category exists on startup
    await this.categoriesService.ensureDefaultCategory();
  }
}
