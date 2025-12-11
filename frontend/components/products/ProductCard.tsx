"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Gavel, Heart } from "lucide-react";
import { Item } from "@/lib/type/item.type";
import { useFavoriteMutation } from "@/hooks/useFavoriteMutation";
import { useFavorites } from "@/hooks/useFavorites";
import { useMemo } from "react";

interface ProductCardProps {
  product: Item;
}

export function ProductCard({ product }: ProductCardProps) {
  const isAuction = product.sale_mode === "auction";

  const { addFavorite, removeFavorite, isAdding, isRemoving } =
    useFavoriteMutation();
  const { data: favorites } = useFavorites();

  const isFavorited = useMemo(() => {
    if (!favorites) return false;
    return favorites.some((fav) => fav.item_id === product.id);
  }, [favorites, product.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorited) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
  };

  const getTimeRemaining = () => {
    if (!product.auction_end_date) return null;

    const endDate = new Date(product.auction_end_date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return "Terminée";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `dans ${days}j ${hours}h`;
    return `dans ${hours}h`;
  };

  // Get primary photo or first photo
  const primaryPhoto = product.photos?.find((p) => p.is_primary) || product.photos?.[0];

  return (
    <Link href={`/produits/${product.id}`}>
      <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Image à venir</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur hover:bg-background z-10"
            onClick={handleFavoriteClick}
            disabled={isAdding || isRemoving}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </Button>

          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={isAuction ? "default" : "secondary"}
              className="font-medium"
            >
              {isAuction ? (
                <span className="flex items-center gap-1">
                  <Gavel className="h-3 w-3" />
                  Enchère
                </span>
              ) : (
                "Vente Directe"
              )}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">
                {isAuction ? "Enchère actuelle" : "Prix"}
              </span>
              <span className="font-serif text-lg font-semibold">
                {isAuction
                  ? (
                      product.auction_start_price || product.price_min
                    ).toLocaleString("fr-FR")
                  : product.price_desired.toLocaleString("fr-FR")}{" "}
                €
              </span>
            </div>

            {isAuction && product.auction_end_date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground min-h-[1.25rem]">
                <Clock className="h-3.5 w-3.5" />
                <span>Se termine {getTimeRemaining()}</span>
              </div>
            )}

            {!isAuction && <div className="min-h-[1.25rem]" />}

            <Button
              className={isAuction ? "w-full" : "w-full bg-transparent"}
              size="sm"
              variant={isAuction ? "default" : "outline"}
            >
              {isAuction ? "Placer une enchère" : "Voir le produit"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
