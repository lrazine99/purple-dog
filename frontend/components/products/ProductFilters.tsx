"use client";

import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/lib/type/category.type";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProductFiltersProps {
  selectedCategoryId?: number;
  selectedSubCategories: number[];
  onSubCategoryChange: (categoryIds: number[]) => void;
  selectedSaleTypes: string[];
  onSaleTypeChange: (types: string[]) => void;
}

export function ProductFilters({
  selectedCategoryId,
  selectedSubCategories,
  onSubCategoryChange,
  selectedSaleTypes,
  onSaleTypeChange,
}: ProductFiltersProps) {
  const { data: categories } = useCategories();

  const getSubCategories = (): Category[] => {
    if (!categories) return [];

    if (selectedCategoryId) {
      return categories.filter((cat) => cat.parent_id === selectedCategoryId);
    } else {
      return categories.filter(
        (cat) => cat.parent_id !== null && cat.parent_id !== undefined
      );
    }
  };

  const subCategories = getSubCategories();

  const handleSaleTypeToggle = (type: string) => {
    if (selectedSaleTypes.includes(type)) {
      onSaleTypeChange(selectedSaleTypes.filter((t) => t !== type));
    } else {
      onSaleTypeChange([...selectedSaleTypes, type]);
    }
  };

  const handleSubCategoryToggle = (categoryId: number) => {
    if (selectedSubCategories.includes(categoryId)) {
      onSubCategoryChange(
        selectedSubCategories.filter((id) => id !== categoryId)
      );
    } else {
      onSubCategoryChange([...selectedSubCategories, categoryId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-4">Filtres</h3>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Type de vente</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auction"
              checked={selectedSaleTypes.includes("auction")}
              onCheckedChange={() => handleSaleTypeToggle("auction")}
            />
            <Label
              htmlFor="auction"
              className="text-sm font-normal cursor-pointer"
            >
              Enchères
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fast"
              checked={selectedSaleTypes.includes("fast")}
              onCheckedChange={() => handleSaleTypeToggle("fast")}
            />
            <Label
              htmlFor="fast"
              className="text-sm font-normal cursor-pointer"
            >
              Vente directe
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {subCategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Catégories</h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {subCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedSubCategories.includes(category.id)}
                  onCheckedChange={() => handleSubCategoryToggle(category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
