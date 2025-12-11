import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailService } from '../common/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly evRepository: Repository<EmailVerification>,
    private readonly emailService: EmailService,
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

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string; role: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    if (!user.is_verified)
      throw new UnauthorizedException('Account not verified');

    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);
    const refresh_token_hash = await bcrypt.hash(refresh_token, 10);

    await this.userRepository.update({ id: user.id }, { refresh_token_hash });

    return { access_token, refresh_token, role: user.role };
  }

  async refresh(
    refresh_token: string,
  ): Promise<{ access_token: string; refresh_token: string; role: string }> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET') as string;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refresh_token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    if (!user.refresh_token_hash)
      throw new UnauthorizedException('Invalid refresh token');

    const ok = await bcrypt.compare(refresh_token, user.refresh_token_hash);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');

    const new_access = await this.signAccessToken(user);
    const new_refresh = await this.signRefreshToken(user);
    const new_refresh_hash = await bcrypt.hash(new_refresh, 10);
    await this.userRepository.update(
      { id: user.id },
      { refresh_token_hash: new_refresh_hash },
    );

    return {
      access_token: new_access,
      refresh_token: new_refresh,
      role: user.role,
    };
  }

  async logout(refresh_token: string): Promise<void> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET') as string;
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refresh_token, { secret });
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
    await this.userRepository.update(
      { id: payload.sub },
      { refresh_token_hash: null as any },
    );
  }

  async sendVerification(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    if (user.is_verified) throw new BadRequestException('Already verified');

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ttl = Number(
      this.config.get<string>('EMAIL_VERIFICATION_EXPIRES_IN') ?? '86400',
    );
    const expires_at = new Date(Date.now() + ttl * 1000);

    const record = this.evRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at,
      used: false,
    });
    await this.evRepository.save(record);

    const baseUrl =
      this.config.get<string>('APP_BASE_URL') || 'http://localhost:3000';
    const verifyLink = `${baseUrl}/auth/verify?token=${token}`;
    await this.emailService.sendMail(
      email,
      'Verify your account',
      `Click this link to verify: ${verifyLink}`,
    );
  }

  async verify(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.evRepository.findOne({
      where: { token_hash: tokenHash, used: false },
    });
    if (!record) throw new BadRequestException('Invalid token');
    if (record.expires_at.getTime() < Date.now())
      throw new BadRequestException('Token expired');

    const user = await this.userRepository.findOne({
      where: { id: record.user_id },
    });
    if (!user) throw new BadRequestException('User not found');

    user.is_verified = true;
    await this.userRepository.save(user);

    record.used = true;
    await this.evRepository.save(record);
  }
}
