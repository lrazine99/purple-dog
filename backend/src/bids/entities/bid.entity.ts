import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';

export enum BidType {
  MANUAL = 'manual',
  AUTO = 'auto',
}

@Entity('bids')
@Index(['item_id', 'created_at'])
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  item_id: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'amount',
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'min_amount',
  })
  min_amount: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: BidType.MANUAL,
  })
  type: string;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  is_active: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_winning',
  })
  is_winning: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

