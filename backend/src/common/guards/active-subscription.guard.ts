import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { SubscriptionStatus } from '../../subscriptions/entities/subscription.entity';

@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== 'professional') {
      return true;
    }

    try {
      const subscription =
        await this.subscriptionsService.checkSubscriptionStatus(user.sub);

      if (!subscription) {
        throw new ForbiddenException(
          'No subscription found. Please subscribe to continue.',
        );
      }

      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException(
          'Your subscription has expired. Please renew to continue.',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify subscription status');
    }
  }
}
