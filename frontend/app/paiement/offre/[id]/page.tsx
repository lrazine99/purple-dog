"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOfferCheckout } from "@/hooks/useOfferCheckout";
import { Loader2, CreditCard } from "lucide-react";

type Offer = {
  id: number;
  item_id: number;
  amount: number | string;
  status: "pending" | "accepted" | "rejected" | "expired";
  message?: string | null;
  created_at: string;
  item?: { name?: string };
  seller?: { id: number; first_name?: string; last_name?: string };
  buyer?: { id: number; first_name?: string; last_name?: string };
};

function PayButton({ offerId }: { offerId: number }) {
  const checkoutMutation = useOfferCheckout(offerId);

  return (
    <Button
      size="lg"
      onClick={() => checkoutMutation.mutate()}
      disabled={checkoutMutation.isPending}
    >
      {checkoutMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Redirection...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Procéder au paiement
        </>
      )}
    </Button>
  );
}

export default function PaiementOffrePage() {
  const { id } = useParams() as { id: string };
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/offers/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setOffer(data);
        } else {
          setOffer(null);
        }
      } catch {
        setOffer(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const amountStr = offer && !isNaN(Number(offer.amount))
    ? Number(offer.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : offer?.amount ? String(offer.amount) : "";

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4">Confirmation de paiement</h1>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : !offer ? (
          <p className="text-sm text-muted-foreground">Offre introuvable ou non accessible.</p>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-muted-foreground">
                Offre #{offer.id} — Objet #{offer.item_id}{offer.item?.name ? ` — ${offer.item.name}` : ""}
              </p>
              <p className="text-lg font-medium">Montant: {amountStr} €</p>
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Votre offre a été acceptée. En confirmant, vous serez redirigé vers Stripe pour finaliser votre paiement.</p>
              <PayButton offerId={offer.id} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}