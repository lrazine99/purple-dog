import { loginWithCookies } from "@/lib/api/auth.service";
import { LoginForm } from "@/lib/type/auth.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, LoginForm>({
    mutationFn: (data) => loginWithCookies(data.email, data.password),
    onSuccess: () => {
      // Invalider le cache auth pour forcer une mise à jour
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
}
