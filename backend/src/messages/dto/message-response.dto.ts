import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() item_id: number;
  @ApiProperty() sender_id: number;
  @ApiProperty() receiver_id: number;
  @ApiProperty() content: string;
  @ApiProperty() is_read: boolean;
  @ApiProperty() created_at: Date;
}
