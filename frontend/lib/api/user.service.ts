export interface User {
  id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  address_line?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  website_company?: string;
  items_preference?: string;
  speciality?: string;
  profile_picture?: string;
  age?: number;
  social_links?: string;
  newsletter: boolean;
  rgpd_accepted: boolean;
  company_name?: string;
  siret?: string;
  official_document_url?: string;
  cgv_accepted: boolean;
  is_verified: boolean;
  subscription_tier?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  address_line?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  website_company?: string;
  items_preference?: string;
  speciality?: string;
  profile_picture?: string;
  age?: number;
  social_links?: string;
  newsletter?: boolean;
  company_name?: string;
  siret?: string;
}

export async function getUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la récupération de l'utilisateur");
  }

  return response.json();
}

export async function updateUser(
  userId: number,
  data: UpdateUserDto,
  officialDocument?: File
): Promise<User> {
  const formData = new FormData();

  // Add all fields to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add file if provided
  if (officialDocument) {
    formData.append("official_document", officialDocument);
  }

  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la mise à jour de l'utilisateur");
  }

  return response.json();
}

