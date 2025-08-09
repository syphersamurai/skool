'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { feesService, paymentsService } from '@/lib/db';
import { Fee, Payment } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function FeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [fee, setFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeeDetails();
  }, [params.id]);

  async function fetchFeeDetails() {
    setLoading(true);
    try {
      const feeData = await feesService.getById(params.id);
      if (feeData) {
        setFee(feeData);
        const q = query(collection(paymentsService.collectionName), where('feeId', '==', feeData.id));
        const querySnapshot = await getDocs(q);
        const paymentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
        setPayments(paymentsData);
      } else {
        setError('Fee record not found');
      }
    } catch (err) {
      console.error('Error fetching fee details:', err);
      setError('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Fee record not found'}</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fee Details: {fee.feeType}</h2>
        <div className="flex space-x-4">
          {fee.status !== 'paid' && (
            <button
              onClick={() => router.push(`/dashboard/fees/${fee.id}/pay`)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Record Payment
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/fees')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Fee Information */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Fee Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Fee Type</span>
                  <p className="font-medium">{fee.feeType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Amount</span>
                  <p>{formatCurrency(fee.amount)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Amount Paid</span>
                  <p className="text-green-600 font-medium">{formatCurrency(fee.amountPaid)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Balance</span>
                  <p className="text-red-600 font-medium">{formatCurrency(fee.balance)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Due Date</span>
                  <p>{new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Student Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Student Name</span>
                  <p className="font-medium">{fee.studentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Class</span>
                  <p>{fee.class}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Academic Year</span>
                  <p>{fee.academicYear}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Term</span>
                  <p>{fee.term}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No payments recorded for this fee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.transactionId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
