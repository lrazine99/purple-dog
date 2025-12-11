import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getItemBids,
  getCurrentWinningBid,
  createBid,
  getMyBids,
  type CreateBidDto,
} from "@/lib/api/bid.service";

export function useItemBids(itemId: number) {
  return useQuery({
    queryKey: ["bids", "item", itemId],
    queryFn: () => getItemBids(itemId),
    enabled: !!itemId,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes pour les enchères en temps réel
  });
}

export function useCurrentWinningBid(itemId: number) {
  return useQuery({
    queryKey: ["bids", "item", itemId, "winning"],
    queryFn: () => getCurrentWinningBid(itemId),
    enabled: !!itemId,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });
}

export function useCreateBid(itemId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBidDto) => createBid(itemId, dto),
    onSuccess: () => {
      // Invalider les queries liées aux enchères
      queryClient.invalidateQueries({ queryKey: ["bids", "item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["bids", "my-bids"] });
    },
  });
}

export function useMyBids() {
  return useQuery({
    queryKey: ["bids", "my-bids"],
    queryFn: () => getMyBids(),
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });
}

