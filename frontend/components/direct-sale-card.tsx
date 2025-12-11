"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, CreditCard } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

interface DirectSaleCardProps {
  price: number;
}

export function DirectSaleCard({ price }: DirectSaleCardProps) {
  const { data: user } = useAuth();
  const { canAccessPro } = useSubscriptionStatus();

  const handleBuyNow = () => {
    // TODO: Implement buy now
    console.log("Buying item for:", price);
  };

  const handleMakeOffer = () => {
    // TODO: Implement make offer
    console.log("Making offer for item");
  };

  const handleAddToFavorites = () => {
    // TODO: Implement add to favorites
    console.log("Adding to favorites");
  };

  return (
    <Card className="p-6 space-y-4 bg-muted/30">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Prix</p>
        <p className="font-serif text-4xl font-bold">
          {price.toLocaleString("fr-FR")} €
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          TVA incluse • Livraison disponible
        </p>
      </div>

      {/* Check if professional user with expired subscription */}
      {user && user.role === "professional" && !canAccessPro ? (
        <div className="space-y-3">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive mb-2">
              Abonnement expiré
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Vous devez souscrire à un abonnement pour acheter ce produit.
            </p>
            <Button asChild variant="default" size="sm" className="w-full">
              <Link href="/abonnement">
                <CreditCard className="h-4 w-4 mr-2" />
                S&apos;abonner maintenant
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Button size="lg" className="w-full" onClick={handleBuyNow}>
              Acheter maintenant
            </Button>
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

          <Button variant="ghost" className="w-full" onClick={handleMakeOffer}>
            Faire une offre
          </Button>
        </>
      )}
    </Card>
  );
}
