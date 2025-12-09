import { useMutation } from "@tanstack/react-query";
import { login, LoginResponse } from "@/lib/api/auth.service";
import { LoginForm } from "@/lib/type/auth.type";

export function useLogin() {
    return useMutation<LoginResponse, Error, LoginForm>({
        mutationFn: (data) => login(data.email, data.password),
    });
}
