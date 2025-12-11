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
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAID_ESCROW = 'paid_escrow',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  AWAITING_SIGNATURE = 'awaiting_signature',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'buyer_id' })
  buyer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'seller_id' })
  seller_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  total_amount: string;

  @Column({ type: 'varchar', length: 10, default: 'EUR' })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: OrderStatus.DRAFT })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billing_address_line: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billing_city: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  billing_postal_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  billing_country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billing_address_complement: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shipping_address_line: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipping_city: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shipping_postal_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipping_country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shipping_address_complement: string;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
