"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface DirectSaleCardProps {
  itemId: number;
  sellerId: number;
  price: number;
  itemName: string;
}

export function DirectSaleCard({
  price,
  itemId,
  sellerId,
  itemName,
}: DirectSaleCardProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { data: user } = useAuth();
  const [offerOpen, setOfferOpen] = useState(false);
  const [amount, setAmount] = useState<number>(price);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuyNow = () => {
    setShowCheckout(true);
  };

  const handleMakeOffer = () => {
    // TODO: Implement make offer

    const handleMakeOffer = () => {
      if (!user) {
        alert("Veuillez vous connecter pour faire une offre.");
        return;
      }
      if (user.id === sellerId) {
        return;
      }
      setOfferOpen(true);
    };

    const handleSubmitOffer = async () => {
      if (!user) return;
      const amt = Number(amount);
      if (isNaN(amt) || amt <= 0) {
        alert("Montant invalide");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemId,
            buyer_id: user.id,
            amount: amt,
            message: message || undefined,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Échec de la création de l'offre");
        }
        setOfferOpen(false);
        setMessage("");
      } catch (e: any) {
        alert(e.message || "Erreur lors de l'envoi de l'offre");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleAddToFavorites = () => {
      // TODO: Implement add to favorites
    };

    return (
      <>
        <Card className="p-6 space-y-4 bg-muted/30">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Prix</p>
            <p className="font-serif text-4xl font-bold">
              {price.toLocaleString("fr-FR")} €
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              TVA incluforegrivraison disponible
            </p>
          </div>

          <div className="space-y-2">
            {user?.id !== sellerId && (
              <Button size="lg" className="w-full" onClick={handleMakeOffer}>
                Faire une offre
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleAddToFavorites}
            >
              <Heart className="h-4 w-4 mr-2" />
              Ajouter aux favoris
            </Button>
          </div>

          <Separator />
        </Card>
        <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Faire une offre</DialogTitle>
              <DialogDescription>
                Proposez un montant et un message optionnel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Montant (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setOfferOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmitOffer} disabled={isSubmitting}>
                {isSubmitting ? "Envoi..." : "Envoyer l'offre"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };
}
