import { useMutation } from "@tanstack/react-query";
import { LoginForm } from "@/lib/type/auth.type";
import { loginWithCookies } from "@/lib/api/auth.service";

export function useLogin() {
  return useMutation<{ success: boolean }, Error, LoginForm>({
    mutationFn: (data) => loginWithCookies(data.email, data.password),
  });
}
