import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PlanType,
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async createTrialSubscription(userId: number): Promise<Subscription> {
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const subscription = this.subscriptionRepository.create({
      user_id: userId,
      plan_type: PlanType.FREE_TRIAL,
      status: SubscriptionStatus.ACTIVE,
      price: 0,
      trial_start_date: now,
      trial_end_date: trialEndDate,
      next_billing_date: trialEndDate,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async checkSubscriptionStatus(
    userId: number,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    if (
      subscription.plan_type === PlanType.FREE_TRIAL &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      const now = new Date();
      if (subscription.trial_end_date && now > subscription.trial_end_date) {
        subscription.status = SubscriptionStatus.PENDING_PAYMENT;
        await this.subscriptionRepository.save(subscription);
      }
    }

    return this.toResponseDto(subscription);
  }

  async expireTrialSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    subscription.status = SubscriptionStatus.PENDING_PAYMENT;
    return await this.subscriptionRepository.save(subscription);
  }

  async activatePaidSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    subscription.plan_type = PlanType.PAID;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.price = 49.0;
    subscription.next_billing_date = nextBillingDate;

    return await this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for user ID ${userId}`,
      );
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionByUserId(
    userId: number,
  ): Promise<SubscriptionResponseDto | null> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { user_id: userId },
    });

    if (!subscription) {
      return null;
    }

    return this.toResponseDto(subscription);
  }

  private toResponseDto(subscription: Subscription): SubscriptionResponseDto {
    return {
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
}
