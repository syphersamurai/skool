'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  createdAt?: any;
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

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
          createdAt: { toDate: () => new Date('2023-01-15') }
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
          createdAt: { toDate: () => new Date('2023-02-10') }
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
          createdAt: { toDate: () => new Date('2023-01-20') }
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
          createdAt: { toDate: () => new Date('2022-09-05') }
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
          createdAt: { toDate: () => new Date('2022-08-15') }
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
          createdAt: { toDate: () => new Date('2022-07-20') }
        }
      };

      const studentData = mockStudents[params.id];
      if (studentData) {
        setStudent(studentData);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Student not found'}</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{student.name}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/dashboard/students/${student.id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => router.push('/dashboard/students')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Student Status Badge */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Admission Number</span>
              <h3 className="text-lg font-medium">{student.admissionNumber}</h3>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {student.status === 'active' ? 'Active' : student.status}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Full Name</span>
              <p>{student.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Class</span>
              <p>{student.class}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Gender</span>
              <p>{student.gender}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Date of Birth</span>
              <p>{student.dateOfBirth || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Admission Date</span>
              <p>{student.createdAt ? student.createdAt.toDate().toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Guardian Name</span>
              <p>{student.guardianName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Guardian Phone</span>
              <p>{student.guardianPhone}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Guardian Email</span>
              <p>{student.guardianEmail || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Address</span>
              <p>{student.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Health Information</h3>
          <div>
            <span className="text-sm text-gray-500">Health Notes</span>
            <p>{student.healthInformation || 'No health information provided'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push(`/dashboard/students/${student.id}/fees`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View Fees
          </button>
          <button
            onClick={() => router.push(`/dashboard/students/${student.id}/results`)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Results
          </button>
          <button
            onClick={() => router.push(`/dashboard/students/${student.id}/attendance`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Attendance Record
          </button>
        </div>
      </div>
    </div>
  );
}