'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string;
  class?: string;
  term?: string;
  academicYear?: string;
  isRequired: boolean;
  dueDate?: string;
}

export default function FeeStructurePage() {
  const router = useRouter();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [currentFee, setCurrentFee] = useState<FeeType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    class: '',
    term: 'All Terms',
    academicYear: '2023/2024',
    isRequired: true,
    dueDate: '',
  });

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  async function fetchFeeTypes() {
    setLoading(true);
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
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '2',
          name: 'Tuition Fee (Basic 2)',
          amount: 55000,
          description: 'First term tuition fee for Basic 2',
          class: 'Basic 2',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '3',
          name: 'Tuition Fee (Basic 3)',
          amount: 60000,
          description: 'First term tuition fee for Basic 3',
          class: 'Basic 3',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '4',
          name: 'Tuition Fee (Basic 4)',
          amount: 65000,
          description: 'First term tuition fee for Basic 4',
          class: 'Basic 4',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '5',
          name: 'Tuition Fee (Basic 5)',
          amount: 70000,
          description: 'First term tuition fee for Basic 5',
          class: 'Basic 5',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '6',
          name: 'Tuition Fee (Basic 6)',
          amount: 75000,
          description: 'First term tuition fee for Basic 6',
          class: 'Basic 6',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-15',
        },
        {
          id: '7',
          name: 'Development Levy',
          amount: 10000,
          description: 'Annual development levy',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-30',
        },
        {
          id: '8',
          name: 'PTA Fee',
          amount: 5000,
          description: 'Parent-Teacher Association fee',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-30',
        },
        {
          id: '9',
          name: 'Uniform Fee',
          amount: 15000,
          description: 'School uniform fee (one-time payment for new students)',
          term: 'All Terms',
          academicYear: '2023/2024',
          isRequired: false,
          dueDate: '2023-09-30',
        },
        {
          id: '10',
          name: 'Textbook Fee',
          amount: 20000,
          description: 'Textbooks and learning materials',
          term: 'First Term',
          academicYear: '2023/2024',
          isRequired: true,
          dueDate: '2023-09-30',
        },
      ];

      setFeeTypes(mockFeeTypes);
    } catch (error) {
      console.error('Error fetching fee types:', error);
      setError('Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddFee = () => {
    setIsAddingFee(true);
    setIsEditingFee(false);
    setCurrentFee(null);
    setFormData({
      name: '',
      amount: '',
      description: '',
      class: '',
      term: 'All Terms',
      academicYear: '2023/2024',
      isRequired: true,
      dueDate: '',
    });
  };

  const handleEditFee = (fee: FeeType) => {
    setIsAddingFee(false);
    setIsEditingFee(true);
    setCurrentFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      description: fee.description,
      class: fee.class || '',
      term: fee.term || 'All Terms',
      academicYear: fee.academicYear || '2023/2024',
      isRequired: fee.isRequired,
      dueDate: fee.dueDate || '',
    });
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!window.confirm('Are you sure you want to delete this fee type?')) return;
    
    try {
      // In a real implementation, this would delete from Firestore
      // For demo purposes, we'll just update the state
      
      // await deleteDoc(doc(db, 'feeTypes', feeId));
      
      // Update state
      setFeeTypes(prev => prev.filter(fee => fee.id !== feeId));
      alert('Fee type deleted successfully');
    } catch (error) {
      console.error('Error deleting fee type:', error);
      setError('Failed to delete fee type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.name || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare data
      const feeData = {
        name: formData.name,
        amount: amount,
        description: formData.description,
        class: formData.class || undefined,
        term: formData.term === 'All Terms' ? undefined : formData.term,
        academicYear: formData.academicYear,
        isRequired: formData.isRequired,
        dueDate: formData.dueDate || undefined,
      };

      if (isEditingFee && currentFee) {
        // In a real implementation, this would update Firestore
        // For demo purposes, we'll just update the state
        
        // await updateDoc(doc(db, 'feeTypes', currentFee.id), {
        //   ...feeData,
        //   updatedAt: serverTimestamp()
        // });
        
        // Update state
        setFeeTypes(prev => prev.map(fee => 
          fee.id === currentFee.id ? { ...fee, ...feeData } : fee
        ));
        alert('Fee type updated successfully');
      } else {
        // In a real implementation, this would add to Firestore
        // For demo purposes, we'll just update the state
        
        // const docRef = await addDoc(collection(db, 'feeTypes'), {
        //   ...feeData,
        //   createdAt: serverTimestamp(),
        //   updatedAt: serverTimestamp()
        // });
        
        // Update state with a mock ID
        const newId = (Math.max(...feeTypes.map(fee => parseInt(fee.id))) + 1).toString();
        setFeeTypes(prev => [...prev, { ...feeData as FeeType, id: newId }]);
        alert('Fee type added successfully');
      }

      // Reset form
      setIsAddingFee(false);
      setIsEditingFee(false);
      setCurrentFee(null);
    } catch (err: any) {
      console.error('Error saving fee type:', err);
      setError(err.message || 'Failed to save fee type');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fee Structure</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleAddFee}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Fee
          </button>
          <button
            onClick={() => router.push('/dashboard/fees')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Fees
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {(isAddingFee || isEditingFee) && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {isAddingFee ? 'Add New Fee Type' : 'Edit Fee Type'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Fee Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Tuition Fee, Development Levy"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount (NGN) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Class (Optional)</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Classes</option>
                  <option value="Basic 1">Basic 1</option>
                  <option value="Basic 2">Basic 2</option>
                  <option value="Basic 3">Basic 3</option>
                  <option value="Basic 4">Basic 4</option>
                  <option value="Basic 5">Basic 5</option>
                  <option value="Basic 6">Basic 6</option>
                </select>
                <p className="text-xs text-gray-500">Leave blank if this fee applies to all classes</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="All Terms">All Terms</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>Required Fee</span>
                </label>
                <p className="text-xs text-gray-500">Required fees must be paid by all applicable students</p>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Provide details about this fee"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddingFee(false);
                  setIsEditingFee(false);
                  setCurrentFee(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {isAddingFee ? 'Add Fee' : 'Update Fee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fee Types Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : feeTypes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No fee types found. Click "Add New Fee" to create one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
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
              {feeTypes.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.name}</div>
                    <div className="text-xs text-gray-500">{fee.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(fee.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.class || 'All Classes'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.term || 'All Terms'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.isRequired ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFee(fee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFee(fee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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