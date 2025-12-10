import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/lib/api/favorite.service";
import { FavoritesResponse } from "@/lib/type/favorite.type";

export function useFavorites() {
  return useQuery<FavoritesResponse>({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
