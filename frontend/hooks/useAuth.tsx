import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserResponse } from "@/lib/type/auth.type";

export function useAuth() {
  return useQuery<UserResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        throw new Error("Non authentifié");
      }

      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
