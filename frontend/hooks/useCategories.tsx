import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/category.service";
import { CategoriesResponse } from "@/lib/type/category.type";

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}
