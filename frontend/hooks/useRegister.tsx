import { useMutation } from "@tanstack/react-query";
import { registerProfessional, registerParticular, UserResponse } from "@/lib/api/auth.service";
import { ProfessionalRegisterForm, ParticularRegisterForm } from "@/lib/type/auth.type";

export function useRegisterProfessional() {
    return useMutation<UserResponse, Error, ProfessionalRegisterForm>({
        mutationFn: registerProfessional,
    });
}

export function useRegisterParticular() {
    return useMutation<UserResponse, Error, ParticularRegisterForm>({
        mutationFn: registerParticular,
    });
}
