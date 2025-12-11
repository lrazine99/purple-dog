"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerificationContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          // Invalider les queries de subscription pour forcer le rechargement
          queryClient.invalidateQueries({ queryKey: ["subscription"] });
        } else {
          console.error("Verification failed:", data);
          setErrorMessage(data.message || data.error || "Erreur inconnue");
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Erreur de connexion"
        );
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId, queryClient]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-muted-foreground">
            Veuillez patienter pendant que nous confirmons votre abonnement
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-md w-full p-8 bg-card border border-border rounded-lg text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-2">
            Une erreur est survenue lors de la vérification de votre paiement.
          </p>
          {errorMessage && (
            <p className="text-sm text-destructive mb-4 font-mono bg-destructive/10 p-2 rounded">
              {errorMessage}
            </p>
          )}
          <p className="text-muted-foreground mb-6 text-sm">
            Si vous avez bien effectué le paiement, votre abonnement sera activé automatiquement.
            Sinon, veuillez contacter le support.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/abonnement">Retour</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/contact">Contacter le support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-md w-full p-8 bg-card border border-border rounded-lg text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Paiement réussi !</h2>
        <p className="text-muted-foreground mb-6">
          Votre abonnement professionnel a été activé avec succès. Vous avez
          maintenant accès à toutes les fonctionnalités premium.
        </p>
        <Button asChild className="w-full">
          <Link href="/produits">Accéder à mes produits</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
