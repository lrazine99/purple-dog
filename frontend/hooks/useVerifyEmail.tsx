import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/lib/api/auth.service";

export function useVerifyEmail() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (token: string) => verifyEmail(token),
  });
}
