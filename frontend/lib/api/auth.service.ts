import {
  ProfessionalRegisterForm,
  ParticularRegisterForm,
  UserResponse,
} from "@/lib/type/auth.type";
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

function buildFormData(
  data: Record<string, unknown>,
  file?: File | null,
  fileFieldName?: string
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "confirmPassword") return;
    if (key === fileFieldName) return;

    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (file && fileFieldName) {
    formData.append(fileFieldName, file);
  }

  return formData;
}

export async function registerProfessional(
  data: ProfessionalRegisterForm
): Promise<UserResponse> {
  const { confirmPassword, official_document, ...payload } = data;

  const formData = buildFormData(
    payload,
    official_document,
    "official_document"
  );

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de l'inscription" };
    }
    throw new Error(error.message || "Erreur lors de l'inscription");
  }

  const rawData = await response.json();

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

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("response", response);
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de l'inscription" };
    }
    throw new Error(error.message || "Erreur lors de l'inscription");
  }

  const rawData = await response.json();

  const parseResult = userResponseSchema.safeParse(rawData);

  if (!parseResult.success) {
    throw new Error("Format de réponse API invalide");
  }

  return parseResult.data;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la connexion" };
    }
    throw new Error(error.message || "Erreur lors de la connexion");
  }

  const data = await response.json();
  return data;
}

export async function loginWithCookies(
  email: string,
  password: string
): Promise<{ success: boolean }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { error: "Erreur lors de la connexion" };
    }
    throw new Error(error.error || "Erreur lors de la connexion");
  }

  return response.json();
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify?token=${token}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la vérification" };
    }
    throw new Error(error.message || "Token invalide ou expiré");
  }

  const data = await response.json();
  return data;
}

export type { UserResponse };
