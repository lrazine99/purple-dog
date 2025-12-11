import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";

interface CheckoutResponse {
  checkoutUrl: string;
}

export function useSubscriptionCheckout() {
  const { toast } = useToast();

  return useMutation<CheckoutResponse, Error>({
    mutationFn: async () => {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Erreur lors de la création du paiement"
        );
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast({
        variant: "error",
        message: "Erreur",
        description:
          error.message || "Impossible de créer la session de paiement",
      });
    },
  });
}
