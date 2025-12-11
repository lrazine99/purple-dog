"use client";

import { CountdownTimer } from "@/components/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/helper/routes";
import { useAuth } from "@/hooks/useAuth";
import { useMyBids } from "@/hooks/useBids";
import type { Bid } from "@/lib/api/bid.service";
import { Award, Gavel, Loader2, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type BidWithItem = Bid & {
  item?: {
    id: number;
    name: string;
    description: string;
    auction_start_price?: number | null;
    auction_end_date?: string | null;
    created_at: string;
    status: string;
    sale_mode: string;
    photos?: Array<{
      id: number;
      url: string;
      is_primary: boolean;
    }>;
  };
};

export default function MesEncheresPage() {
  const { data: user } = useAuth();
  const { data: bids, isLoading, error } = useMyBids();

  // Filtrer uniquement les enchères actives (en cours)
  const activeBids =
    bids?.filter((bid) => {
      // Vérifier que l'enchère est active
      if (!bid.is_active) return false;

      // Vérifier que c'est l'enchère de l'utilisateur connecté
      if (bid.user_id !== user?.id) return false;

      // Vérifier que l'item existe et n'est pas vendu (statut published ou draft)
      const bidWithItem = bid as BidWithItem;
      if (!bidWithItem.item) return false;

      // Ne garder que les enchères sur des items publiés (pas sold, pas draft)
      return bidWithItem.item.status === "published";
    }) || [];

  // Grouper les enchères par item
  const bidsByItem = activeBids.reduce((acc, bid) => {
    const itemId = bid.item_id;
    if (!acc[itemId]) {
      acc[itemId] = [];
    }
    acc[itemId].push(bid as BidWithItem);
    return acc;
  }, {} as Record<number, BidWithItem[]>);

  console.log(bidsByItem);
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Gavel className="h-8 w-8 text-primary" />
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground">
          Mes Enchères
        </h1>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chargement de vos enchères...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">
            {error.message === "Non authentifié"
              ? "Vous devez être connecté pour voir vos enchères"
              : "Erreur lors du chargement de vos enchères"}
          </p>
        </div>
      )}

      {!isLoading && !error && activeBids.length === 0 && (
        <div className="text-center py-12">
          <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            Vous n&apos;avez pas d&apos;enchères en cours
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Parcourez nos produits et participez aux enchères
          </p>
          <Button asChild>
            <Link href={ROUTES.PRODUITS}>Voir les produits</Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && Object.keys(bidsByItem).length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {Object.keys(bidsByItem).length} enchère
            {Object.keys(bidsByItem).length > 1 ? "s" : ""} en cours
          </p>

          <div className="space-y-6">
            {Object.entries(bidsByItem).map(([itemId, itemBids]) => {
              const highestBid = itemBids.reduce((max, bid) =>
                bid.amount > max.amount ? bid : max
              );
              const isWinning = highestBid.is_winning;

              // Calculer la date de fin (7 jours après created_at de l'item ou auction_end_date)
              const item = highestBid.item ?? null;
              let endDate: Date | null = null;
              if (item) {
                if (item.auction_end_date) {
                  endDate = new Date(item.auction_end_date);
                } else if (item.created_at) {
                  endDate = new Date(item.created_at);
                  endDate.setDate(endDate.getDate() + 7);
                }
              }

              const primaryPhoto =
                item?.photos?.find(
                  (p: { is_primary: boolean }) => p.is_primary
                ) || item?.photos?.[0];

              return (
                <div
                  key={itemId}
                  className="border border-border rounded-lg bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    {primaryPhoto && (
                      <Link
                        href={`${ROUTES.PRODUITS}/${itemId}`}
                        className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                      >
                        <Image
                          src={primaryPhoto.url}
                          alt={item?.name || "Produit"}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    )}

                    {/* Contenu */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <Link
                            href={`${ROUTES.PRODUITS}/${itemId}`}
                            className="hover:text-primary transition-colors"
                          >
                            <h2 className="text-xl font-semibold">
                              {item?.name || `Produit #${itemId}`}
                            </h2>
                          </Link>
                          {isWinning && (
                            <Badge variant="default" className="bg-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              En tête
                            </Badge>
                          )}
                        </div>
                        {item?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Informations des enchères */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Votre meilleure offre
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {highestBid.amount.toFixed(2)}€
                          </p>
                          {itemBids.length > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {itemBids.length} enchère
                              {itemBids.length > 1 ? "s" : ""} au total
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Temps restant
                          </p>
                          {endDate ? (
                            <CountdownTimer endDate={endDate} />
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Date de fin non disponible
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Liste des enchères pour cet item */}
                      {itemBids.length > 1 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">
                            Toutes vos enchères sur cet article :
                          </p>
                          <div className="space-y-2">
                            {itemBids
                              .sort((a, b) => b.amount - a.amount)
                              .map((bid) => (
                                <div
                                  key={bid.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span>{bid.amount.toFixed(2)}€</span>
                                    {bid.type === "auto" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Auto
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      bid.created_at
                                    ).toLocaleDateString("fr-FR", {
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

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`${ROUTES.PRODUITS}/${itemId}`}>
                            Voir l&apos;article
                          </Link>
                        </Button>
                        {!isWinning && (
                          <Button asChild size="sm">
                            <Link href={`${ROUTES.PRODUITS}/${itemId}`}>
                              Re-enchérir
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
