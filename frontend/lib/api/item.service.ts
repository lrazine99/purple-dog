import { ItemsResponse } from "../type/item.type";
import { itemsResponseSchema } from "../type/item.type";

interface GetItemsParams {
  categoryId?: number;
  limit?: number;
  offset?: number;
}

export async function getItems(
  params: GetItemsParams = {}
): Promise<ItemsResponse> {
  const { categoryId, limit = 50, offset = 0 } = params;

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (categoryId) {
    queryParams.append("categoryId", categoryId.toString());
  }

  // Use the API proxy route instead of direct backend call
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(
    `/api/items?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la récupération des produits" };
    }
    throw new Error(
      error.message || "Erreur lors de la récupération des produits"
    );
  }

  const rawData = await response.json();

  const parseResult = itemsResponseSchema.safeParse(rawData);

  if (!parseResult.success) {
    console.error("Erreur de validation:", parseResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return parseResult.data;
}
