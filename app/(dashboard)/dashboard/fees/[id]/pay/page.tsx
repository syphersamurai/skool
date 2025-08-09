'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import PaystackButton from '@/components/PaystackButton';
import { generatePaystackReference, formatCurrency } from '@/lib/paystack';

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  feeType: string;
  amount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  term: string;
  academicYear: string;
}

export default function PayFeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [feeRecord, setFeeRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchFeeRecord();
  }, [params.id]);

  async function fetchFeeRecord() {
    setLoading(true);
    try {
      const feeData = await feesService.getById(params.id);
      if (feeData) {
        setFeeRecord(feeData);
        setPaymentAmount(feeData.balance.toString());
      } else {
        setError('Fee record not found');
      }
    } catch (error) {
      console.error('Error fetching fee record:', error);
      setError('Failed to load fee record');
    } finally {
      setLoading(false);
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || discountApplied) return;
    
    try {
      // Import the validateCoupon function dynamically to avoid SSR issues
      const { validateCoupon } = await import('@/lib/coupon');
      
      // Validate the coupon
      const result = await validateCoupon(couponCode, feeRecord.balance);
      
      if (result.valid && result.discountAmount !== undefined) {
        setDiscountAmount(result.discountAmount);
        setDiscountApplied(true);
        setPaymentAmount((feeRecord.balance - result.discountAmount).toString());
        alert(`Coupon applied! You received a discount of ₦${result.discountAmount.toFixed(2)}.`);
      } else {
        alert(result.message || 'Invalid or expired coupon code.');
        setDiscountApplied(false);
        setDiscountAmount(0);
        setPaymentAmount(feeRecord?.balance.toString() || '0');
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      alert('Failed to apply coupon. Please try again.');
      setDiscountApplied(false);
      setDiscountAmount(0);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeRecord) return;

    const paymentAmountNum = parseFloat(paymentAmount);
    if (isNaN(paymentAmountNum) || paymentAmountNum <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmountNum > feeRecord.balance) {
      setError('Payment amount cannot exceed the balance');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Calculate new values
      const newAmountPaid = feeRecord.amountPaid + paymentAmountNum;
      const newBalance = feeRecord.balance - paymentAmountNum;
      let newStatus: 'paid' | 'partial' | 'unpaid' | 'overdue' = 'partial';

      if (newBalance <= 0) {
        newStatus = 'paid';
      } else if (newAmountPaid === 0) {
        newStatus = 'unpaid';
      }

      // Update the fee record
      await feesService.update(feeRecord.id, {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
      });

      // Create a payment record
      await paymentsService.create({
        feeId: feeRecord.id,
        studentId: feeRecord.studentId,
        studentName: feeRecord.studentName,
        amount: paymentAmountNum,
        paymentMethod: paymentMethod as 'cash' | 'bank_transfer' | 'cheque' | 'paystack',
        paymentDate: new Date(),
        transactionId: transactionId,
        status: 'completed',
        discountApplied: discountApplied,
        discountAmount: discountAmount,
        metadata: { couponCode: couponCode },
      });

      // If a coupon was applied, record its usage
      if (discountApplied && discountAmount > 0) {
        try {
          // Import the recordCouponUsage function dynamically
          const { recordCouponUsage } = await import('@/lib/coupon');
          
          // Record the coupon usage
          await recordCouponUsage(
            couponCode, 
            feeRecord.studentId,  
            feeRecord.id,
            discountAmount
          );
        } catch (couponErr) {
          console.error('Error recording coupon usage:', couponErr);
          // We don't want to fail the payment if coupon recording fails
        }
      }

      alert(`Payment of ${formatCurrencyDisplay(paymentAmountNum)} recorded successfully!`);
      router.push('/dashboard/fees');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Format currency - using our utility function
  const formatCurrencyDisplay = (amount: number) => {
    // Our utility function expects kobo, but our app uses naira directly
    // So we multiply by 100 to convert to kobo before passing to the utility
    return formatCurrency(amount * 100, 'NGN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !feeRecord) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => router.push('/dashboard/fees')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Fees
        </button>
      </div>
    );
  }

  if (!feeRecord) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">Fee record not found</p>
        <button
          onClick={() => router.push('/dashboard/fees')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Fees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Record Payment</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Fee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Student</span>
              <p className="font-medium">{feeRecord.studentName}</p>
              <p className="text-sm text-gray-500">{feeRecord.class}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Fee Type</span>
              <p className="font-medium">{feeRecord.feeType}</p>
              <p className="text-sm text-gray-500">{feeRecord.term}, {feeRecord.academicYear}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Amount</span>
              <p className="font-medium">{formatCurrencyDisplay(feeRecord.amount)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Amount Paid</span>
              <p className="font-medium">{formatCurrencyDisplay(feeRecord.amountPaid)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Balance Due</span>
              <p className="font-medium text-red-600">{formatCurrencyDisplay(feeRecord.balance)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Due Date</span>
              <p className="font-medium">{new Date(feeRecord.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handlePaymentSubmit} className="p-6">
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          
          {/* Coupon Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply Coupon (Optional)</label>
            <div className="flex">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 border rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={discountApplied || processing}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 disabled:bg-gray-400"
                disabled={discountApplied || processing || !couponCode.trim()}
              >
                Apply
              </button>
            </div>
            {discountApplied && (
              <div className="mt-2 text-sm text-green-600">
                Discount of {formatCurrencyDisplay(discountAmount)} applied!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₦</span>
                </div>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  max={feeRecord.balance.toString()}
                  step="0.01"
                  required
                  className="w-full pl-8 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum: {formatCurrencyDisplay(feeRecord.balance)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Paystack">Paystack</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction reference"
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {processing ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* Paystack Integration Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Pay Online with Paystack</h3>
          <p className="text-gray-600 mb-4">
            Click the button below to make an online payment using Paystack. You will be redirected to a secure payment page.
          </p>
          
          {/* Import PaystackButton component */}
          {feeRecord && (
            <PaystackButton
              amount={parseFloat(paymentAmount) || feeRecord.balance}
              email="student@example.com" // In a real app, this would be the student's or parent's email
              reference={generatePaystackReference(`FEE_${feeRecord.id.substring(0, 8)}`)}
              metadata={{
                student_id: feeRecord.studentId,
                student_name: feeRecord.studentName,
                fee_id: feeRecord.id,
                fee_type: feeRecord.feeType,
                class: feeRecord.class,
                term: feeRecord.term,
                academic_year: feeRecord.academicYear,
                discount_applied: discountApplied,
                discount_amount: discountAmount
              }}
              onSuccess={(reference) => {
                // Handle successful payment
                setTransactionId(reference);
                setPaymentMethod('paystack');
                
                // Verify the transaction
                fetch(`/api/paystack/verify/${reference}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.status) {
                      // If verification is successful, submit the form
                      handlePaymentSubmit(new Event('submit') as any);
                    } else {
                      setError('Payment verification failed. Please contact support.');
                    }
                  })
                  .catch(err => {
                    console.error('Error verifying payment:', err);
                    setError('Error verifying payment. Please contact support.');
                  });
              }}
              onCancel={() => {
                // Handle cancelled payment
                alert('Payment cancelled');
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full md:w-auto"
              disabled={processing || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > feeRecord.balance}
            >
              Pay with Paystack
            </PaystackButton>
          )}
        </div>
      </div>
    </div>
  );
}