import { z } from "zod";

export enum SaleMode {
  AUCTION = "auction",
  FAST = "fast",
  FIXED = "fixed",
  NEGOTIABLE = "negotiable",
}

export enum ItemStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SOLD = "sold",
  PENDING_EXPERTISE = "pending_expertise",
}

export const itemSchema = z.object({
  id: z.number(),
  seller_id: z.number(),
  category_id: z.number().nullish(),
  name: z.string(),
  description: z.string(),
  width_cm: z.coerce.number().nullish(),
  height_cm: z.coerce.number().nullish(),
  depth_cm: z.coerce.number().nullish(),
  weight_kg: z.coerce.number().nullish(),
  price_desired: z.coerce.number(),
  price_min: z.coerce.number().nullish(),
  sale_mode: z.enum([
    SaleMode.AUCTION,
    SaleMode.FAST,
    SaleMode.FIXED,
    SaleMode.NEGOTIABLE,
  ]),
  status: z.enum([
    ItemStatus.DRAFT,
    ItemStatus.PUBLISHED,
    ItemStatus.SOLD,
    ItemStatus.PENDING_EXPERTISE,
  ]),
  auction_start_price: z.coerce.number().nullish(),
  auction_end_date: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemsResponseSchema = z.array(itemSchema);

export type ItemsResponse = Item[];
