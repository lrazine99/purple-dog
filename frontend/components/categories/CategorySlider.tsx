"use client";

import { useCategories } from "@/hooks/useCategories";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CategorySlider() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading || error || !categories || categories.length === 0) {
    return null;
  }

  const parentCategories = categories.filter(
    (category) =>
      category.parent_id === null || category.parent_id === undefined
  );

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-border bg-background py-4">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {parentCategories.map((category) => (
              <CarouselItem
                key={category.id}
                className="pl-2 md:pl-4 basis-auto"
              >
                <button className="flex flex-col items-center gap-2 transition-colors hover:text-primary focus:outline-none focus:text-primary group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                    <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
                  </div>
                  <span
                    className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary max-w-[100px] truncate text-center"
                    title={category.name}
                  >
                    {category.name}
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
}
