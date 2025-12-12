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
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemsService } from './items.service';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new item' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: ItemResponseDto,
  })
  async create(@Body() createItemDto: CreateItemDto): Promise<ItemResponseDto> {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items with optional filters' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiResponse({
    status: 200,
    description: 'List of items',
    type: [ItemResponseDto],
  })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ItemResponseDto[]> {
    return this.itemsService.findAll({
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item found',
    type: ItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ItemResponseDto> {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    type: ItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemsService.remove(id);
  }

  // Category management endpoints
  @Post(':id/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add categories to an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  async addCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { category_ids: number[] },
  ): Promise<ItemResponseDto> {
    return this.itemsService.addCategories(id, body.category_ids);
  }

  @Put(':id/categories')
  @ApiOperation({ summary: 'Set categories for an item (replaces all)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  async setCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { category_ids: number[] },
  ): Promise<ItemResponseDto> {
    return this.itemsService.setCategories(id, body.category_ids);
  }

  @Delete(':id/categories/:categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a category from an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiParam({ name: 'categoryId', type: 'number', description: 'Category ID' })
  async removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ItemResponseDto> {
    return this.itemsService.removeCategory(id, categoryId);
  }

  // Photo endpoints
  @Get(':id/photos')
  @ApiOperation({ summary: 'List photos for an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  async listPhotos(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.listPhotos(id);
  }

  @Post(':id/photos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a photo to an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  async addPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { url: string; is_primary?: boolean },
  ) {
    return this.itemsService.addPhoto(id, body.url, body.is_primary);
  }

  @Delete(':id/photos/:photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a photo from an item' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiParam({ name: 'photoId', type: 'number', description: 'Photo ID' })
  async removePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ): Promise<void> {
    return this.itemsService.removePhoto(id, photoId);
  }

  @Patch(':id/photos/:photoId/primary')
  @ApiOperation({ summary: 'Set a photo as primary' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  @ApiParam({ name: 'photoId', type: 'number', description: 'Photo ID' })
  async setPrimaryPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ) {
    return this.itemsService.setPrimaryPhoto(id, photoId);
  }

  @Patch(':id/photos/reorder')
  @ApiOperation({ summary: 'Reorder photos' })
  @ApiParam({ name: 'id', type: 'number', description: 'Item ID' })
  async reorderPhotos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { photoIds: number[] },
  ) {
    return this.itemsService.reorderPhotos(id, body.photoIds);
  }
}
