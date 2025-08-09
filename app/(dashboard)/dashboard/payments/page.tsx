'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import PaymentReceipt from '@/components/PaymentReceipt';
import { formatCurrency } from '@/lib/paystack';

interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: any;
  transactionId?: string;
  discountApplied?: boolean;
  discountAmount?: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: any;
}

interface Fee {
  id: string;
  feeType: string;
  class: string;
  term: string;
  academicYear: string;
  amount: number;
  amountPaid: number;
  balance: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Filter states
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  
  // School info (in a real app, this would come from the database)
  const schoolInfo = {
    name: 'Skool Management System',
    address: '123 Education Street, Lagos, Nigeria',
    phone: '+234 123 456 7890',
    email: 'info@skool.edu.ng'
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const paymentsData: Payment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Payment, 'id'>;
        paymentsData.push({
          id: doc.id,
          ...data,
          paymentDate: data.paymentDate ? new Date(data.paymentDate.seconds * 1000) : new Date(),
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
        });
      });
      
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    setSelectedPayment(payment);
    
    try {
      // Fetch the associated fee record
      if (payment.feeId) {
        const feeDoc = await getDoc(doc(db, 'fees', payment.feeId));
        if (feeDoc.exists()) {
          setSelectedFee({
            id: feeDoc.id,
            ...feeDoc.data() as Omit<Fee, 'id'>
          });
        }
      }
      
      setShowReceipt(true);
    } catch (err) {
      console.error('Error fetching fee details:', err);
      // Still show receipt even if fee details can't be fetched
      setShowReceipt(true);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setSelectedPayment(null);
    setSelectedFee(null);
  };

  const applyFilters = () => {
    // In a real app, this would query Firestore with the filters
    // For demo purposes, we'll filter the existing payments array
    fetchPayments().then(() => {
      let filtered = [...payments];
      
      if (filterStudent) {
        filtered = filtered.filter(p => 
          p.studentName.toLowerCase().includes(filterStudent.toLowerCase()) ||
          p.studentId.includes(filterStudent)
        );
      }
      
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        filtered = filtered.filter(p => new Date(p.paymentDate) >= fromDate);
      }
      
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(p => new Date(p.paymentDate) <= toDate);
      }
      
      if (filterMethod) {
        filtered = filtered.filter(p => p.paymentMethod === filterMethod);
      }
      
      setPayments(filtered);
    });
  };

  const resetFilters = () => {
    setFilterStudent('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMethod('');
    fetchPayments();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <Link 
          href="/dashboard/fees"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Fees
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filter Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <input
                type="text"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                placeholder="Name or ID"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Paystack">Paystack</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 text-center">
            <p className="text-gray-500">No payment records found.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.id.substring(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                      <div className="text-sm text-gray-500">ID: {payment.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.paymentDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount * 100, 'NGN')}
                      </div>
                      {payment.discountApplied && payment.discountAmount && payment.discountAmount > 0 && (
                        <div className="text-xs text-green-600">
                          Discount: {formatCurrency(payment.discountAmount * 100, 'NGN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500" title={payment.transactionId}>
                          Ref: {payment.transactionId.substring(0, 10)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Receipt</h3>
              <button
                onClick={closeReceipt}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <PaymentReceipt 
                payment={selectedPayment} 
                fee={selectedFee || undefined} 
                school={schoolInfo} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}