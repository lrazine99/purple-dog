"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/helper/routes";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verifyMutation = useVerifyEmail();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast({
        variant: "error",
        message: "Token manquant",
        description: "Le lien de vérification est invalide",
      });
      return;
    }

    verifyMutation.mutate(token, {
      onSuccess: () => {
        toast({
          variant: "success",
          message: "Email vérifié !",
          description: "Votre compte a été activé avec succès",
        });
      },
      onError: (error) => {
        toast({
          variant: "error",
          message: "Erreur de vérification",
          description: error.message || "Le token est invalide ou expiré",
        });
      },
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {verifyMutation.isPending && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">
                Vérification en cours...
              </h1>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous vérifions votre email
              </p>
            </>
          )}

          {verifyMutation.isSuccess && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-700">
                Email vérifié !
              </h1>
              <p className="text-muted-foreground mb-6">
                Votre compte a été activé avec succès. Vous pouvez maintenant
                vous connecter.
              </p>
              <Link href={ROUTES.CONNEXION}>
                <Button className="w-full">Se connecter</Button>
              </Link>
            </>
          )}

          {verifyMutation.isError && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-700">
                Erreur de vérification
              </h1>
              <p className="text-muted-foreground mb-6">
                {verifyMutation.error?.message ||
                  "Le lien de vérification est invalide ou a expiré"}
              </p>
              <div className="space-y-2">
                <Link href={ROUTES.INSCRIPTION}>
                  <Button variant="outline" className="w-full">
                    Créer un nouveau compte
                  </Button>
                </Link>
                <Link href={ROUTES.CONNEXION}>
                  <Button variant="ghost" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </>
          )}

          {!token && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-700">
                Lien invalide
              </h1>
              <p className="text-muted-foreground mb-6">
                Le lien de vérification est invalide ou incomplet
              </p>
              <Link href={ROUTES.INSCRIPTION}>
                <Button className="w-full">Retour à l'inscription</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
