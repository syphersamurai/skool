'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';

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

export default function FeesPage() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    async function fetchFeeRecords() {
      setLoading(true);
      try {
        let feesQuery = collection(db, 'fees');

        if (statusFilter !== 'all') {
          feesQuery = query(feesQuery, where('status', '==', statusFilter));
        }
        if (classFilter !== 'all') {
          feesQuery = query(feesQuery, where('class', '==', classFilter));
        }
        if (termFilter !== 'all') {
          feesQuery = query(feesQuery, where('term', '==', termFilter));
        }

        const querySnapshot = await getDocs(feesQuery);
        let fetchedRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FeeRecord[];

        // Apply search filter client-side
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          fetchedRecords = fetchedRecords.filter(record => 
            record.studentName.toLowerCase().includes(term) ||
            record.feeType.toLowerCase().includes(term) ||
            record.transactionId?.toLowerCase().includes(term)
          );
        }

        setFeeRecords(fetchedRecords);
      } catch (error) {
        console.error('Error fetching fee records:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeeRecords();
  }, [statusFilter, classFilter, termFilter, searchTerm]);

  // Filter fee records based on search term
  const filteredRecords = feeRecords.filter(record =>
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalFees = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalCollected = filteredRecords.reduce((sum, record) => sum + record.amountPaid, 0);
  const totalOutstanding = filteredRecords.reduce((sum, record) => sum + record.balance, 0);
  const paidCount = filteredRecords.filter(record => record.status === 'paid').length;
  const partialCount = filteredRecords.filter(record => record.status === 'partial').length;
  const unpaidCount = filteredRecords.filter(record => record.status === 'unpaid').length;
  const overdueCount = filteredRecords.filter(record => record.status === 'overdue').length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fees Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/dashboard/fees/new')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Record Payment
          </button>
          <button
            onClick={() => router.push('/dashboard/fees/structure')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fee Structure
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Fees</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalFees)}</p>
          <div className="mt-1 text-xs text-gray-500">{filteredRecords.length} fee records</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Collected</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
          <div className="mt-1 text-xs text-gray-500">{paidCount} paid, {partialCount} partial</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
          <div className="mt-1 text-xs text-gray-500">{unpaidCount} unpaid, {overdueCount} overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
          <p className="text-2xl font-bold">
            {totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${totalFees > 0 ? (totalCollected / totalFees) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by student name, fee type, or transaction ID"
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <select
            className="px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            <option value="Basic 1">Basic 1</option>
            <option value="Basic 2">Basic 2</option>
            <option value="Basic 3">Basic 3</option>
            <option value="Basic 4">Basic 4</option>
            <option value="Basic 5">Basic 5</option>
            <option value="Basic 6">Basic 6</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          >
            <option value="all">All Terms</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No fee records found. Try adjusting your filters or add a new fee record.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                    <div className="text-xs text-gray-500">{record.class}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.feeType}</div>
                    <div className="text-xs text-gray-500">{record.term}, {record.academicYear}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(record.amountPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(record.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'paid' ? 'bg-green-100 text-green-800' :
                      record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'unpaid' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/fees/${record.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </button>
                    {(record.status === 'unpaid' || record.status === 'partial' || record.status === 'overdue') && (
                      <button
                        onClick={() => router.push(`/dashboard/fees/${record.id}/pay`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}