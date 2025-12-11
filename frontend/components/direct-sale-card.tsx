"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";

interface DirectSaleCardProps {
  price: number;
}

export function DirectSaleCard({ price }: DirectSaleCardProps) {
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
    </Card>
  );
}
