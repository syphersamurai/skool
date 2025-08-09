'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
}

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string;
  class?: string;
}

export default function RecordPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(true);
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    feeTypeId: '',
    amount: '',
    amountPaid: '',
    paymentMethod: 'Cash',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    term: 'First Term',
    academicYear: '2023/2024',
    notes: '',
    couponCode: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchFeeTypes();
  }, []);

  async function fetchStudents() {
    setLoadingStudents(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'John Doe',
          class: 'Basic 1',
          admissionNumber: 'STU001',
        },
        {
          id: '2',
          name: 'Mary Johnson',
          class: 'Basic 2',
          admissionNumber: 'STU002',
        },
        {
          id: '3',
          name: 'David Smith',
          class: 'Basic 3',
          admissionNumber: 'STU003',
        },
        {
          id: '4',
          name: 'Grace Okafor',
          class: 'Basic 4',
          admissionNumber: 'STU004',
        },
        {
          id: '5',
          name: 'Ibrahim Musa',
          class: 'Basic 5',
          admissionNumber: 'STU005',
        },
        {
          id: '6',
          name: 'Chioma Eze',
          class: 'Basic 6',
          admissionNumber: 'STU006',
        },
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }

  async function fetchFeeTypes() {
    setLoadingFeeTypes(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockFeeTypes: FeeType[] = [
        {
          id: '1',
          name: 'Tuition Fee (Basic 1)',
          amount: 50000,
          description: 'First term tuition fee for Basic 1',
          class: 'Basic 1',
        },
        {
          id: '2',
          name: 'Tuition Fee (Basic 2)',
          amount: 55000,
          description: 'First term tuition fee for Basic 2',
          class: 'Basic 2',
        },
        {
          id: '3',
          name: 'Tuition Fee (Basic 3)',
          amount: 60000,
          description: 'First term tuition fee for Basic 3',
          class: 'Basic 3',
        },
        {
          id: '4',
          name: 'Tuition Fee (Basic 4)',
          amount: 65000,
          description: 'First term tuition fee for Basic 4',
          class: 'Basic 4',
        },
        {
          id: '5',
          name: 'Tuition Fee (Basic 5)',
          amount: 70000,
          description: 'First term tuition fee for Basic 5',
          class: 'Basic 5',
        },
        {
          id: '6',
          name: 'Tuition Fee (Basic 6)',
          amount: 75000,
          description: 'First term tuition fee for Basic 6',
          class: 'Basic 6',
        },
        {
          id: '7',
          name: 'Development Levy',
          amount: 10000,
          description: 'Annual development levy',
        },
        {
          id: '8',
          name: 'PTA Fee',
          amount: 5000,
          description: 'Parent-Teacher Association fee',
        },
        {
          id: '9',
          name: 'Uniform Fee',
          amount: 15000,
          description: 'School uniform fee',
        },
        {
          id: '10',
          name: 'Textbook Fee',
          amount: 20000,
          description: 'Textbooks and learning materials',
        },
      ];

      setFeeTypes(mockFeeTypes);
    } catch (error) {
      console.error('Error fetching fee types:', error);
      setError('Failed to load fee types');
    } finally {
      setLoadingFeeTypes(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'feeTypeId' && value) {
      const selectedFee = feeTypes.find(fee => fee.id === value);
      setSelectedFeeType(selectedFee || null);
      
      // Update amount field with the fee amount
      if (selectedFee) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          amount: selectedFee.amount.toString()
        }));
        return;
      }
    }
    
    if (name === 'studentId' && value && formData.feeTypeId) {
      // If both student and fee type are selected, check if the fee type is class-specific
      const selectedFee = feeTypes.find(fee => fee.id === formData.feeTypeId);
      const selectedStudent = students.find(student => student.id === value);
      
      if (selectedFee && selectedFee.class && selectedStudent && selectedFee.class !== selectedStudent.class) {
        // If the fee is for a specific class and doesn't match the student's class, show a warning
        setError(`Warning: This fee is designed for ${selectedFee.class} students, but the selected student is in ${selectedStudent.class}`);
      } else {
        setError('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.studentId || !formData.feeTypeId || !formData.amountPaid) {
        throw new Error('Please fill in all required fields');
      }

      const amountPaid = parseFloat(formData.amountPaid);
      const totalAmount = parseFloat(formData.amount);

      if (isNaN(amountPaid) || amountPaid <= 0) {
        throw new Error('Please enter a valid payment amount');
      }

      if (amountPaid > totalAmount) {
        throw new Error('Payment amount cannot exceed the total fee amount');
      }

      // Calculate balance
      const balance = totalAmount - amountPaid;

      // Determine payment status
      let status: 'paid' | 'partial' | 'unpaid';
      if (balance === 0) {
        status = 'paid';
      } else if (balance === totalAmount) {
        status = 'unpaid';
      } else {
        status = 'partial';
      }

      // In a real implementation, this would add to Firestore
      // For demo purposes, we'll simulate a successful addition
      
      // const docRef = await addDoc(collection(db, 'feeRecords'), {
      //   studentId: formData.studentId,
      //   studentName: students.find(s => s.id === formData.studentId)?.name,
      //   class: students.find(s => s.id === formData.studentId)?.class,
      //   feeType: feeTypes.find(f => f.id === formData.feeTypeId)?.name,
      //   amount: totalAmount,
      //   amountPaid: amountPaid,
      //   balance: balance,
      //   status: status,
      //   paymentDate: formData.paymentDate,
      //   paymentMethod: formData.paymentMethod,
      //   transactionId: formData.transactionId,
      //   term: formData.term,
      //   academicYear: formData.academicYear,
      //   notes: formData.notes,
      //   couponCode: formData.couponCode,
      //   createdAt: serverTimestamp(),
      //   updatedAt: serverTimestamp(),
      // });

      // Simulate a delay for the demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message and redirect
      alert('Payment recorded successfully!');
      router.push('/dashboard/fees');
    } catch (err: any) {
      console.error('Error recording payment:', err);
      setError(err.message || 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'NGN 0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(numAmount);
  };

  // Calculate discount if coupon code is provided
  const calculateDiscount = () => {
    if (!formData.couponCode || !formData.amount) return 0;
    
    // In a real implementation, this would validate the coupon code against a database
    // For demo purposes, we'll use a simple mock discount
    const mockDiscounts: Record<string, number> = {
      'WELCOME10': 0.1, // 10% discount
      'STAFF20': 0.2,   // 20% discount
      'SIBLING15': 0.15 // 15% discount
    };
    
    const discountRate = mockDiscounts[formData.couponCode] || 0;
    return parseFloat(formData.amount) * discountRate;
  };

  const discount = calculateDiscount();
  const discountedAmount = formData.amount ? parseFloat(formData.amount) - discount : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Record Fee Payment</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className={`border-l-4 p-4 mb-6 ${error.startsWith('Warning') ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'}`}>
          <p className={error.startsWith('Warning') ? 'text-yellow-700' : 'text-red-700'}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Student <span className="text-red-500">*</span></label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              disabled={loadingStudents}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.admissionNumber}) - {student.class}
                </option>
              ))}
            </select>
            {loadingStudents && <p className="text-xs text-gray-500">Loading students...</p>}
          </div>

          {/* Fee Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fee Type <span className="text-red-500">*</span></label>
            <select
              name="feeTypeId"
              value={formData.feeTypeId}
              onChange={handleChange}
              required
              disabled={loadingFeeTypes}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a fee type</option>
              {feeTypes.map(fee => (
                <option key={fee.id} value={fee.id}>
                  {fee.name} - {formatCurrency(fee.amount)}
                </option>
              ))}
            </select>
            {loadingFeeTypes && <p className="text-xs text-gray-500">Loading fee types...</p>}
            {selectedFeeType && (
              <p className="text-xs text-gray-500">{selectedFeeType.description}</p>
            )}
          </div>

          {/* Fee Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fee Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={!formData.feeTypeId}
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
            <p className="text-xs text-gray-500">Total fee amount</p>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Amount <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              required
              min="1"
              max={discountedAmount.toString()}
              className="w-full px-3 py-2 border rounded-md"
            />
            {formData.amount && (
              <p className="text-xs text-gray-500">
                {parseFloat(formData.amountPaid) < discountedAmount ? 
                  `Partial payment (${formatCurrency(parseFloat(formData.amountPaid))} of ${formatCurrency(discountedAmount)})` : 
                  'Full payment'}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Paystack">Paystack</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder={formData.paymentMethod === 'Cash' ? 'Optional for cash payments' : 'Required for electronic payments'}
            />
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Term */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Term <span className="text-red-500">*</span></label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Academic Year <span className="text-red-500">*</span></label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="2023/2024">2023/2024</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
            <input
              type="text"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter coupon code if available"
            />
            {discount > 0 && (
              <p className="text-xs text-green-600">
                Discount applied: {formatCurrency(discount)} ({(calculateDiscount() / parseFloat(formData.amount) * 100).toFixed(0)}%)
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Any additional notes about this payment"
            ></textarea>
          </div>
        </div>

        {/* Payment Summary */}
        {formData.amount && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Payment Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Original Amount:</div>
              <div className="text-right">{formatCurrency(formData.amount)}</div>
              
              {discount > 0 && (
                <>
                  <div>Discount:</div>
                  <div className="text-right text-green-600">-{formatCurrency(discount)}</div>
                  
                  <div>Discounted Amount:</div>
                  <div className="text-right font-medium">{formatCurrency(discountedAmount)}</div>
                </>
              )}
              
              <div>Amount Paying:</div>
              <div className="text-right">{formatCurrency(formData.amountPaid || 0)}</div>
              
              <div>Balance After Payment:</div>
              <div className="text-right font-medium">
                {formatCurrency(discountedAmount - (parseFloat(formData.amountPaid) || 0))}
              </div>
              
              <div>Payment Status:</div>
              <div className="text-right">
                {parseFloat(formData.amountPaid) === 0 ? (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Unpaid</span>
                ) : parseFloat(formData.amountPaid) < discountedAmount ? (
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Partial</span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Paid</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? 'Processing...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}