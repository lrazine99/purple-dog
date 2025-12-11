import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { Order } from './entities/order.entity';
import type { RequestWithUser } from '../common/types/request.types';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a draft order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created', type: OrderResponseDto })
  async create(@Body() dto: CreateOrderDto, @Req() req: RequestWithUser): Promise<Order> {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    // Ensure the buyer_id matches the authenticated user
    if (dto.buyer_id !== userId) {
      throw new BadRequestException('You can only create orders for yourself');
    }
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of orders', type: [OrderResponseDto] })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', type: 'number', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated', type: OrderResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateOrderDto>,
  ): Promise<Order> {
    return this.ordersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Status updated', type: OrderResponseDto })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', type: 'number', description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }
}
