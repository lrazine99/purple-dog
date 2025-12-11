export interface Bid {
  id: number;
  item_id: number;
  user_id: number;
  amount: number;
  max_amount: number | null;
  type: "manual" | "auto";
  is_active: boolean;
  is_winning: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBidDto {
  amount: number;
  max_amount?: number;
}

export async function getItemBids(itemId: number): Promise<Bid[]> {
  const response = await fetch(`/api/bids/items/${itemId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la récupération des enchères" };
    }
    throw new Error(
      error.message || "Erreur lors de la récupération des enchères"
    );
  }

  return response.json();
}

export async function getCurrentWinningBid(itemId: number): Promise<Bid | null> {
  const response = await fetch(`/api/bids/items/${itemId}/winning`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la récupération de l'enchère" };
    }
    throw new Error(error.message || "Erreur lors de la récupération de l'enchère");
  }

  return response.json();
}

export async function createBid(
  itemId: number,
  dto: CreateBidDto
): Promise<Bid> {
  // Ne pas inclure max_amount s'il est undefined
  const body: { amount: number; max_amount?: number } = {
    amount: dto.amount,
  };
  
  if (dto.max_amount !== undefined && dto.max_amount !== null) {
    body.max_amount = dto.max_amount;
  }

  const response = await fetch(`/api/bids/items/${itemId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || "Erreur lors de la création de l'enchère" };
      }
    } catch {
      error = { message: "Erreur lors de la création de l'enchère" };
    }
    console.error("Erreur création enchère:", error, "Status:", response.status);
    throw new Error(error.message || error.error || "Erreur lors de la création de l'enchère");
  }

  return response.json();
}

export async function getMyBids(): Promise<Bid[]> {
  const response = await fetch("/api/bids/my-bids", {
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
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la récupération de vos enchères" };
    }
    throw new Error(error.message || "Erreur lors de la récupération de vos enchères");
  }

  return response.json();
}

/**
 * Calcule le palier d'enchère selon le prix
 */
export function getBidIncrement(price: number): number {
  if (price < 100) return 10;
  if (price < 500) return 50;
  if (price < 1000) return 100;
  if (price < 5000) return 200;
  return 500; // Pour les objets de plus de 5000€
}

/**
 * Calcule le prochain montant d'enchère valide (strictement supérieur)
 */
export function getNextBidAmount(currentAmount: number): number {
  const increment = getBidIncrement(currentAmount);
  const nextAmount = Math.ceil(currentAmount / increment) * increment;
  // Si le montant calculé est égal au montant actuel, ajouter l'incrément
  return nextAmount <= currentAmount ? currentAmount + increment : nextAmount;
}

