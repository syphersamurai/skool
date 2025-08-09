# Skool Payment System Documentation

## Overview

The Skool Payment System is a comprehensive solution for managing school fee payments. It integrates with Paystack for online payments and provides features for tracking payment history, generating receipts, and applying discount coupons.

## Features

- **Online Payments**: Integration with Paystack for secure online payments
- **Multiple Payment Methods**: Support for Paystack, bank transfers, cash, and cheques
- **Payment History**: Detailed payment records with filtering capabilities
- **Receipts**: Printable payment receipts for all transactions
- **Discount Coupons**: Apply discount coupons to fee payments
- **Webhook Integration**: Automatic payment verification via Paystack webhooks

## Components

### Payment Processing

1. **PaystackButton Component** (`components/PaystackButton.tsx`)
   - Reusable component for initiating Paystack payments
   - Handles payment initialization, callbacks, and UI

2. **Payment Page** (`app/(dashboard)/dashboard/fees/[id]/pay/page.tsx`)
   - Fee payment interface with Paystack integration
   - Supports coupon application and multiple payment methods

3. **Payments History Page** (`app/(dashboard)/dashboard/payments/page.tsx`)
   - Lists all payment transactions
   - Provides filtering by student, date, and payment method
   - Allows viewing and printing of payment receipts

4. **Payment Receipt Component** (`components/PaymentReceipt.tsx`)
   - Generates printable receipts for payments
   - Includes payment details, fee information, and school details

### API Routes

1. **Paystack Webhook Handler** (`app/api/paystack/webhook/route.ts`)
   - Processes Paystack webhook events
   - Updates payment records based on successful transactions
   - Verifies webhook signatures for security

2. **Payment Verification API** (`app/api/paystack/verify/[reference]/route.ts`)
   - Verifies Paystack transactions using the reference
   - Returns transaction details for client-side validation

### Utilities

1. **Paystack Utilities** (`lib/paystack.ts`)
   - Helper functions for Paystack integration
   - Reference generation, currency formatting, fee calculation

2. **Coupon System** (`lib/coupon.ts`)
   - Coupon validation and application logic
   - Discount calculation and usage tracking

## Payment Flow

1. **Initiating Payment**:
   - User selects a fee to pay from the fees dashboard
   - User enters payment details and optionally applies a coupon
   - For Paystack payments, the PaystackButton component is used

2. **Processing Payment**:
   - For Paystack: Payment is processed through the Paystack popup
   - For other methods: Payment details are recorded directly

3. **Verification**:
   - Paystack payments are verified via the verification API
   - Webhook events update payment status automatically

4. **Receipt Generation**:
   - After successful payment, a receipt can be viewed and printed
   - Receipts are also available in the payment history

## Coupon System

1. **Creating Coupons** (`app/(dashboard)/dashboard/coupons/page.tsx`)
   - Admin interface for creating and managing discount coupons
   - Set coupon code, discount amount/percentage, validity period

2. **Applying Coupons**:
   - Users can enter coupon codes during payment
   - System validates the coupon and applies the discount
   - Coupon usage is tracked to prevent misuse

## Database Schema

### Payments Collection

```
payments/
  - id: string (auto-generated)
  - feeId: string (reference to fees collection)
  - studentId: string (reference to students collection)
  - studentName: string
  - amount: number
  - paymentMethod: string ('Paystack', 'Bank Transfer', 'Cash', 'Cheque')
  - paymentDate: timestamp
  - transactionId: string (optional)
  - discountApplied: boolean
  - discountAmount: number (optional)
  - status: string ('completed', 'pending', 'failed')
  - createdAt: timestamp
```

### Coupons Collection

```
coupons/
  - id: string (auto-generated)
  - code: string
  - discountType: string ('percentage', 'fixed')
  - discountValue: number
  - validFrom: timestamp
  - validTo: timestamp
  - maxUses: number
  - currentUses: number
  - createdAt: timestamp
```

### Coupon Usage Collection

```
couponUsage/
  - id: string (auto-generated)
  - couponId: string (reference to coupons collection)
  - studentId: string (reference to students collection)
  - feeId: string (reference to fees collection)
  - paymentId: string (reference to payments collection)
  - discountAmount: number
  - usedAt: timestamp
```

## Configuration

### Environment Variables

```
# Paystack API Keys
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Testing

### Seeding Test Data

Use the provided script to seed test payment data:

```
node scripts/seed-payments.js
```

### Paystack Test Cards

For testing Paystack payments, use the following test cards:

- **Successful Payment**: 4084 0840 8408 4081
- **Failed Payment**: 4084 0840 8408 4073
- **CVV**: Any 3 digits
- **Expiry Date**: Any future date
- **PIN**: 1234
- **OTP**: 123456

## Security Considerations

1. **API Key Protection**:
   - Paystack secret key is only used server-side
   - Public key is used for client-side initialization

2. **Webhook Verification**:
   - All webhook requests are verified using Paystack signatures
   - Prevents unauthorized payment confirmations

3. **Transaction Verification**:
   - All successful Paystack payments are verified server-side
   - Prevents client-side manipulation of payment status

## Troubleshooting

### Common Issues

1. **Payment Popup Not Showing**:
   - Check if Paystack public key is correctly set
   - Ensure the amount is properly formatted (in kobo)

2. **Webhook Not Working**:
   - Verify webhook URL is correctly set in Paystack dashboard
   - Check server logs for webhook verification errors

3. **Payment Verification Failed**:
   - Ensure the reference is correctly passed to the verification API
   - Check network logs for API response errors

## Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Paystack Inline JS](https://github.com/PaystackHQ/inline-js)