'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dateOfBirth: '',
    admissionNumber: '',
    class: 'Basic 1',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    healthInformation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
      // In a real implementation, this would add to Firestore
      // For demo purposes, we'll simulate a successful addition
      
      // const docRef = await addDoc(collection(db, 'students'), {
      //   ...formData,
      //   createdAt: serverTimestamp(),
      //   updatedAt: serverTimestamp(),
      //   status: 'active'
      // });

      // Simulate a delay for the demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message and redirect
      alert('Student added successfully!');
      router.push('/dashboard/students');
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Student</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Personal Information</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Admission Number</label>
            <input
              type="text"
              name="admissionNumber"
              value={formData.admissionNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Basic 1">Basic 1</option>
              <option value="Basic 2">Basic 2</option>
              <option value="Basic 3">Basic 3</option>
              <option value="Basic 4">Basic 4</option>
              <option value="Basic 5">Basic 5</option>
              <option value="Basic 6">Basic 6</option>
            </select>
          </div>

          {/* Guardian Information */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Guardian Information</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
            <input
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
              required
              placeholder="+234XXXXXXXXXX"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Guardian Email</label>
            <input
              type="email"
              name="guardianEmail"
              value={formData.guardianEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>

          {/* Health Information */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Health Information</h3>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Health Information (Allergies, Medical Conditions, etc.)</label>
            <textarea
              name="healthInformation"
              value={formData.healthInformation}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}