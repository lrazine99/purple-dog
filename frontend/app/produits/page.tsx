"use client";
import { CategorySlider } from "@/components/categories/CategorySlider";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useSelectedCategory } from "@/contexts/CategoryContext";
import { useItems } from "@/hooks/useItems";
import { useAuth } from "@/hooks/useAuth";
import { Fragment, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const { selectedCategory } = useSelectedCategory();
  const { data: currentUser } = useAuth();

  const categoryKey = useMemo(
    () => selectedCategory?.id ?? "all",
    [selectedCategory?.id]
  );

  const [limit, setLimit] = useState(12);
  const [lastCategoryKey, setLastCategoryKey] = useState(categoryKey);

  const [selectedSaleTypes, setSelectedSaleTypes] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>(
    []
  );

  if (categoryKey !== lastCategoryKey) {
    setLimit(12);
    setLastCategoryKey(categoryKey);
    setSelectedSubCategories([]);
  }

  const {
    data: items,
    isLoading,
    error,
  } = useItems({
    categoryId: selectedCategory?.id,
    limit: 100,
  });

  const currentUserId = currentUser?.id;
  
  const filteredItems = useMemo(() => {
    if (!items) return [];

    // Only show publicly visible items (published, for_sale)
    // Hide: draft, pending, pending_expertise, cancelled, expired, blocked, deleted, sold
    const publicStatuses = ["published", "for_sale"];
    let filtered = items.filter((item) => publicStatuses.includes(item.status));

    // Exclude items owned by the current user
    if (currentUserId) {
      filtered = filtered.filter((item) => item.seller_id !== currentUserId);
    }

    if (selectedSaleTypes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedSaleTypes.includes(item.sale_mode)
      );
    }

    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((item) =>
        item.category_id !== null && selectedSubCategories.includes(item.category_id)
      );
    }

    return filtered;
  }, [items, selectedSaleTypes, selectedSubCategories, currentUserId]);

  const paginatedItems = filteredItems.slice(0, limit);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 12);
  };

  const hasMore = paginatedItems.length < filteredItems.length;

  return (
    <Fragment>
      <CategorySlider />

      {selectedCategory && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
              {selectedCategory?.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              DESCRIPTION A AJOUTER DANS LADMINISTRATION DE LA CATEGORIE
            </p>
          </div>
        </div>
      )}

      {!selectedCategory && (
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-8">
            AFFICHER TOUT LES PRODUITS
          </h1>
        </div>
      )}

      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-4">
              <p className="text-sm text-muted-foreground mb-6">
                {filteredItems.length} objet
                {filteredItems.length > 1 ? "s" : ""} disponible
                {filteredItems.length > 1 ? "s" : ""}
              </p>
              <ProductFilters
                selectedCategoryId={selectedCategory?.id}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryChange={setSelectedSubCategories}
                selectedSaleTypes={selectedSaleTypes}
                onSaleTypeChange={setSelectedSaleTypes}
              />
            </div>
          </aside>

          <div className="flex-1">
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Chargement des produits...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">
                  Erreur lors du chargement des produits
                </p>
              </div>
            )}

            {paginatedItems.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucun produit disponible avec ces filtres
                </p>
              </div>
            )}

            {paginatedItems.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedItems.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {paginatedItems.length} sur {filteredItems.length} produit
                    {filteredItems.length > 1 ? "s" : ""}
                  </p>

                  {hasMore && (
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Chargement..." : "Charger plus de produits"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
