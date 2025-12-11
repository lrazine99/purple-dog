import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async send(@Body() dto: CreateMessageDto) {
    return this.messagesService.send(dto.item_id, dto.sender_id, dto.receiver_id, dto.content);
  }

  @Get('/item/:itemId')
  @ApiOperation({ summary: 'List messages for an item' })
  @ApiParam({ name: 'itemId', type: 'number' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async listByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.messagesService.listByItem(itemId);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'List messages for a user' })
  @ApiParam({ name: 'userId', type: 'number' })
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async listForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.messagesService.listForUser(userId);
  }

  @Patch('/:id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async markRead(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markRead(id);
  }
}
