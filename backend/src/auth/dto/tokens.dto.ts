import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
