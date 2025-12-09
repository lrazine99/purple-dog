import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

export enum SaleMode {
  AUCTION = 'auction',
  FAST = 'fast',
}

export enum ItemStatus {
  DRAFT = 'draft',
  FOR_SALE = 'for_sale',
  SOLD = 'sold',
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
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

  @Column({ name: 'category_id' })
  category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

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
  })
  width_cm: number;

  @Column({
    type: 'float',
    name: 'height_cm',
  })
  height_cm: number;

  @Column({
    type: 'float',
    name: 'depth_cm',
  })
  depth_cm: number;

  @Column({
    type: 'float',
    name: 'weight_kg',
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
  })
  price_min: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'sale_mode',
  })
  sale_mode: string;

  @Column({
    type: 'varchar',
    length: 30,
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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

