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
  PUBLISHED = "published", // Added to match backend
  SOLD = "sold",
  PENDING = "pending",
  PENDING_EXPERTISE = "pending_expertise", // Added to match backend
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
  category_id: z.number().nullable(),
  name: z.string(),
  description: z.string(),
  width_cm: z.coerce.number(),
  height_cm: z.coerce.number(),
  depth_cm: z.coerce.number(),
  weight_kg: z.coerce.number(),
  price_desired: z.coerce.number(),
  price_min: z.coerce.number(),
  sale_mode: z.enum([
    SaleMode.AUCTION, 
    SaleMode.FAST,
    SaleMode.FIXED,
    SaleMode.NEGOTIABLE
  ]),
  status: z.enum([
    ItemStatus.DRAFT,
    ItemStatus.FOR_SALE,
    ItemStatus.PUBLISHED,
    ItemStatus.SOLD,
    ItemStatus.PENDING,
    ItemStatus.PENDING_EXPERTISE,
    ItemStatus.APPROVED,
    ItemStatus.CANCELLED,
    ItemStatus.EXPIRED,
    ItemStatus.BLOCKED,
    ItemStatus.DELETED,
  ]),
  auction_start_price: z.coerce.number().nullish(),
  auction_end_date: z.string().nullish(),
  photos: z.array(itemPhotoSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemsResponseSchema = z.array(itemSchema);

export type ItemsResponse = Item[];
