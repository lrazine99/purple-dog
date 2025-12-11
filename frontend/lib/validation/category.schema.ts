import { z } from "zod";

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parent_id: z.number().nullish(),
});

export const categoriesResponseSchema = z.array(categorySchema);
