"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/helper/routes";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaymentVerificationViewProps {
  isVerified: boolean;
  message?: string;
}

export default function PaymentVerificationView({
  isVerified,
  message,
}: PaymentVerificationViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div
        className={cn(
          "flex flex-col items-center space-y-4 p-6 rounded-lg border max-w-md w-full",
          {
            "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800":
              isVerified,
            "text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800":
              !isVerified,
          }
        )}
        role="alert"
      >
        <div className="flex items-center gap-3">
          {isVerified ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
          <div className="flex flex-col">
            {isVerified ? (
              <span className="font-semibold text-lg">
                Paiement effectué avec succès
              </span>
            ) : (
              <span className="font-semibold text-lg">
                Erreur de vérification
              </span>
            )}
            {message && (
              <p className="text-sm mt-1 text-muted-foreground">{message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {isVerified ? (
            <>
              <Link href={ROUTES.MON_COMPTE}>
                <Button variant="default">Voir mon compte</Button>
              </Link>
              <Link href={ROUTES.PRODUITS}>
                <Button variant="outline">Continuer les achats</Button>
              </Link>
            </>
          ) : (
            <Link href={ROUTES.MON_COMPTE}>
              <Button variant="default">Retour au compte</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

