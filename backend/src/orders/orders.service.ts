import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    const items = await Promise.all(
      dto.items.map(async (i) => {
        const item = await this.itemRepo.findOne({ where: { id: i.item_id } });
        if (!item) throw new NotFoundException(`Item ${i.item_id} not found`);
        return { item, qty: i.qty };
      }),
    );

    const total = items.reduce((sum, { item, qty }) => {
      const price = Number(item.price_desired);
      return sum + price * qty;
    }, 0);

    const order = this.orderRepo.create({
      buyer_id: dto.buyer_id,
      seller_id: dto.seller_id,
      total_amount: total.toFixed(2),
      currency: 'EUR',
      status: OrderStatus.DRAFT,
      billing_address_line: dto.billing_address_line,
      billing_city: dto.billing_city,
      billing_postal_code: dto.billing_postal_code,
      billing_country: dto.billing_country,
      shipping_address_line: dto.shipping_address_line,
      shipping_city: dto.shipping_city,
      shipping_postal_code: dto.shipping_postal_code,
      shipping_country: dto.shipping_country,
    });

    const saved = await this.orderRepo.save(order);

    for (const { item, qty } of items) {
      const oi = this.orderItemRepo.create({
        order_id: saved.id,
        item_id: item.id,
        qty,
        unit_price: Number(item.price_desired).toFixed(2),
      });
      await this.orderItemRepo.save(oi);
    }

    const result = await this.orderRepo.findOne({ where: { id: saved.id }, relations: ['items'] });
    if (!result) {
      throw new NotFoundException(`Order ${saved.id} not found`);
    }
    return result;
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }
}
