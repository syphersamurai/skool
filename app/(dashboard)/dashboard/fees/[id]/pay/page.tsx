'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockFeeRecords: Record<string, FeeRecord> = {
        '2': {
          id: '2',
          studentId: '2',
          studentName: 'Mary Johnson',
          class: 'Basic 2',
          feeType: 'Tuition Fee',
          amount: 55000,
          amountPaid: 30000,
          balance: 25000,
          dueDate: '2023-09-15',
          status: 'partial',
          paymentDate: '2023-09-05',
          paymentMethod: 'Paystack',
          transactionId: 'TRX234567',
          term: 'First Term',
          academicYear: '2023/2024',
        },
        '3': {
          id: '3',
          studentId: '3',
          studentName: 'David Smith',
          class: 'Basic 3',
          feeType: 'Tuition Fee',
          amount: 60000,
          amountPaid: 0,
          balance: 60000,
          dueDate: '2023-09-15',
          status: 'unpaid',
          term: 'First Term',
          academicYear: '2023/2024',
        },
        '4': {
          id: '4',
          studentId: '4',
          studentName: 'Grace Okafor',
          class: 'Basic 4',
          feeType: 'Tuition Fee',
          amount: 65000,
          amountPaid: 0,
          balance: 65000,
          dueDate: '2023-09-15',
          status: 'overdue',
          term: 'First Term',
          academicYear: '2023/2024',
        },
        '6': {
          id: '6',
          studentId: '6',
          studentName: 'Chioma Eze',
          class: 'Basic 6',
          feeType: 'Tuition Fee',
          amount: 75000,
          amountPaid: 40000,
          balance: 35000,
          dueDate: '2023-09-15',
          status: 'partial',
          paymentDate: '2023-09-08',
          paymentMethod: 'Paystack',
          transactionId: 'TRX456789',
          term: 'First Term',
          academicYear: '2023/2024',
        },
        '8': {
          id: '8',
          studentId: '2',
          studentName: 'Mary Johnson',
          class: 'Basic 2',
          feeType: 'Development Levy',
          amount: 10000,
          amountPaid: 0,
          balance: 10000,
          dueDate: '2023-09-30',
          status: 'unpaid',
          term: 'First Term',
          academicYear: '2023/2024',
        },
      };

      const record = mockFeeRecords[params.id];
      if (record) {
        setFeeRecord(record);
        // Set default payment amount to the balance
        setPaymentAmount(record.balance.toString());
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
    if (!couponCode.trim()) {
      return;
    }

    // In a real implementation, this would validate the coupon against Firestore
    // For demo purposes, we'll simulate a coupon validation
    const validCoupons = {
      'NEWSTUDENT10': { type: 'percentage', value: 10 },
      'WELCOME20': { type: 'percentage', value: 20 },
      'DISCOUNT5000': { type: 'fixed', value: 5000 },
    };

    const coupon = validCoupons[couponCode as keyof typeof validCoupons];
    
    if (coupon && feeRecord) {
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (feeRecord.balance * coupon.value) / 100;
      } else {
        discount = Math.min(coupon.value, feeRecord.balance);
      }

      setDiscountAmount(discount);
      setDiscountApplied(true);
      setPaymentAmount((feeRecord.balance - discount).toString());
      alert(`Coupon applied! You received a discount of ₦${discount.toFixed(2)}.`);
    } else {
      alert('Invalid or expired coupon code.');
      setDiscountApplied(false);
      setDiscountAmount(0);
      setPaymentAmount(feeRecord?.balance.toString() || '0');
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
      // In a real implementation, this would update Firestore and possibly integrate with Paystack
      // For demo purposes, we'll simulate a successful payment

      // Simulate a delay for the demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate new values
      const newAmountPaid = feeRecord.amountPaid + paymentAmountNum;
      const newBalance = feeRecord.balance - paymentAmountNum;
      const newStatus = newBalance === 0 ? 'paid' : 'partial';

      // Success message and redirect
      alert(`Payment of ₦${paymentAmountNum.toFixed(2)} recorded successfully!`);
      router.push('/dashboard/fees');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
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
              <p className="font-medium">{formatCurrency(feeRecord.amount)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Amount Paid</span>
              <p className="font-medium">{formatCurrency(feeRecord.amountPaid)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Balance Due</span>
              <p className="font-medium text-red-600">{formatCurrency(feeRecord.balance)}</p>
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
                Discount of {formatCurrency(discountAmount)} applied!
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
                Maximum: {formatCurrency(feeRecord.balance)}
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
          <button
            type="button"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full md:w-auto"
            onClick={() => alert('In a real implementation, this would redirect to Paystack payment page.')}
          >
            Pay with Paystack
          </button>
        </div>
      </div>
    </div>
  );
}