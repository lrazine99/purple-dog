import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UploadsService } from '../uploads/uploads.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly uploadsService: UploadsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const role = createUserDto.role || 'particular';

    if (role === 'particular') {
      if (!createUserDto.rgpd_accepted) {
        throw new BadRequestException('RGPD must be accepted');
      }
      if (!createUserDto.address_line) {
        throw new BadRequestException('Postal address is required');
      }
      if (typeof createUserDto.age === 'number' && createUserDto.age < 18) {
        throw new BadRequestException('Age must be 18 or older');
      }
    } else if (role === 'professional') {
      if (!createUserDto.company_name) {
        throw new BadRequestException('Company name is required');
      }
      if (!createUserDto.siret) {
        throw new BadRequestException('SIRET number is required');
      }
      if (!file) {
        throw new BadRequestException('Official document is required');
      }
      if (!createUserDto.address_line) {
        throw new BadRequestException('Postal address is required');
      }
      if (!createUserDto.speciality) {
        throw new BadRequestException('Speciality is required');
      }
      if (!createUserDto.items_preference) {
        throw new BadRequestException('Items preference is required');
      }
      if (!createUserDto.cgv_accepted) {
        throw new BadRequestException('CGV must be accepted');
      }
      if (!createUserDto.rgpd_accepted) {
        throw new BadRequestException('RGPD must be accepted');
      }
    } else {
      throw new BadRequestException('Invalid role');
    }

    let official_document_url: string | undefined = undefined;
    if (file) {
      try {
        official_document_url = await this.uploadsService.saveFile(file);
      } catch (error) {
        throw new BadRequestException(error.message || 'Failed to upload file');
      }
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      password_hash,
      role: createUserDto.role || 'particular',
      ...(official_document_url && { official_document_url }),
    });

    const savedUser = await this.userRepository.save(user);

    if (savedUser.role === 'professional') {
      try {
        await this.subscriptionsService.createTrialSubscription(savedUser.id);
      } catch (error) {
        console.error('Failed to create trial subscription:', error);
      }
    }

    try {
      await this.authService.sendVerification(savedUser.email);
    } catch {
      // Ignore email sending errors
    }
    return this.toResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.toResponseDto(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['subscription'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (file) {
      try {
        if (user.official_document_url) {
          await this.uploadsService.deleteFile(user.official_document_url);
        }

        const newFileUrl = await this.uploadsService.saveFile(file);
        updateUserDto.official_document_url = newFileUrl;
      } catch (error) {
        throw new BadRequestException(error.message || 'Failed to upload file');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.official_document_url) {
      await this.uploadsService.deleteFile(user.official_document_url);
    }
    if (user.profile_picture) {
      await this.uploadsService.deleteFile(user.profile_picture);
    }

    await this.userRepository.remove(user);
  }

  async login(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.is_verified) {
      throw new UnauthorizedException('Account not verified');
    }
    return this.toResponseDto(user);
  }

  private toResponseDto(user: User): UserResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, subscription, ...userDto } = user;
    const response: UserResponseDto = userDto as UserResponseDto;

    if (subscription) {
      response.subscription = {
        id: subscription.id,
        plan_type: subscription.plan_type,
        status: subscription.status,
        price: Number(subscription.price),
        trial_start_date: subscription.trial_start_date,
        trial_end_date: subscription.trial_end_date,
        next_billing_date: subscription.next_billing_date,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
      };
    }

    return response;
  }
}
