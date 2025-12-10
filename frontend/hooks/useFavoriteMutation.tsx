import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite } from "@/lib/api/favorite.service";
import { useToast } from "@/hooks/useToast";

export function useFavoriteMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        variant: "success",
        message: "Ajouté aux favoris",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "error",
        message: error.message,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        variant: "success",
        message: "Retiré des favoris",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "error",
        message: error.message,
      });
    },
  });

  return {
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
