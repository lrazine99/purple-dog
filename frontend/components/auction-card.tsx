"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Heart, Plus, AlertTriangle } from "lucide-react";

interface AuctionCardProps {
  itemId: number;
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
  itemId,
  currentBid,
  startingBid,
  bidCount,
  endDate,
  priceMin,
}: AuctionCardProps) {
  const increment = getBidIncrement(Number(currentBid));
  const [bidAmount, setBidAmount] = useState(Number(currentBid) + increment);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickBid = () => {
    setBidAmount(Number(currentBid) + increment);
    setShowConfirmDialog(true);
  };

  const handleConfirmBid = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to place bid
      const response = await fetch(`/api/items/${itemId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: bidAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enchère");
      }

      // Success - reload page or update state
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Erreur lors de l'enchère. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-4 bg-muted/30">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Enchère actuelle</p>
          <p className="font-serif text-4xl font-bold">
            {currentBid.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
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
          {/* Single quick bid button matching current bracket */}
          <Button
            variant="default"
            size="lg"
            onClick={handleQuickBid}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Enchérir +
            {increment.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Enchère minimum :{" "}
            {(Number(currentBid) + increment).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            € • Palier :{" "}
            {increment.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Prix de départ :{" "}
            {startingBid.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            € • Prix minimum :{" "}
            {priceMin.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmer votre enchère
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                Vous êtes sur le point de placer une enchère de{" "}
                <span className="font-bold text-foreground">
                  {bidAmount.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </p>
              <p className="text-sm">
                En confirmant cette enchère, vous vous engagez à acheter cet
                article si vous remportez l&apos;enchère. Cette action est
                irrévocable.
              </p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Détails de l&apos;enchère :</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    • Montant :{" "}
                    {bidAmount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </li>
                  <li>
                    • Enchère actuelle :{" "}
                    {currentBid.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </li>
                  <li>
                    • Augmentation : +
                    {increment.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    €
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirmBid} disabled={isSubmitting}>
              {isSubmitting ? "Enchère en cours..." : "Confirmer l'enchère"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
