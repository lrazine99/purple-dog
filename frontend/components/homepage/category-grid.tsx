"use client";

import { Card } from "@/components/ui/card";
import {
  Armchair,
  Book,
  Box,
  Camera,
  Car,
  Clock,
  Gem,
  Music,
  Package,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

const categories = [
  { name: "Bijoux & montres", icon: Gem, query: "luxury+jewelry+watches" },
  { name: "Meubles anciens", icon: Armchair, query: "antique+furniture" },
  {
    name: "Objets d'art & tableaux",
    icon: Palette,
    query: "fine+art+paintings",
  },
  {
    name: "Objets de collection",
    icon: Package,
    query: "collectibles+toys+stamps",
  },
  { name: "Vins & spiritueux", icon: Wine, query: "vintage+wine+spirits" },
  {
    name: "Instruments de musique",
    icon: Music,
    query: "vintage+musical+instruments",
  },
  {
    name: "Livres anciens & manuscrits",
    icon: Book,
    query: "rare+antique+books+manuscripts",
  },
  {
    name: "Mode & accessoires de luxe",
    icon: ShoppingBag,
    query: "luxury+fashion+bags",
  },
  {
    name: "Horlogerie & pendules anciennes",
    icon: Clock,
    query: "antique+clocks+pendulum",
  },
  {
    name: "Photographies anciennes",
    icon: Camera,
    query: "vintage+cameras+photos",
  },
  {
    name: "Vaisselle & argenterie",
    icon: UtensilsCrossed,
    query: "silverware+crystal+tableware",
  },
  {
    name: "Sculptures & objets décoratifs",
    icon: Box,
    query: "sculptures+decorative+art",
  },
  {
    name: "Véhicules de collection",
    icon: Car,
    query: "classic+vintage+vehicles",
  },
];

export default function CategoryGrid() {
  // Duplicate categories for seamless infinite scroll
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Explorez nos catégories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des objets d'exception dans tous les domaines
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex gap-4 md:gap-6 animate-scroll">
            {duplicatedCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={`${category.name}-${index}`}
                  className="group relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40 cursor-pointer overflow-hidden border-2 border-border transition-all hover:border-primary hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent p-4">
                    <Icon className="mb-2 h-6 w-6 text-primary transition-transform group-hover:scale-110 md:h-8 md:w-8" />
                    <p className="text-center font-serif text-xs font-semibold text-foreground md:text-sm leading-tight">
                      {category.name}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
          display: flex;
          width: fit-content;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
