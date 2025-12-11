import { z } from "zod";

export enum SaleMode {
  AUCTION = "auction",
  FAST = "fast",
  FIXED = "fixed",
  NEGOTIABLE = "negotiable",
}

export enum ItemStatus {
  DRAFT = "draft",
  FOR_SALE = "for_sale",
  SOLD = "sold",
  PENDING = "pending",
  PENDING_EXPERTISE = "pending_expertise",
  APPROVED = "approved",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  BLOCKED = "blocked",
  DELETED = "deleted",
}

export const itemPhotoSchema = z.object({
  id: z.number(),
  url: z.string(),
  position: z.number().optional(),
  is_primary: z.boolean().optional(),
});

export type ItemPhoto = z.infer<typeof itemPhotoSchema>;

export const itemSchema = z.object({
  id: z.number(),
  seller_id: z.number(),
  // Utilisation de nullish() (feature) pour accepter null ou undefined
  category_id: z.number().nullish(),
  name: z.string(),
  description: z.string(),
  width_cm: z.coerce.number().nullish(),
  height_cm: z.coerce.number().nullish(),
  depth_cm: z.coerce.number().nullish(),
  weight_kg: z.coerce.number().nullish(),
  price_desired: z.coerce.number(),
  price_min: z.coerce.number().nullish(),
  sale_mode: z.nativeEnum(SaleMode),
  status: z.nativeEnum(ItemStatus),
  auction_start_price: z.coerce.number().nullish(),
  auction_end_date: z.string().nullish(),
  photos: z.array(itemPhotoSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemsResponseSchema = z.array(itemSchema);

export type ItemsResponse = Item[];