import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('item_categories')
export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  item_id: number;

  @Column({ name: 'category_id' })
  category_id: number;

  @ManyToOne(() => Item, (item) => item.itemCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => Category, (category) => category.itemCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

