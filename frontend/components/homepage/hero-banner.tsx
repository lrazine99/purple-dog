"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  {
    id: 1,
    title: "Tableau Impressionniste",
    description: "Huile sur toile du XIXe siècle",
    result: "Vendu à 15 000€",
    image: "/impressionist-landscape.png",
  },
  {
    id: 2,
    title: "Montre de Collection",
    description: "Rolex Submariner vintage 1960",
    result: "Vendu à 25 000€",
    image: "/vintage-luxury-watch.jpg",
  },
  {
    id: 3,
    title: "Vase Ming",
    description: "Porcelaine chinoise authentique",
    result: "Vendu à 8 500€",
    image: "/chinese-ming-vase.jpg",
  },
  {
    id: 4,
    title: "Sculpture Bronze",
    description: "Œuvre signée Rodin",
    result: "Vendu à 42 000€",
    image: "/bronze-sculpture-rodin.jpg",
  },
  {
    id: 5,
    title: "Mobilier Art Déco",
    description: "Fauteuil en palissandre",
    result: "Vendu à 6 200€",
    image: "/art-deco-furniture.jpg",
  },
]

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
  }

  return (
    <section className="bg-secondary/30 py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <Card className="overflow-hidden border-2 border-primary/20 bg-card shadow-xl">
          <div className="grid gap-6 md:grid-cols-2 md:gap-0">
            {/* Carrousel d'images */}
            <div className="relative aspect-square overflow-hidden bg-muted md:aspect-auto">
              {items.map((item, index) => (
                <div
                  key={item.id}
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
                </div>
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
                <Badge className="w-fit bg-primary text-primary-foreground">Vente Récente</Badge>
                <h2 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  {items[currentIndex].title}
                </h2>
                <p className="text-lg text-muted-foreground">{items[currentIndex].description}</p>
              </div>

              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Résultat de vente</p>
                <p className="font-serif text-3xl font-bold text-primary">{items[currentIndex].result}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nos experts évaluent vos objets avec précision et les mettent en relation avec des acheteurs
                  qualifiés.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
