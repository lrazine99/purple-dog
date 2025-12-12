import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";

interface CheckoutResponse {
  url: string;
}

export function useOfferCheckout(offerId: number) {
  const { toast } = useToast();

  return useMutation<CheckoutResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/offers/${offerId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || error.error || "Erreur lors de la création du paiement"
        );
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: "error",
          message: "Erreur",
          description: "Lien de paiement indisponible pour le moment.",
        });
      }
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

