import { loginWithCookies } from "@/lib/api/auth.service";
import { LoginForm } from "@/lib/type/auth.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; id?: number; email?: string; role?: string },
    Error,
    LoginForm
  >({
    mutationFn: async (data) => {
      const response = await loginWithCookies(data.email, data.password);
      return response;
    },
    onSuccess: (data) => {
      // Invalider le cache auth pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // Si on a les données utilisateur, mettre à jour directement le cache
      if (data.id && data.email && data.role) {
        queryClient.setQueryData(["auth", "me"], {
          id: data.id,
          email: data.email,
          role: data.role,
        });
      }
    },
  });
}
