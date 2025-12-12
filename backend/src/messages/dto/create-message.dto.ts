import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  item_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  sender_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  receiver_id: number;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;
}
