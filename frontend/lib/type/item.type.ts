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
  FOR_SALE = "for_sale",
  SOLD = "sold",
  PENDING = "pending",
  APPROVED = "approved",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  BLOCKED = "blocked",
  DELETED = "deleted",
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
  sale_mode: z.string(), // Accept any string for sale_mode
  status: z.string(), // Accept any string for status
  auction_start_price: z.coerce.number().nullish(),
  auction_end_date: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemsResponseSchema = z.array(itemSchema);

export type ItemsResponse = Item[];
