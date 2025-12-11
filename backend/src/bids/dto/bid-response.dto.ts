import { ApiProperty } from '@nestjs/swagger';

export class BidResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  item_id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false, nullable: true })
  min_amount: number | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  is_winning: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

