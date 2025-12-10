import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID of the item to add to favorites' })
  @IsInt()
  @IsNotEmpty()
  item_id: number;
}
