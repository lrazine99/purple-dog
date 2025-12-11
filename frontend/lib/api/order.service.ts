import { z } from "zod";

const orderResponseSchema = z.object({
  id: z.number(),
  buyer_id: z.number(),
  seller_id: z.number(),
  total_amount: z.string(),
  currency: z.string(),
  status: z.string(),
  billing_address_line: z.string().nullable(),
  billing_city: z.string().nullable(),
  billing_postal_code: z.string().nullable(),
  billing_country: z.string().nullable(),
  shipping_address_line: z.string().nullable(),
  shipping_city: z.string().nullable(),
  shipping_postal_code: z.string().nullable(),
  shipping_country: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

export interface CreateOrderInput {
  buyer_id: number;
  seller_id: number;
  items: Array<{ item_id: number; qty: number }>;
  billing_address_line?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_country?: string;
  shipping_address_line?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
}

/**
 * Order Service
 * Handles order creation and management
 */
export class OrderService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!this.baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderInput): Promise<OrderResponse> {
    // Use the API proxy route instead of direct backend call
    // This allows the server to read cookies securely
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la création de la commande",
      }));
      throw new Error(error.message || "Erreur lors de la création de la commande");
    }

    const rawData = await response.json();
    const parseResult = orderResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Erreur de validation:", parseResult.error);
      throw new Error("Format de réponse API invalide");
    }

    return parseResult.data;
  }

  // Removed getAuthToken - now using API proxy routes that handle auth server-side
}

// Export singleton instance
export const orderService = new OrderService();

