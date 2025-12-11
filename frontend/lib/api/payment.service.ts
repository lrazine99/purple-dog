import {
  Payment,
  PaymentsResponse,
  paymentSchema,
  paymentsResponseSchema,
} from "../type/payment.type";

/**
 * Payment Service
 * Handles all payment-related API calls
 * Follows Single Responsibility Principle
 */
export class PaymentService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!this.baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
  }

  /**
   * Get all payments for the authenticated user
   */
  async getPayments(): Promise<PaymentsResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la récupération des paiements",
      }));
      throw new Error(error.message || "Erreur lors de la récupération des paiements");
    }

    const rawData = await response.json();
    const parseResult = paymentsResponseSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Erreur de validation:", parseResult.error);
      throw new Error("Format de réponse API invalide");
    }

    return parseResult.data;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la récupération du paiement",
      }));
      throw new Error(error.message || "Erreur lors de la récupération du paiement");
    }

    return response.json();
  }

  /**
   * Create a payment for an order
   */
  async createPayment(data: {
    order_id: number;
    success_url?: string;
    cancel_url?: string;
  }): Promise<Payment & { checkout_url?: string }> {
    // Use the API proxy route instead of direct backend call
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la création du paiement",
      }));
      throw new Error(error.message || "Erreur lors de la création du paiement");
    }

    const rawData = await response.json();
    const parseResult = paymentSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Erreur de validation:", parseResult.error);
      throw new Error("Format de réponse API invalide");
    }

    return rawData; // Return with checkout_url if present
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: number): Promise<Payment | null> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${this.baseUrl}/payments/order/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la récupération du paiement",
      }));
      throw new Error(error.message || "Erreur lors de la récupération du paiement");
    }

    return response.json();
  }

  /**
   * Verify payment after Stripe checkout redirect
   */
  async verifyPayment(checkoutSessionId: string): Promise<{
    verified: boolean;
    payment: Payment;
  }> {
    // Use the API proxy route instead of direct backend call
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
      body: JSON.stringify({ checkout_session_id: checkoutSessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erreur lors de la vérification du paiement",
      }));
      throw new Error(error.message || "Erreur lors de la vérification du paiement");
    }

    return response.json();
  }

  /**
   * Get payment history from backend
   * Uses the backend API which stores payments in database
   */
  async getPaymentHistory(): Promise<PaymentsResponse> {
    return this.getPayments();
  }

  /**
   * Get authentication token from cookies
   * @private
   */
  private getAuthToken(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("access_token=")
    );
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

