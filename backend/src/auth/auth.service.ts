import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async signAccessToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload);
  }

  private async signRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    const secret = this.config.get<string>('JWT_REFRESH_SECRET') as string;
    const expiresInStr = this.config.get<string>('JWT_REFRESH_EXPIRES_IN');
    const expiresIn = expiresInStr ? Number(expiresInStr) : 604800;
    return this.jwtService.signAsync(payload, { secret, expiresIn });
  }

  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    if (!user.is_verified) throw new UnauthorizedException('Account not verified');

    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);
    const refresh_token_hash = await bcrypt.hash(refresh_token, 10);
    await this.userRepository.update({ id: user.id }, { refresh_token_hash });

    return { access_token, refresh_token };
  }

  async refresh(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET') as string;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refresh_token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    if (!user.refresh_token_hash) throw new UnauthorizedException('Invalid refresh token');

    const ok = await bcrypt.compare(refresh_token, user.refresh_token_hash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');

    const new_access = await this.signAccessToken(user);
    const new_refresh = await this.signRefreshToken(user);
    const new_refresh_hash = await bcrypt.hash(new_refresh, 10);
    await this.userRepository.update({ id: user.id }, { refresh_token_hash: new_refresh_hash });

    return { access_token: new_access, refresh_token: new_refresh };
  }

  async logout(refresh_token: string): Promise<void> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET') as string;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refresh_token, { secret });
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
    await this.userRepository.update({ id: payload.sub }, { refresh_token_hash: null as any });
  }
}