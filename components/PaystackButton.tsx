'use client';

import { useEffect, useState } from 'react';
import { PaystackProps } from '@paystack/inline-js';

interface PaystackButtonProps {
  amount: number; // amount in kobo (smallest currency unit)
  email: string;
  metadata?: Record<string, any>;
  reference?: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function PaystackButton({
  amount,
  email,
  metadata = {},
  reference,
  onSuccess,
  onCancel,
  className = '',
  disabled = false,
  children = 'Pay with Paystack'
}: PaystackButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initializePayment = async () => {
    if (disabled) return;

    try {
      // Dynamically import Paystack to avoid SSR issues
      const { default: PaystackPop } = await import('@paystack/inline-js');

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        amount: amount * 100, // convert to kobo
        email,
        metadata,
        reference: reference || '',
        onSuccess: (transaction) => {
          onSuccess(transaction.reference);
        },
        onCancel: () => {
          onCancel();
        }
      });
    } catch (error) {
      console.error('Paystack initialization error:', error);
    }
  };

  // Don't render the button on the server
  if (!isClient) return null;

  return (
    <button
      type="button"
      onClick={initializePayment}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}