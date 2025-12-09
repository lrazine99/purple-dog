import { ProfessionalRegisterForm, ParticularRegisterForm, UserResponse } from "@/lib/type/auth.type";
import { userResponseSchema } from "../validation/auth.schema";

export interface RegisterPayload {
    role?: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    address_line?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    website_company?: string;
    items_preference?: string;
    speciality?: string;
    profile_picture?: string;
    newsletter?: boolean;
    rgpd_accepted?: boolean;
    company_name?: string;
    siret?: string;
    official_document_url?: string;
    cgv_accepted?: boolean;
}

export async function registerProfessional(
    data: ProfessionalRegisterForm
): Promise<UserResponse> {
    const { confirmPassword, ...payload } = data;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Erreur lors de l'inscription" }));
        throw new Error(error.message || "Erreur lors de l'inscription");
    }

    const rawData = await response.json();

    // Valider la réponse avec le schéma Zod
    const parseResult = userResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
        throw new Error("Format de réponse API invalide");
    }

    return parseResult.data;
}

export async function registerParticular(
    data: ParticularRegisterForm
): Promise<UserResponse> {
    const { confirmPassword, ...payload } = data;

    console.log("payload", payload)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    console.log("response", response)
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Erreur lors de l'inscription" }));
        throw new Error(error.message || "Erreur lors de l'inscription");
    }

    const rawData = await response.json();

    const parseResult = userResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
        throw new Error("Format de réponse API invalide");
    }

    return parseResult.data;
}

export type { UserResponse };
