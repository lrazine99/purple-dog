import { useQuery } from "@tanstack/react-query";
import { getItems } from "@/lib/api/item.service";
import { ItemsResponse } from "@/lib/type/item.type";

interface UseItemsParams {
  categoryId?: number;
  limit?: number;
  offset?: number;
}

export function useItems(params: UseItemsParams = {}) {
  return useQuery<ItemsResponse>({
    queryKey: ["items", params],
    queryFn: () => getItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
