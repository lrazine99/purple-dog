"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateBid,
  useCurrentWinningBid,
  useItemBids,
} from "@/hooks/useBids";
import { useToast } from "@/hooks/useToast";
import { getBidIncrement, getNextBidAmount } from "@/lib/api/bid.service";
import { Gavel, Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CountdownTimer } from "./countdown-timer";

interface AuctionBiddingProps {
  itemId: number;
  startingPrice: number;
  priceMin: number;
  createdAt: string;
  minAmountBid: number | null;
}

export function AuctionBidding({
  itemId,
  startingPrice,
  createdAt,
}: AuctionBiddingProps) {
  const endDate = new Date(createdAt);
  endDate.setDate(endDate.getDate() + 7);

  const { data: user } = useAuth();
  const { toast } = useToast();
  const { data: winningBid, isLoading: isLoadingWinning } =
    useCurrentWinningBid(itemId);

  const createBidMutation = useCreateBid(itemId);
  const { data: bids, isLoading: isLoadingBids } = useItemBids(itemId);

  // Récupérer le montant de la dernière enchère (peut être 0 si pas d'enchères)
  const lastBidPrice =
    bids && bids.length > 0 ? Number(bids[bids.length - 1].amount) : 0;

  const winningBidAmount = winningBid?.amount ? Number(winningBid.amount) : 0;
  const startPrice = startingPrice ? Number(startingPrice) : 0;

  const currentPrice = Math.max(winningBidAmount, lastBidPrice, startPrice);

  const hasExistingBids = winningBid || (bids && bids.length > 0);
  const nextBidAmount = hasExistingBids
    ? getNextBidAmount(currentPrice)
    : currentPrice;

  const minBidAmount = currentPrice + 1;

  const increment = getBidIncrement(currentPrice);

  const [bidAmount, setBidAmount] = useState<number>(nextBidAmount);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [isAutoBid, setIsAutoBid] = useState(false);

  useEffect(() => {
    setBidAmount(nextBidAmount);
  }, [nextBidAmount]);

  const handleBid = async () => {
    if (!bidAmount) {
      toast({
        variant: "error",
        message: "Montant invalide",
        description: "Veuillez entrer un montant valide",
      });
      return;
    }
    if (!user) {
      toast({
        variant: "error",
        message: "Connexion requise",
        description: "Vous devez être connecté pour enchérir",
      });
      return;
    }

    // Une enchère doit être strictement supérieure à la dernière enchère (minimum 1€ de plus)
    const absoluteMinAmount = minBidAmount;

    if (lastBidPrice && bidAmount <= lastBidPrice) {
      toast({
        variant: "error",
        message: "Montant invalide",
        description: `Le montant doit être supérieur à ${Number(
          lastBidPrice
        ).toFixed(2)}€. Le minimum est de ${(lastBidPrice + 1).toFixed(2)}€`,
      });
      return;
    }

    if (bidAmount < absoluteMinAmount) {
      toast({
        variant: "error",
        message: "Montant invalide",
        description: `Le montant minimum est de ${absoluteMinAmount.toFixed(
          2
        )}€ (1€ de plus que la dernière enchère)`,
      });
      return;
    }

    if (isAutoBid && minAmount && minAmount <= bidAmount) {
      toast({
        variant: "error",
        message: "Montant minimum invalide",
        description: `Le montant minimum requis doit être supérieur à votre enchère actuelle (${bidAmount.toFixed(
          2
        )}€)`,
      });
      return;
    }

    try {
      const bidData: { amount: number; min_amount?: number } = {
        amount: Number(bidAmount),
      };

      if (isAutoBid && minAmount) {
        bidData.min_amount = Number(minAmount);
      }

      await createBidMutation.mutateAsync(bidData);

      toast({
        variant: "success",
        message: "Enchère placée",
        description: isAutoBid
          ? `Enchère automatique placée jusqu'à ce que le montant minimum de ${minAmount}€ soit atteint`
          : `Votre enchère de ${bidAmount.toFixed(2)}€ a été placée`,
      });

      setBidAmount(nextBidAmount);
      setMinAmount(null);
      setIsAutoBid(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'enchère:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'enchère";
      toast({
        variant: "error",
        message: "Erreur",
        description: errorMessage,
      });
    }
  };

  if (isLoadingWinning || isLoadingBids) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bidCount = bids?.length || 0;
  const isWinning = winningBid?.user_id === user?.id;

  return (
    <div className="space-y-6 p-6 border border-border rounded-lg bg-card">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Enchères
          </h3>
          {isWinning && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Vous êtes en tête
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold">
                {currentPrice.toFixed(2)}€
              </span>
              <span className="text-sm text-muted-foreground">
                ({bidCount} enchère{bidCount > 1 ? "s" : ""})
              </span>
            </div>
            <div className="mt-2">
              <CountdownTimer endDate={endDate} />
            </div>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bid-amount">Montant de l&apos;enchère</Label>
                <div className="flex gap-2">
                  <Input
                    id="bid-amount"
                    type="number"
                    min={minBidAmount}
                    step="any"
                    value={bidAmount || ""}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">
                    €
                  </span>
                </div>
                {hasExistingBids ? (
                  <p className="text-xs text-muted-foreground">
                    Prix libre : minimum {minBidAmount.toFixed(2)}€ (1€ de plus
                    que la dernière enchère). Montant suggéré selon les paliers
                    : {nextBidAmount.toFixed(2)}€
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Prix libre : vous pouvez enchérir à partir de{" "}
                    {currentPrice.toFixed(2)}€
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-bid"
                  checked={isAutoBid}
                  onChange={(e) => {
                    setIsAutoBid(e.target.checked);
                    if (!e.target.checked) {
                      setMinAmount(null);
                    }
                  }}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="auto-bid"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Enchère automatique
                </Label>
              </div>

              {isAutoBid && (
                <div className="space-y-2">
                  <Label htmlFor="min-amount">
                    Montant minimum requis (l&apos;enchère automatique
                    continuera jusqu&apos;à ce que ce montant soit atteint)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="min-amount"
                      type="number"
                      min={minBidAmount}
                      step="any"
                      value={minAmount || ""}
                      onChange={(e) =>
                        setMinAmount(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="flex-1"
                      placeholder={`Minimum: ${(bidAmount + 1).toFixed(2)}€`}
                    />
                    <span className="flex items-center text-muted-foreground">
                      €
                    </span>
                  </div>
                  {minAmount && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        L&apos;enchère automatique continuera jusqu&apos;à ce
                        que le montant de {minAmount.toFixed(2)}€ soit atteint
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Les enchères suivront les paliers (
                        {increment.toFixed(2)}€) jusqu&apos;à atteindre{" "}
                        {minAmount.toFixed(2)}€
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleBid}
                disabled={createBidMutation.isPending}
                className="w-full"
              >
                {createBidMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    En cours...
                  </>
                ) : (
                  <>
                    <Gavel className="h-4 w-4 mr-2" />
                    Placer une enchère
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour placer une enchère
              </p>
            </div>
          )}

          {bids && bids.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold">Historique des enchères</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {bids.slice(0, 5).map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                  >
                    <div>
                      <span className="font-medium">
                        {bid.amount.toFixed(2)}€
                      </span>
                      {bid.type === "auto" && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (auto)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
