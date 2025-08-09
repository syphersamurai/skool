# Paystack Integration for School Management System

## Overview

This document outlines the Paystack payment integration implemented in the School Management System. The integration allows for online fee payments using Paystack's payment gateway.

## Features

- Secure online payment processing
- Transaction verification
- Webhook support for payment notifications
- Payment receipt generation
- Coupon/discount application

## Implementation Details

### Components

1. **PaystackButton Component** (`/components/PaystackButton.tsx`)
   - Client-side component for initiating Paystack payments
   - Handles payment popup and callbacks

2. **Paystack Utilities** (`/lib/paystack.ts`)
   - Helper functions for Paystack integration
   - Reference generation, currency formatting, fee calculation

3. **API Routes**
   - `/api/paystack/webhook` - Handles Paystack webhooks
   - `/api/paystack/verify/[reference]` - Verifies transaction status

### Configuration

Paystack API keys are stored in the `.env` file:

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your_public_key_here"
PAYSTACK_SECRET_KEY="your_secret_key_here"
```

> **Important**: Replace the placeholder keys with your actual Paystack API keys before deploying to production.

## Payment Flow

1. User selects "Pay with Paystack" on the fee payment page
2. Paystack popup appears for payment details entry
3. Upon successful payment:
   - The transaction reference is captured
   - The payment is verified via the API
   - The fee record is updated in the database
   - A payment record is created
   - User receives confirmation

## Webhook Integration

The system includes a webhook endpoint that Paystack can call to notify about payment events. This ensures that payments are properly recorded even if users close their browsers after payment.

To configure webhooks in your Paystack dashboard:

1. Log in to your Paystack dashboard
2. Navigate to Settings > API Keys & Webhooks
3. Add your webhook URL: `https://your-domain.com/api/paystack/webhook`

## Security Considerations

- All server-side verification uses the secret key
- Webhook requests are verified using signature validation
- Payment amounts are validated server-side
- Sensitive payment data never touches your server

## Testing

To test the integration:

1. Use Paystack test cards available in the [Paystack documentation](https://paystack.com/docs/payments/test-payments)
2. Monitor webhook events in the Paystack dashboard
3. Verify that fee records and payment records are properly updated

## Troubleshooting

Common issues:

- **Payment popup not appearing**: Check that the public key is correctly set
- **Webhook not working**: Verify the webhook URL in Paystack dashboard
- **Verification failing**: Ensure the secret key is correctly set

## Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Paystack Inline JS](https://github.com/PaystackHQ/paystack-inline-js)