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
      billing_address_complement: dto.billing_address_complement,
      shipping_address_line: dto.shipping_address_line,
      shipping_city: dto.shipping_city,
      shipping_postal_code: dto.shipping_postal_code,
      shipping_country: dto.shipping_country,
      shipping_address_complement: dto.shipping_address_complement,
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

    const result = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.item', 'buyer', 'seller'],
    });
    if (!result) {
      throw new NotFoundException(`Order ${saved.id} not found`);
    }
    return result;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['items', 'items.item', 'buyer', 'seller'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.item', 'buyer', 'seller'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async update(id: number, dto: Partial<CreateOrderDto>): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    // Update order fields
    if (dto.buyer_id !== undefined) order.buyer_id = dto.buyer_id;
    if (dto.seller_id !== undefined) order.seller_id = dto.seller_id;
    if (dto.billing_address_line !== undefined) order.billing_address_line = dto.billing_address_line;
    if (dto.billing_city !== undefined) order.billing_city = dto.billing_city;
    if (dto.billing_postal_code !== undefined) order.billing_postal_code = dto.billing_postal_code;
    if (dto.billing_country !== undefined) order.billing_country = dto.billing_country;
    if (dto.billing_address_complement !== undefined) order.billing_address_complement = dto.billing_address_complement;
    if (dto.shipping_address_line !== undefined) order.shipping_address_line = dto.shipping_address_line;
    if (dto.shipping_city !== undefined) order.shipping_city = dto.shipping_city;
    if (dto.shipping_postal_code !== undefined) order.shipping_postal_code = dto.shipping_postal_code;
    if (dto.shipping_country !== undefined) order.shipping_country = dto.shipping_country;
    if (dto.shipping_address_complement !== undefined) order.shipping_address_complement = dto.shipping_address_complement;

    await this.orderRepo.save(order);

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    order.status = status;
    await this.orderRepo.save(order);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    // Delete order items first
    await this.orderItemRepo.delete({ order_id: id });
    // Then delete the order
    await this.orderRepo.remove(order);
  }

  /**
   * Crée une commande depuis une enchère gagnante
   */
  async createOrderFromAuction(dto: {
    buyer_id: number;
    seller_id: number;
    item_id: number;
    amount: number;
  }): Promise<Order> {
    const item = await this.itemRepo.findOne({ where: { id: dto.item_id } });
    if (!item) {
      throw new NotFoundException(`Item ${dto.item_id} not found`);
    }

    const order = this.orderRepo.create({
      buyer_id: dto.buyer_id,
      seller_id: dto.seller_id,
      total_amount: dto.amount.toFixed(2),
      currency: 'EUR',
      status: OrderStatus.DRAFT,
    });

    const saved = await this.orderRepo.save(order);

    // Créer l'OrderItem avec le montant de l'enchère
    const orderItem = this.orderItemRepo.create({
      order_id: saved.id,
      item_id: dto.item_id,
      qty: 1,
      unit_price: dto.amount.toFixed(2),
    });
    await this.orderItemRepo.save(orderItem);

    const result = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.item', 'buyer', 'seller'],
    });
    if (!result) {
      throw new NotFoundException(`Order ${saved.id} not found`);
    }
    return result;
  }
}
