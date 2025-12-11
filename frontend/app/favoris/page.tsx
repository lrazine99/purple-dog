"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Fragment } from "react";

export default function FavorisPage() {
  const { data: favorites, isLoading, error } = useFavorites();

  return (
    <Fragment>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-8">
          Mes Favoris
        </h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des favoris...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">
              {error.message === "Non authentifié"
                ? "Vous devez être connecté pour voir vos favoris"
                : "Erreur lors du chargement des favoris"}
            </p>
          </div>
        )}

        {favorites && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Vous n&apos;avez pas encore de favoris
            </p>
            <p className="text-sm text-muted-foreground">
              Cliquez sur le cœur sur les produits pour les ajouter à vos
              favoris
            </p>
          </div>
        )}

        {favorites && favorites.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {favorites.length} produit{favorites.length > 1 ? "s" : ""} en
              favori
              {favorites.length > 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <ProductCard key={favorite.id} product={favorite.item} />
              ))}
            </div>
          </>
        )}
      </div>
    </Fragment>
  );
}
