"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
};

export function ItemOffersSection({ itemId, sellerId }: { itemId: number; sellerId: number }) {
  const { data: user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/item/${itemId}`);
      const data = res.ok ? await res.json() : [];
      setOffers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [itemId]);

  if (!user || user.id !== sellerId) return null;

  async function updateStatus(id: number, status: "accepted" | "rejected") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      load();
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">Offres</h2>
      <Separator />
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune offre pour cet objet.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Offre {Number(o.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  {o.item?.name ? ` sur "${o.item.name}"` : ""}
                </p>
                {o.message ? <p className="text-xs text-muted-foreground truncate">{o.message}</p> : null}
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {o.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => updateStatus(o.id, "accepted")}>Accepter</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "rejected")}>Refuser</Button>
                  </>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-secondary">
                    {o.status === "accepted" ? "Acceptée" : o.status === "rejected" ? "Refusée" : "Expirée"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}