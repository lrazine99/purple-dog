/**
 * Utility functions for payment processing
 */

/**
 * Format amount for display
 * @param amount - Amount in cents or as decimal string
 * @param currency - Currency code (e.g., 'EUR', 'USD')
 * @returns Formatted string (e.g., "299,99 €")
 */
export function formatAmountForDisplay(
  amount: number | string,
  currency: string = "EUR"
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  const amountInEuros = numericAmount / 100; // Stripe amounts are in cents

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInEuros);
}

/**
 * Get payment status display information
 * @param status - Payment status
 * @returns Object with color and label
 */
export function getPaymentStatusDisplay(status: string) {
  switch (status) {
    case "succeeded":
    case "paid":
      return { color: "success" as const, label: "Payé" };
    case "pending":
    case "requires_payment_method":
      return { color: "info" as const, label: "En attente" };
    case "failed":
      return { color: "destructive" as const, label: "Échoué" };
    case "canceled":
      return { color: "secondary" as const, label: "Annulé" };
    case "requires_action":
      return { color: "warning" as const, label: "Action requise" };
    default:
      return { color: "secondary" as const, label: status };
  }
}

/**
 * Get payment method display name
 * @param paymentMethod - Payment method object
 * @returns Formatted payment method string
 */
export function getPaymentMethodDisplay(paymentMethod: {
  type?: string;
  card?: { display_brand?: string; last4?: string };
}): string {
  if (!paymentMethod) return "Non spécifié";

  const type = paymentMethod.type?.toUpperCase() || "";
  const cardBrand = paymentMethod.card?.display_brand?.toUpperCase() || "";
  const last4 = paymentMethod.card?.last4 || "";

  if (type === "CARD") {
    return cardBrand ? `${cardBrand} •••• ${last4}` : `Carte •••• ${last4}`;
  }

  return type;
}

