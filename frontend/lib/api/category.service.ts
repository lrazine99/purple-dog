import { CategoriesResponse } from "../type/category.type";
import { categoriesResponseSchema } from "../validation/category.schema";

export async function getCategories(): Promise<CategoriesResponse> {
  const response = await fetch("/api/categories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { message: "Erreur lors de la récupération des catégories" };
    }
    throw new Error(
      error.message || "Erreur lors de la récupération des catégories"
    );
  }

  const rawData = await response.json();

  const parseResult = categoriesResponseSchema.safeParse(rawData);

  if (!parseResult.success) {
    console.error("Erreur de validation:", parseResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return parseResult.data;
}
