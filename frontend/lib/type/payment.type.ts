import { z } from "zod";

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
  REQUIRES_ACTION = "requires_action",
}

export const paymentSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  user_id: z.number(),
  stripe_payment_intent_id: z.string().nullable(),
  stripe_checkout_session_id: z.string().nullable(),
  stripe_customer_id: z.string().nullable(),
  amount: z.string(),
  currency: z.string(),
  status: z.nativeEnum(PaymentStatus),
  is_used: z.boolean().optional().default(false),
  checkout_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const paymentsResponseSchema = z.array(paymentSchema);

export type PaymentsResponse = Payment[];

// Schema pour les Payment Intents de Stripe (pour l'historique via API route)
export const stripePaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  payment_method: z
    .object({
      type: z.string(),
      card: z
        .object({
          display_brand: z.string().optional(),
          last4: z.string().optional(),
        })
        .optional(),
    })
    .nullable(),
  created: z.number(),
  metadata: z.record(z.string()).optional(),
});

export type StripePaymentIntent = z.infer<typeof stripePaymentIntentSchema>;

export const stripePaymentIntentsResponseSchema = z.object({
  data: z.array(stripePaymentIntentSchema),
  has_more: z.boolean().optional(),
});

export type StripePaymentIntentsResponse = z.infer<
  typeof stripePaymentIntentsResponseSchema
>;

