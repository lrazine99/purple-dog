import { ApiProperty } from '@nestjs/swagger';
import { PlanType, SubscriptionStatus } from '../entities/subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: PlanType })
  plan_type: PlanType;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  trial_start_date?: Date;

  @ApiProperty({ required: false })
  trial_end_date?: Date;

  @ApiProperty({ required: false })
  next_billing_date?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
