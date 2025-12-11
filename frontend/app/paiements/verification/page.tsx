"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentVerificationView from "@/components/payments/PaymentVerificationView";
import { paymentService } from "@/lib/api/payment.service";

function PaymentVerificationContent() {
  const searchParams = useSearchParams();
  const checkoutSessionId = searchParams.get("checkout_session_id");
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyPayment() {
      if (!checkoutSessionId) {
        setMessage("Aucun identifiant de session de paiement fourni.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await paymentService.verifyPayment(checkoutSessionId);
        setIsVerified(result.verified);
        
        // Détecter si c'est un paiement SEPA en attente
        const isSepaPending = result.verified && result.payment.status === 'pending';
        
        if (isSepaPending) {
          setMessage(
            "Votre mandat de prélèvement SEPA a été accepté avec succès. Le prélèvement sera effectué dans 1 à 3 jours ouvrables. Vous recevrez une confirmation par email une fois le prélèvement effectué."
          );
        } else if (result.verified) {
          setMessage("Votre paiement a été confirmé avec succès.");
        } else {
          setMessage("Le paiement n'a pas pu être vérifié. Veuillez contacter le support.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        setIsVerified(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite lors de la vérification du paiement."
        );
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [checkoutSessionId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Vérification du paiement</h1>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Vérification du paiement en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Vérification du paiement</h1>
        <PaymentVerificationView isVerified={isVerified} message={message} />
      </div>
    </div>
  );
}

export default function PaymentVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Vérification du paiement</h1>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      }
    >
      <PaymentVerificationContent />
    </Suspense>
  );
}

