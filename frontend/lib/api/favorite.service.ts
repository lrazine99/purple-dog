import { FavoritesResponse } from "../type/favorite.type";
import { favoritesResponseSchema } from "../type/favorite.type";

export async function getFavorites(): Promise<FavoritesResponse> {
  const response = await fetch("/api/favorites", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Non authentifié");
    }
    throw new Error("Erreur lors de la récupération des favoris");
  }

  const rawData = await response.json();
  const parseResult = favoritesResponseSchema.safeParse(rawData);

  if (!parseResult.success) {
    console.error("Erreur de validation:", parseResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return parseResult.data;
}

export async function addFavorite(itemId: number): Promise<void> {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ item_id: itemId }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Non authentifié");
    }
    if (response.status === 409) {
      throw new Error("Déjà dans les favoris");
    }
    throw new Error("Erreur lors de l'ajout aux favoris");
  }
}

export async function removeFavorite(itemId: number): Promise<void> {
  const response = await fetch(`/api/favorites/${itemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Non authentifié");
    }
    if (response.status === 404) {
      throw new Error("Favori non trouvé");
    }
    throw new Error("Erreur lors de la suppression du favori");
  }
}

export async function checkFavorite(itemId: number): Promise<boolean> {
  const response = await fetch(`/api/favorites/check/${itemId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.isFavorite;
}
