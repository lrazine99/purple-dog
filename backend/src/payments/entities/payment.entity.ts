import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  order_id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_payment_intent_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_checkout_session_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_customer_id: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: PaymentStatus.PENDING })
  status: string;

  @Column({ type: 'boolean', default: false })
  is_used: boolean; // To prevent double processing of webhooks/sessions

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

