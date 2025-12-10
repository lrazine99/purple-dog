import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('item_photos')
export class ItemPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  item_id: number;

  @ManyToOne(() => Item, (item) => item.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  is_primary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

