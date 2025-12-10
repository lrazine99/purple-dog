"use client";

import { useCategories } from "@/hooks/useCategories";
import { useSelectedCategory } from "@/contexts/CategoryContext";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CategorySlider() {
  const { data: categories, isLoading, error } = useCategories();
  const { selectedCategory, setSelectedCategory } = useSelectedCategory();

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

  const handleCategoryClick = (category: (typeof parentCategories)[0]) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

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
            {parentCategories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;

              return (
                <CarouselItem
                  key={category.id}
                  className="pl-2 md:pl-4 basis-auto"
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="flex flex-col items-center gap-2 transition-colors hover:text-primary focus:outline-none focus:text-primary group"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted group-hover:bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full transition-colors",
                          isSelected
                            ? "bg-primary-foreground/30"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors max-w-[100px] truncate text-center",
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-muted-foreground group-hover:text-primary"
                      )}
                      title={category.name}
                    >
                      {category.name}
                    </span>
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
}
