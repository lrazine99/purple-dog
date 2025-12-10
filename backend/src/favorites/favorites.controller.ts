import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to favorites' })
  @ApiBody({ type: CreateFavoriteDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to favorites',
    type: FavoriteResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Item already in favorites' })
  async addFavorite(
    @Req() req: any,
    @Body() dto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.addFavorite(req.user.sub, dto.item_id);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from favorites' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({ status: 204, description: 'Item removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @Req() req: any,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<void> {
    return this.favoritesService.removeFavorite(req.user.sub, itemId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user favorites' })
  @ApiResponse({
    status: 200,
    description: 'List of favorites',
    type: [FavoriteResponseDto],
  })
  async getUserFavorites(@Req() req: any): Promise<FavoriteResponseDto[]> {
    return this.favoritesService.getUserFavorites(req.user.sub);
  }

  @Get('check/:itemId')
  @ApiOperation({ summary: 'Check if item is in favorites' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  async checkFavorite(
    @Req() req: any,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesService.isFavorite(
      req.user.sub,
      itemId,
    );
    return { isFavorite };
  }
}
