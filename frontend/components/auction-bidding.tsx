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
import { useState } from "react";
import { CountdownTimer } from "./countdown-timer";

interface AuctionBiddingProps {
  itemId: number;
  startingPrice: number;
  priceMin: number;
  createdAt: string;
}

export function AuctionBidding({
  itemId,
  startingPrice,
  priceMin,
  createdAt,
}: AuctionBiddingProps) {
  // Calculer la date de fin (une semaine après created_at)
  const endDate = new Date(createdAt);
  endDate.setDate(endDate.getDate() + 7);

  const { data: user } = useAuth();
  const { toast } = useToast();
  const { data: winningBid, isLoading: isLoadingWinning } =
    useCurrentWinningBid(itemId);
  const { data: bids, isLoading: isLoadingBids } = useItemBids(itemId);
  const createBidMutation = useCreateBid(itemId);

  const currentPrice = Number(
    winningBid ? winningBid.amount : startingPrice || priceMin || 0
  );

  // Si c'est le prix de départ (pas encore d'enchère), l'utilisateur peut enchérir au prix de départ (prix libre)
  // Sinon, calculer selon les paliers
  const nextBidAmount = winningBid
    ? getNextBidAmount(currentPrice)
    : currentPrice; // Si pas d'enchère, on peut enchérir au prix de départ (prix libre)

  // Montant minimum : soit le palier calculé, soit 1€ de plus que la dernière enchère
  const minBidAmount = winningBid
    ? Math.max(nextBidAmount, currentPrice + 1)
    : currentPrice;

  const increment = getBidIncrement(currentPrice);

  const [bidAmount, setBidAmount] = useState(nextBidAmount);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [isAutoBid, setIsAutoBid] = useState(false);

  const handleBid = async () => {
    if (!user) {
      toast({
        variant: "error",
        message: "Connexion requise",
        description: "Vous devez être connecté pour enchérir",
      });
      return;
    }

    // Une enchère doit être strictement supérieure à la dernière enchère (minimum 1€ de plus)
    const absoluteMinAmount = winningBid
      ? Number(winningBid.amount) + 1
      : currentPrice;

    if (winningBid && bidAmount <= winningBid.amount) {
      toast({
        variant: "error",
        message: "Montant invalide",
        description: `Le montant doit être supérieur à ${Number(
          winningBid.amount
        ).toFixed(2)}€. Le minimum est de ${absoluteMinAmount.toFixed(2)}€`,
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

    if (isAutoBid && maxAmount && maxAmount < bidAmount) {
      toast({
        variant: "error",
        message: "Montant maximum invalide",
        description: `Le montant maximum doit être supérieur ou égal à ${bidAmount}€`,
      });
      return;
    }

    try {
      const bidData: { amount: number; max_amount?: number } = {
        amount: Number(bidAmount),
      };

      if (isAutoBid && maxAmount) {
        bidData.max_amount = Number(maxAmount);
      }

      await createBidMutation.mutateAsync(bidData);

      toast({
        variant: "success",
        message: "Enchère placée",
        description: isAutoBid
          ? `Enchère automatique placée jusqu'à ${maxAmount}€`
          : `Votre enchère de ${bidAmount}€ a été placée`,
      });

      setBidAmount(nextBidAmount);
      setMaxAmount(null);
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
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="flex-1"
                    placeholder={
                      winningBid
                        ? `Minimum: ${minBidAmount.toFixed(
                            2
                          )}€ (suggesté: ${nextBidAmount.toFixed(2)}€)`
                        : `Minimum: ${currentPrice.toFixed(2)}€`
                    }
                  />
                  <span className="flex items-center text-muted-foreground">
                    €
                  </span>
                </div>
                {winningBid ? (
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
                      setMaxAmount(null);
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
                  <Label htmlFor="max-amount">
                    Montant maximum (l&apos;enchère se fera automatiquement
                    jusqu&apos;à ce montant)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="max-amount"
                      type="number"
                      min={bidAmount}
                      step="any"
                      value={maxAmount || getNextBidAmount(bidAmount).toString()}
                      onChange={(e) =>
                        setMaxAmount(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="flex-1"
                      placeholder="Montant libre ou selon paliers"
                    />
                    <span className="flex items-center text-muted-foreground">
                      €
                    </span>
                  </div>
                  {maxAmount && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        L&apos;enchère sera automatiquement augmentée
                        jusqu&apos;à {maxAmount}€
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {maxAmount >= getNextBidAmount(bidAmount) ? (
                          <span>
                            Les enchères suivront les paliers ({increment}€)
                            quand possible, ou utiliseront un prix libre
                            jusqu&apos;à {maxAmount}€
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">
                            Le montant maximum doit être supérieur ou égal à{" "}
                            {getNextBidAmount(bidAmount)}€
                          </span>
                        )}
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
