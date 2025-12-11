"use client";

import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGuard({
  children,
  fallback,
}: SubscriptionGuardProps) {
  const { data: user } = useAuth();
  const { canAccessPro, isLoading } = useSubscriptionStatus();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === "professional" && !isLoading && !canAccessPro) {
      router.push("/abonnement");
    }
  }, [user, canAccessPro, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && user.role === "professional" && !canAccessPro) {
    return fallback || null;
  }

  return <>{children}</>;
}
