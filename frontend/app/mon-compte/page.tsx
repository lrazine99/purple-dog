"use client";

import { AccountForm } from "@/components/account/AccountForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useUpdateUser, useUser } from "@/hooks/useUser";
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
