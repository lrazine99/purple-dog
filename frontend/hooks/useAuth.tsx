import { UserResponse } from "@/lib/type/auth.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type AuthResponse = Pick<UserResponse, "id" | "email" | "role">;

export function useAuth() {
  return useQuery<AuthResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Non authentifié");
      }

      const data = await response.json();

      return {
        id: data.id,
        email: data.email,
        role: data.role,
      };
    },
    refetchInterval: 10 * 60 * 1000, // Rafraîchir toutes les 10 minutes
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Garder le cache 10 minutes
    refetchOnMount: false, // Ne pas refaire la requête au montage si les données sont fraîches
    refetchOnWindowFocus: false, // Ne pas refaire la requête au focus de la fenêtre
  });
}
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/connexion";
    },
  });
}
