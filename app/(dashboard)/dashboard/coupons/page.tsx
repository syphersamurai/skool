'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 1,
    expiryDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  // Load coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const couponsData: Coupon[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Coupon, 'id'>;
        couponsData.push({
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate ? new Date(data.expiryDate.seconds * 1000).toISOString().split('T')[0] : ''
        });
      });
      
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCurrentCoupon(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setCurrentCoupon(prev => ({ ...prev, [name]: parseFloat(value) }));
      return;
    }
    
    setCurrentCoupon(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentCoupon.code || !currentCoupon.discountType || currentCoupon.discountValue === undefined) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Validate coupon code format
      if (!/^[A-Z0-9_-]{3,20}$/.test(currentCoupon.code)) {
        setError('Coupon code must be 3-20 characters and contain only uppercase letters, numbers, underscores, and hyphens');
        return;
      }
      
      // Validate discount value based on type
      if (currentCoupon.discountType === 'percentage' && (currentCoupon.discountValue <= 0 || currentCoupon.discountValue > 100)) {
        setError('Percentage discount must be between 1 and 100');
        return;
      }
      
      if (currentCoupon.discountType === 'fixed' && currentCoupon.discountValue <= 0) {
        setError('Fixed discount must be greater than 0');
        return;
      }
      
      // Check for duplicate code when creating new coupon
      if (!isEditing) {
        const codeExists = coupons.some(coupon => 
          coupon.code.toLowerCase() === currentCoupon.code?.toLowerCase() && coupon.id !== currentCoupon.id
        );
        
        if (codeExists) {
          setError('A coupon with this code already exists');
          return;
        }
      }
      
      if (isEditing && currentCoupon.id) {
        // Update existing coupon
        const couponRef = doc(db, 'coupons', currentCoupon.id);
        await updateDoc(couponRef, {
          ...currentCoupon,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new coupon
        await addDoc(collection(db, 'coupons'), {
          ...currentCoupon,
          usedCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Reset form and refresh coupons
      resetForm();
      fetchCoupons();
      
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError('Failed to save coupon. Please try again.');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setIsEditing(true);
    setIsFormOpen(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await deleteDoc(doc(db, 'coupons', id));
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon. Please try again.');
    }
  };

  const resetForm = () => {
    setCurrentCoupon({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 1,
      expiryDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setIsEditing(false);
    setIsFormOpen(false);
    setError(null);
  };

  const formatDiscountValue = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}%`;
      case 'fixed':
        return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN'
        }).format(coupon.discountValue);
      case 'free':
        return 'Free';
      default:
        return coupon.discountValue.toString();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {isFormOpen ? 'Cancel' : 'Add New Coupon'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isFormOpen && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code*
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={currentCoupon.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. SUMMER2023"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use uppercase letters, numbers, underscores, and hyphens only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type*
                  </label>
                  <select
                    name="discountType"
                    value={currentCoupon.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free">Free (100% off)</option>
                  </select>
                </div>

                {currentCoupon.discountType !== 'free' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value*
                    </label>
                    <div className="relative">
                      {currentCoupon.discountType === 'percentage' && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">%</span>
                        </div>
                      )}
                      {currentCoupon.discountType === 'fixed' && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">₦</span>
                        </div>
                      )}
                      <input
                        type="number"
                        name="discountValue"
                        value={currentCoupon.discountValue}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                          currentCoupon.discountType === 'fixed' ? 'pl-8' : ''
                        }`}
                        min={0}
                        max={currentCoupon.discountType === 'percentage' ? 100 : undefined}
                        step={currentCoupon.discountType === 'percentage' ? 1 : 0.01}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Uses
                  </label>
                  <input
                    type="number"
                    name="maxUses"
                    value={currentCoupon.maxUses}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={currentCoupon.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={currentCoupon.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={currentCoupon.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional description of the coupon"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 text-center">
            <p className="text-gray-500">No coupons found. Create your first coupon to get started.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
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
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDiscountValue(coupon)}</div>
                      <div className="text-sm text-gray-500">{coupon.discountType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.usedCount} / {coupon.maxUses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}