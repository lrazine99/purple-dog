import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending_payment";
export type PlanType = "free_trial" | "paid";

export interface Subscription {
  id: number;
  plan_type: PlanType;
  status: SubscriptionStatus;
  price: number;
  trial_start_date?: Date;
  trial_end_date?: Date;
  next_billing_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export function useSubscription() {
  const { data: user } = useAuth();

  return useQuery<Subscription | null>({
    queryKey: ["subscription", "me"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/me");

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!user && user.role === "professional",
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSubscriptionStatus() {
  const subscription = useSubscription();

  const isActive = subscription.data?.status === "active";
  const isExpired =
    subscription.data?.status === "expired" ||
    subscription.data?.status === "pending_payment" ||
    subscription.data?.status === "cancelled";
  const isTrial = subscription.data?.plan_type === "free_trial";
  const isPaid = subscription.data?.plan_type === "paid" && subscription.data?.status === "active";

  const daysRemaining = subscription.data?.trial_end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.data.trial_end_date).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return {
    subscription: subscription.data,
    isLoading: subscription.isLoading,
    isActive,
    isExpired,
    isTrial,
    isPaid,
    daysRemaining,
    canAccessPro: isActive,
  };
}
