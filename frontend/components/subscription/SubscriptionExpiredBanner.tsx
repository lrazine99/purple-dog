"use client";

import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SubscriptionExpiredBanner() {
  const { data: user } = useAuth();
  const { isExpired, isLoading, daysRemaining, isTrial } =
    useSubscriptionStatus();

  if (!user || user.role !== "professional") {
    return null;
  }

  if (isLoading) {
    return null;
  }

  if (isTrial && daysRemaining > 0 && daysRemaining <= 7) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Votre période d&apos;essai se termine dans {daysRemaining}{" "}
                  jour
                  {daysRemaining > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Abonnez-vous maintenant pour continuer à profiter de toutes
                  les fonctionnalités
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Link href="/abonnement" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Voir les plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Votre abonnement a expiré
                </p>
                <p className="text-xs text-destructive/80">
                  Vous n&apos;avez plus accès aux fonctionnalités
                  professionnelles. Abonnez-vous pour continuer.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="destructive">
              <Link href="/abonnement" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                S&apos;abonner maintenant
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
