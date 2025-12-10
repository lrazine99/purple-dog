"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Category } from "@/lib/type/category.type";

interface CategoryContextType {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useSelectedCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedCategory must be used within a CategoryProvider"
    );
  }
  return context;
}
