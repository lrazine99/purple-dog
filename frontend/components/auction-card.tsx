"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Heart, Plus } from "lucide-react";

interface AuctionCardProps {
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endDate: string;
  priceMin: number;
}

// Fonction pour calculer le palier d'enchère
function getBidIncrement(currentPrice: number): number {
  if (currentPrice < 100) return 10;
  if (currentPrice < 500) return 50;
  if (currentPrice < 1000) return 100;
  return 200;
}

export function AuctionCard({
  currentBid,
  startingBid,
  bidCount,
  endDate,
  priceMin,
}: AuctionCardProps) {
  const increment = getBidIncrement(currentBid);
  const [bidAmount, setBidAmount] = useState(currentBid + increment);

  const handleQuickBid = (multiplier: number) => {
    setBidAmount(currentBid + increment * multiplier);
  };

  const handleBid = () => {
    // TODO: Implement bid submission
    console.log("Placing bid:", bidAmount);
  };

  return (
    <Card className="p-6 space-y-4 bg-muted/30">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Enchère actuelle</p>
        <p className="font-serif text-4xl font-bold">
          {currentBid.toLocaleString("fr-FR")} €
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {bidCount} enchères
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 bg-background rounded-md">
        <Clock className="h-5 w-5 text-accent" />
        <div>
          <p className="text-sm font-medium">Se termine le</p>
          <p className="text-xs text-muted-foreground">{endDate}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Quick bid buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(1)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {increment}€
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(2)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {increment * 2}€
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickBid(5)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {increment * 5}€
          </Button>
        </div>

        {/* Custom bid input */}
        <div className="flex gap-2">
          <Input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={currentBid + increment}
            step={increment}
            className="flex-1"
          />
          <Button size="lg" className="px-8" onClick={handleBid}>
            Enchérir
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Enchère minimum : {(currentBid + increment).toLocaleString("fr-FR")} €
          • Palier : {increment}€
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Prix de départ : {startingBid.toLocaleString("fr-FR")} € • Prix
          minimum : {priceMin.toLocaleString("fr-FR")} €
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button variant="outline" className="w-full bg-transparent">
          <Heart className="h-4 w-4 mr-2" />
          Suivre cette enchère
        </Button>
      </div>
    </Card>
  );
}
