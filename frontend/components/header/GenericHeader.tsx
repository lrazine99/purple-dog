"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/helper/routes";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Bell, Menu, Search, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProNavbar } from "./ProNavbar";
import { SellerNavbar } from "./SellerNavbar";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";

interface DirectSaleCardProps {
  itemId: number;
  sellerId: number;
  price: number;
  itemName: string;
}

export function DirectSaleCard({
  itemId,
  sellerId,
  price,
  itemName,
}: DirectSaleCardProps) {
  const { data: user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const [offerOpen, setOfferOpen] = useState(false);
  const [amount, setAmount] = useState<number>(price);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuyNow = () => {
    if (!user) {
      alert("Veuillez vous connecter pour acheter cet article.");
      return;
    }
    setShowCheckout(true);
  };

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
      alert("Offre envoyée avec succès !");
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'envoi de l'offre");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToFavorites = () => {
    console.log("Adding to favorites");
  };

  const isOwner = user?.id === sellerId;

  if (isLoading) {
    return (
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 h-16"></div>
    );
  }

  // Don't show header on admin pages - admin has its own layout
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Card className="p-6 space-y-4 bg-muted/30">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Prix</p>
          <p className="font-serif text-4xl font-bold">
            {price.toLocaleString("fr-FR")} €
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            TVA incluse, livraison disponible
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          {/* Boutons d'action (cachés si c'est le vendeur) */}
          {!isOwner && (
            <>
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={handleBuyNow}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Acheter maintenant
              </Button>

              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={handleMakeOffer}
              >
                Faire une offre
              </Button>
            </>
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
      </Card>

      {/* Modal de Paiement Stripe */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        itemId={itemId}
        sellerId={sellerId}
        price={price}
        itemName={itemName}
      />

      {/* Modal de création d'offre */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faire une offre</DialogTitle>
            <DialogDescription>
              Proposez un montant et un message optionnel au vendeur.
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
                placeholder="Bonjour, je suis intéressé par..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
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
}