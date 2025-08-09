/**
 * Paystack utility functions for the application
 */

/**
 * Generates a unique reference for Paystack transactions
 * @param prefix Optional prefix for the reference
 * @returns A unique reference string
 */
export function generatePaystackReference(prefix = 'SKL'): string {
  const timestamp = Date.now().toString();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Formats an amount in the smallest currency unit (kobo) to a readable currency format
 * @param amount Amount in kobo (smallest currency unit)
 * @param currencyCode Currency code (default: NGN)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode = 'NGN'): string {
  // Convert from kobo to main currency unit (naira)
  const mainUnitAmount = amount / 100;
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
  }).format(mainUnitAmount);
}

/**
 * Validates a Paystack transaction reference format
 * @param reference The reference to validate
 * @returns Boolean indicating if the reference is valid
 */
export function isValidPaystackReference(reference: string): boolean {
  // Basic validation - can be expanded based on your reference format
  return /^[A-Za-z0-9_-]{5,50}$/.test(reference);
}

/**
 * Calculates the Paystack fee for a given amount
 * @param amount Amount in naira
 * @returns The fee amount in naira
 */
export function calculatePaystackFee(amount: number): number {
  // Paystack charges 1.5% of the amount being paid, capped at 2,000 Naira
  const fee = amount * 0.015;
  return Math.min(fee, 2000);
}

/**
 * Converts a Paystack transaction status to an application payment status
 * @param paystackStatus The status from Paystack
 * @returns The corresponding application payment status
 */
export function mapPaystackStatusToAppStatus(paystackStatus: string): 'completed' | 'failed' | 'pending' {
  switch (paystackStatus.toLowerCase()) {
    case 'success':
      return 'completed';
    case 'failed':
    case 'abandoned':
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
}