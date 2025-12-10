import { ApiProperty } from '@nestjs/swagger';
import { ItemResponseDto } from '../../items/dto/item-response.dto';

export class FavoriteResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  item_id: number;

  @ApiProperty({ type: () => ItemResponseDto })
  item: ItemResponseDto;

  @ApiProperty()
  created_at: Date;
}
