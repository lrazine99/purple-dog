import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemCategory } from '../../items/entities/item-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({
    name: 'parent_id',
    nullable: true,
  })
  parent_id: number | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_default',
  })
  is_default: boolean;

  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => ItemCategory, (ic) => ic.category)
  itemCategories: ItemCategory[];
}
