import { z } from "zod";
import { itemSchema } from "./item.type";

export const favoriteSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  item_id: z.number(),
  item: itemSchema,
  created_at: z.string(),
});

export type Favorite = z.infer<typeof favoriteSchema>;

export const favoritesResponseSchema = z.array(favoriteSchema);

export type FavoritesResponse = Favorite[];
