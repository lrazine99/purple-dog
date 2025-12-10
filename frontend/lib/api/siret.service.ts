import { SiretData } from "../type/siret-data.type";
import { apiResponseSchema, siretDataSchema } from "../type/siret.type";

export async function searchBySiret(siret: string): Promise<SiretData | null> {
  const cleanSiret = siret.replace(/\s/g, "");

  if (cleanSiret.length !== 14 || !/^\d{14}$/.test(cleanSiret)) throw new Error("SIRET invalide");

  const response = await fetch(
    `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}`
  );

  if (!response.ok) throw new Error("Erreur lors de la recherche");

  const rawData = await response.json();

  const parseResult = apiResponseSchema.safeParse(rawData);

  if (!parseResult.success) throw new Error("Format de réponse API invalide");

  const data = parseResult.data;

  if (data.total_results === 0 || !data.results || data.results.length === 0) {
    throw new Error("Aucune entreprise trouvée pour ce SIRET");
  }

  const result = data.results[0];
  const siege = result.siege;

  const siretData = siretDataSchema.parse({
    company_name: result.nom_complet || "",
    address_line: siege.adresse || "",
    city: siege.libelle_commune || "",
    postal_code: siege.code_postal || "",
  });

  return siretData;
}
