import { z } from "zod";

export enum SaleMode {
  AUCTION = "auction",
  FAST = "fast",
}

export enum ItemStatus {
  DRAFT = "draft",
  FOR_SALE = "for_sale",
  SOLD = "sold",
  PENDING = "pending",
  APPROVED = "approved",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  BLOCKED = "blocked",
  DELETED = "deleted",
}

export const itemSchema = z.object({
  id: z.number(),
  seller_id: z.number(),
  category_id: z.number(),
  name: z.string(),
  description: z.string(),
  width_cm: z.coerce.number(),
  height_cm: z.coerce.number(),
  depth_cm: z.coerce.number(),
  weight_kg: z.coerce.number(),
  price_desired: z.coerce.number(),
  price_min: z.coerce.number(),
  sale_mode: z.nativeEnum(SaleMode),
  status: z.nativeEnum(ItemStatus),
  auction_start_price: z.coerce.number().nullish(),
  auction_end_date: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemsResponseSchema = z.array(itemSchema);

export type ItemsResponse = Item[];
