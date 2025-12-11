"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

async function getOffer(id: string): Promise<Offer | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function PayButton({ offerId }: { offerId: number }) {
  "use client";
  const handlePay = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${offerId}/checkout`, { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Lien de paiement indisponible pour le moment.");
      }
    } catch {
      alert("Erreur lors de l'initialisation du paiement.");
    }
  };

  return (
    <Button size="lg" onClick={handlePay}>
      Procéder au paiement
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
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${id}`, { cache: "no-store", headers });
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
      <Header />
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