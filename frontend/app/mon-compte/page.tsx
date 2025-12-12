"use client";

import { AccountForm } from "@/components/account/AccountForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useUpdateUser, useUser } from "@/hooks/useUser";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { Loader2, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MonComptePage() {
  const { data: user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (!isLoadingAuth && user?.role === "admin") {
      router.push("/admin");
    }
  }, [user, isLoadingAuth, router]);

  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser(user?.id);

  const { subscription, isTrial, isPaid } = useSubscriptionStatus();

  const updateUserMutation = useUpdateUser(user?.id);

  if (isLoadingAuth || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render for admins (they'll be redirected)
  if (user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-destructive">
            {userError?.message ||
              "Erreur lors du chargement de vos informations"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <UserIcon className="h-8 w-8 text-primary" />
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground">
            Mon compte
          </h1>
        </div>

        {/* Subscription Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mon Abonnement</h2>
              {subscription && subscription.status === "active" ? (
                <div className="space-y-1">
                  <p className="text-gray-700">
                    <span className="font-medium">Formule:</span>{" "}
                    <span className="capitalize">{isTrial ? "Essai gratuit" : "Plan payant"}</span>
                  </p>
                  {(subscription.trial_end_date || subscription.next_billing_date) && (
                    <p className="text-gray-700">
                      <span className="font-medium">{isTrial ? "Expire le:" : "Prochain paiement:"}</span>{" "}
                      {new Date(subscription.trial_end_date || subscription.next_billing_date!).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm font-medium rounded-full">
                      Actif
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Aucun abonnement actif</p>
              )}
            </div>
            <a
              href="/abonnement"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {subscription && subscription.status === "active" ? "Gérer mon abonnement" : "S'abonner"}
            </a>
          </div>
        </div>

        <AccountForm
          user={userData}
          role={user.role}
          onUpdate={(data, file) => {
            updateUserMutation.mutate(
              { data, officialDocument: file },
              {
                onSuccess: () => {
                  toast({
                    variant: "success",
                    message: "Profil mis à jour",
                    description:
                      "Vos informations ont été mises à jour avec succès",
                  });
                },
                onError: (error) => {
                  toast({
                    variant: "error",
                    message: "Erreur",
                    description:
                      error instanceof Error
                        ? error.message
                        : "Une erreur est survenue lors de la mise à jour",
                  });
                },
              }
            );
          }}
          isPending={updateUserMutation.isPending}
        />
      </div>
    </div>
  );
}
