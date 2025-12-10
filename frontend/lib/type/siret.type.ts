import { z } from "zod";

export const siretDataSchema = z.object({
  company_name: z.string(),
  address_line: z.string(),
  city: z.string(),
  postal_code: z.string(),
});

export const apiSiegeSchema = z.object({
  siret: z.string(),
  code_postal: z.string(),
  libelle_commune: z.string(),
  adresse: z.string(),
});

export const apiResultSchema = z.object({
  nom_complet: z.string(),
  siege: apiSiegeSchema,
});

export const apiResponseSchema = z.object({
  results: z.array(apiResultSchema),
  total_results: z.number(),
});
