"use client";

import { useQuery } from "@tanstack/react-query";
import PaymentsView from "@/components/payments/PaymentsView";
import { paymentService } from "@/lib/api/payment.service";
import { Payment } from "@/lib/type/payment.type";
import { formatAmountForDisplay, getPaymentStatusDisplay } from "@/lib/utils/payment-helpers";

// Convert Payment to StripePaymentIntent format for display
function convertPaymentToDisplay(payment: Payment) {
  return {
    id: payment.stripe_payment_intent_id || payment.id.toString(),
    amount: Math.round(parseFloat(payment.amount) * 100), // Convert to cents
    currency: payment.currency,
    status: payment.status,
    description: `Commande #${payment.order_id}`,
    payment_method: null, // Will be fetched from Stripe if needed
    created: new Date(payment.created_at).getTime() / 1000,
    metadata: {
      order_id: payment.order_id.toString(),
      payment_id: payment.id.toString(),
    },
  };
}

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PaymentsView data={[]} isLoading={true} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-destructive">
              {error instanceof Error
                ? error.message
                : "Erreur lors du chargement des paiements"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayData = payments
    ? payments.map(convertPaymentToDisplay)
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Historique des paiements</h1>
          <p className="text-muted-foreground mt-2">
            Consultez l'historique de tous vos paiements
          </p>
        </div>
        <PaymentsView data={displayData} />
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Historique des paiements</h1>
          <p className="text-muted-foreground mt-2">
            Consultez l'historique de tous vos paiements
          </p>
        </div>
        <Suspense
          fallback={<PaymentsView data={[]} isLoading={true} />}
        >
          <PaymentsContent />
        </Suspense>
      </div>
    </div>
  );
}

