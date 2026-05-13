/**
 * UPI utilities — link generation and UTR validation.
 * Designed to be payment-gateway agnostic so Razorpay/PhonePe can be
 * added later by extending the PaymentMethod union type.
 */

export interface UpiLinkParams {
  upiId: string;
  storeName: string;
  amount: number;
  orderId?: string;
  currency?: string;
}

/** Generates a deep-link that opens any UPI app on Android/iOS */
export function generateUpiLink({
  upiId,
  storeName,
  amount,
  orderId,
  currency = 'INR',
}: UpiLinkParams): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: storeName,
    am: amount.toFixed(2),
    cu: currency,
    ...(orderId ? { tn: `Order ${orderId}` } : {}),
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * UTR (Unique Transaction Reference) validation.
 * NPCI format: 12-digit numeric string.
 * Some banks use alphanumeric up to 22 chars — we accept both.
 */
export function validateUtr(utr: string): boolean {
  return /^[A-Z0-9]{12,22}$/i.test(utr.trim());
}
