'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  gender: string;
  dateOfBirth?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address?: string;
  healthInformation?: string;
  status?: string;
}

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Student>({
    id: '',
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
    status: 'active',
  });

  useEffect(() => {
    fetchStudentDetails();
  }, [params.id]);

  async function fetchStudentDetails() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockStudents: Record<string, Student> = {
        '1': {
          id: '1',
          name: 'John Doe',
          class: 'Basic 1',
          admissionNumber: 'STU001',
          gender: 'Male',
          dateOfBirth: '2015-05-12',
          guardianName: 'Jane Doe',
          guardianPhone: '+2348012345678',
          guardianEmail: 'jane.doe@example.com',
          address: '123 Main Street, Lagos, Nigeria',
          healthInformation: 'No known allergies',
          status: 'active',
        },
        '2': {
          id: '2',
          name: 'Mary Johnson',
          class: 'Basic 2',
          admissionNumber: 'STU002',
          gender: 'Female',
          dateOfBirth: '2014-08-23',
          guardianName: 'Robert Johnson',
          guardianPhone: '+2348023456789',
          guardianEmail: 'robert.johnson@example.com',
          address: '456 Oak Avenue, Abuja, Nigeria',
          healthInformation: 'Mild asthma, carries inhaler',
          status: 'active',
        },
        '3': {
          id: '3',
          name: 'David Smith',
          class: 'Basic 3',
          admissionNumber: 'STU003',
          gender: 'Male',
          dateOfBirth: '2013-11-05',
          guardianName: 'Sarah Smith',
          guardianPhone: '+2348034567890',
          guardianEmail: 'sarah.smith@example.com',
          address: '789 Elm Street, Port Harcourt, Nigeria',
          healthInformation: 'Peanut allergy',
          status: 'active',
        },
        '4': {
          id: '4',
          name: 'Grace Okafor',
          class: 'Basic 4',
          admissionNumber: 'STU004',
          gender: 'Female',
          dateOfBirth: '2012-04-18',
          guardianName: 'Emmanuel Okafor',
          guardianPhone: '+2348045678901',
          guardianEmail: 'emmanuel.okafor@example.com',
          address: '101 Pine Road, Enugu, Nigeria',
          healthInformation: 'Wears glasses for reading',
          status: 'active',
        },
        '5': {
          id: '5',
          name: 'Ibrahim Musa',
          class: 'Basic 5',
          admissionNumber: 'STU005',
          gender: 'Male',
          dateOfBirth: '2011-07-30',
          guardianName: 'Fatima Musa',
          guardianPhone: '+2348056789012',
          guardianEmail: 'fatima.musa@example.com',
          address: '202 Cedar Lane, Kano, Nigeria',
          healthInformation: 'No health issues',
          status: 'active',
        },
        '6': {
          id: '6',
          name: 'Chioma Eze',
          class: 'Basic 6',
          admissionNumber: 'STU006',
          gender: 'Female',
          dateOfBirth: '2010-12-03',
          guardianName: 'Chinedu Eze',
          guardianPhone: '+2348067890123',
          guardianEmail: 'chinedu.eze@example.com',
          address: '303 Maple Drive, Calabar, Nigeria',
          healthInformation: 'Mild eczema',
          status: 'active',
        }
      };

      const studentData = mockStudents[params.id];
      if (studentData) {
        setFormData(studentData);
      } else {
        setError('Student not found');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // In a real implementation, this would update Firestore
      // For demo purposes, we'll simulate a successful update
      
      // const studentRef = doc(db, 'students', params.id);
      // await updateDoc(studentRef, {
      //   ...formData,
      //   updatedAt: serverTimestamp()
      // });

      // Simulate a delay for the demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message and redirect
      alert('Student updated successfully!');
      router.push(`/dashboard/students/${params.id}`);
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !formData.id) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => router.push('/dashboard/students')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Student: {formData.name}</h2>
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
              value={formData.dateOfBirth || ''}
              onChange={handleChange}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="transferred">Transferred</option>
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
              value={formData.guardianEmail || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address || ''}
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
              value={formData.healthInformation || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/students/${params.id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}