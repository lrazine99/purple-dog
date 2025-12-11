import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { ItemPhoto } from './item-photo.entity';
import { ItemCategory } from './item-category.entity';

export enum SaleMode {
  AUCTION = 'auction',
  FAST = 'fast',
  FIXED = 'fixed',
  NEGOTIABLE = 'negotiable',
}

export enum ItemStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  PENDING_EXPERTISE = 'pending_expertise',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_id' })
  seller_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  // Keep category_id for backward compatibility (primary category)
  @Column({ name: 'category_id', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Multiple categories relationship
  @OneToMany(() => ItemCategory, (ic) => ic.item, { cascade: true, eager: true })
  itemCategories: ItemCategory[];

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'float',
    name: 'width_cm',
    nullable: true,
  })
  width_cm: number;

  @Column({
    type: 'float',
    name: 'height_cm',
    nullable: true,
  })
  height_cm: number;

  @Column({
    type: 'float',
    name: 'depth_cm',
    nullable: true,
  })
  depth_cm: number;

  @Column({
    type: 'float',
    name: 'weight_kg',
    nullable: true,
  })
  weight_kg: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'price_desired',
  })
  price_desired: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'price_min',
    nullable: true,
  })
  price_min: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'sale_mode',
    default: 'fixed',
  })
  sale_mode: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'draft',
  })
  status: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'auction_start_price',
    nullable: true,
  })
  auction_start_price: number;

  @Column({
    type: 'timestamp',
    name: 'auction_end_date',
    nullable: true,
  })
  auction_end_date: Date;

  @OneToMany(() => ItemPhoto, (photo) => photo.item, { cascade: true, eager: true })
  photos: ItemPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
