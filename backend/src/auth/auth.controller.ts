import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../users/dto/login.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendVerificationDto } from './dto/send-verification.dto';
import { TokensDto } from './dto/tokens.dto';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Tokens returned', type: TokensDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<TokensDto & { role: string }> {
    const tokens = await this.authService.login(dto.email, dto.password);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: tokens.role,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New tokens', type: TokensDto })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<TokensDto & { role: string }> {
    const tokens = await this.authService.refresh(dto.refresh_token);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      role: tokens.role,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 204, description: 'Logged out' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refresh_token);
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send email verification token' })
  @ApiBody({ type: SendVerificationDto })
  @ApiResponse({ status: 204, description: 'Verification email sent' })
  async sendVerification(@Body() dto: SendVerificationDto): Promise<void> {
    await this.authService.sendVerification(dto.email);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'User information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.findOne(userId);
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account using token' })
  @ApiResponse({ status: 200, description: 'Account verified' })
  async verify(@Query('token') token: string): Promise<{ message: string }> {
    await this.authService.verify(token);
    return { message: 'Account verified' };
  }
}
