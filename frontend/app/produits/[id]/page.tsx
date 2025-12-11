import { AuctionBidding } from "@/components/auction-bidding";
import { DirectSaleCard } from "@/components/direct-sale-card";
import { ItemOffersSection } from "@/components/offers/ItemOffersSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Calendar,
  ChevronLeft,
  Gavel,
  Heart,
  Share2,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ItemPhoto {
  id: number;
  url: string;
  position: number;
  is_primary: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Item {
  id: number;
  name: string;
  description: string;
  seller_id: number;
  seller?: UserType;
  category_id: number;
  category?: Category;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number;
  price_desired: number;
  price_min: number;
  sale_mode: string;
  status: string;
  auction_start_price?: number | null;
  auction_end_date?: string | null;
  min_amount_bid?: number | null;
  photos?: ItemPhoto[];
  created_at: string;
  updated_at: string;
}

async function getItem(id: string, baseUrl: string): Promise<Item | null> {
  try {
    const url = `${baseUrl}/api/items/${id}`;
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return null;
  }
}

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Obtenir l'URL de base depuis les headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const item = await getItem(id, baseUrl);

  if (!item) {
    notFound();
  }

  const isAuction = item.sale_mode === "auction";
  const primaryPhoto =
    item.photos?.find((p) => p.is_primary) || item.photos?.[0];
  const displayPhotos = item.photos || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              {primaryPhoto ? (
                <Image
                  src={primaryPhoto.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Aucune image disponible
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail Gallery */}
            {displayPhotos.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {displayPhotos.slice(0, 3).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer"
                  >
                    <Image
                      src={photo.url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant={isAuction ? "default" : "secondary"}
                  className="font-medium"
                >
                  {isAuction ? (
                    <span className="flex items-center gap-1.5">
                      <Gavel className="h-3.5 w-3.5" />
                      Enchère en cours
                    </span>
                  ) : (
                    "Vente Directe"
                  )}
                </Badge>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {item.category?.name || "Non catégorisé"}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-3 text-balance">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                {item.seller && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      {item.seller.first_name} {item.seller.last_name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(item.created_at)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            {isAuction ? (
              <AuctionBidding
                itemId={item.id}
                startingPrice={item.auction_start_price || item.price_min || 0}
                priceMin={item.price_min || 0}
                createdAt={item.created_at}
              />
            ) : (
              <DirectSaleCard
                price={item.price_desired}
                itemId={item.id}
                sellerId={item.seller_id}
                itemName={item.name}
              />
            )}

            <section id="offres">
              <ItemOffersSection itemId={item.id} sellerId={item.seller_id} />
            </section>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-md bg-muted/30">
                <Shield className="h-5 w-5 mb-2 text-accent" />
                <p className="text-xs font-medium">Authentifié</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-md bg-muted/30">
                <Truck className="h-5 w-5 mb-2 text-accent" />
                <p className="text-xs font-medium">Livraison assurée</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-md bg-muted/30">
                <Award className="h-5 w-5 mb-2 text-accent" />
                <p className="text-xs font-medium">Garantie</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-12 max-w-4xl">
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">
                Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Caractéristiques</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="font-medium">
                      {item.width_cm} × {item.height_cm} × {item.depth_cm} cm
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Poids</dt>
                    <dd className="font-medium">{item.weight_kg} kg</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mode de vente</dt>
                    <dd className="font-medium">
                      {item.sale_mode === "auction"
                        ? "Enchère"
                        : "Vente directe"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Catégorie</dt>
                    <dd className="font-medium">
                      {item.category?.name || "Non catégorisé"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Informations</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground mb-1">Créé le</dt>
                    <dd className="font-medium">
                      {formatDate(item.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground mb-1">
                      Mis à jour le
                    </dt>
                    <dd className="font-medium">
                      {formatDate(item.updated_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground mb-1">Référence</dt>
                    <dd className="font-medium">#{item.id}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator />

            {item.seller && (
              <div>
                <h3 className="font-semibold mb-4">
                  Informations sur le vendeur
                </h3>
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.seller.first_name} {item.seller.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.seller.email}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Contacter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
