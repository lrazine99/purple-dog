"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useItems } from "@/hooks/useItems"
import { Item } from "@/lib/type/item.type"
import Link from "next/link"
import { ROUTES } from "@/helper/routes"

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Récupérer les produits publiés depuis l'API
  const { data: itemsData, isLoading, error } = useItems({ limit: 10 });
  
  // Filtrer et préparer les items pour le carrousel
  const items = useMemo(() => {
    if (!itemsData) return [];
    
    // Filtrer les produits publiés et qui ont au moins une photo
    const publishedItems = itemsData
      .filter((item: Item) => item.status === "published" && item.photos && item.photos.length > 0)
      .slice(0, 5); // Limiter à 5 produits
    
    return publishedItems.map((item: Item) => {
      // Trouver la photo principale ou la première photo
      const primaryPhoto = item.photos?.find((p) => p.is_primary) || item.photos?.[0];
      
      // Construire l'URL de l'image (utiliser la route proxy si nécessaire)
      let imageUrl = primaryPhoto?.url || "/placeholder.svg";
      if (imageUrl.startsWith("/upload/")) {
        imageUrl = `/api${imageUrl}`;
      }
      
      // Formater le prix
      const priceFormatted = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(Number(item.price_desired));
      
      return {
        id: item.id,
        title: item.name,
        description: item.description,
        result: `Prix souhaité : ${priceFormatted}`,
        image: imageUrl,
        href: `${ROUTES.PRODUITS}/${item.id}`,
      };
    });
  }, [itemsData]);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [items.length])

  const nextSlide = () => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  const prevSlide = () => {
    if (items.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  // État de chargement
  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <Card className="overflow-hidden border-2 border-primary/20 bg-card shadow-xl">
            <div className="flex items-center justify-center h-64 md:h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // État d'erreur ou pas d'items
  if (error || items.length === 0) {
    return null; // Ne rien afficher si erreur ou pas d'items
  }

  const currentItem = items[currentIndex];

  return (
    <section className="bg-secondary/30 py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <Card className="overflow-hidden border-2 border-primary/20 bg-card shadow-xl">
          <div className="grid gap-6 md:grid-cols-2 md:gap-0">
            {/* Carrousel d'images */}
            <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.title} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </Link>
              ))}

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background/90"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 text-foreground hover:bg-background/90"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex ? "w-8 bg-primary" : "bg-background/60 hover:bg-background/80"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Descriptifs */}
            <div className="flex flex-col justify-center gap-6 p-8 md:p-12">
              <div className="space-y-4">
                <Badge className="w-fit bg-primary text-primary-foreground">En Vente</Badge>
                <Link href={currentItem.href}>
                  <h2 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl hover:text-primary transition-colors">
                    {currentItem.title}
                  </h2>
                </Link>
                <p className="text-lg text-muted-foreground line-clamp-3">{currentItem.description}</p>
              </div>

              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Prix souhaité</p>
                <p className="font-serif text-3xl font-bold text-primary">{currentItem.result}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nos experts évaluent vos objets avec précision et les mettent en relation avec des acheteurs
                  qualifiés.
                </p>
                <Link href={currentItem.href}>
                  <Button className="w-full md:w-auto">Voir les détails</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
