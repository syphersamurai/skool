'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  async function fetchStudents() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'John Doe',
          class: 'Basic 1',
          admissionNumber: 'STU001',
          gender: 'Male',
          guardianName: 'Jane Doe',
          guardianPhone: '+2348012345678',
        },
        {
          id: '2',
          name: 'Mary Johnson',
          class: 'Basic 2',
          admissionNumber: 'STU002',
          gender: 'Female',
          guardianName: 'Robert Johnson',
          guardianPhone: '+2348023456789',
        },
        {
          id: '3',
          name: 'David Smith',
          class: 'Basic 3',
          admissionNumber: 'STU003',
          gender: 'Male',
          guardianName: 'Sarah Smith',
          guardianPhone: '+2348034567890',
        },
        {
          id: '4',
          name: 'Grace Okafor',
          class: 'Basic 4',
          admissionNumber: 'STU004',
          gender: 'Female',
          guardianName: 'Emmanuel Okafor',
          guardianPhone: '+2348045678901',
        },
        {
          id: '5',
          name: 'Ibrahim Musa',
          class: 'Basic 5',
          admissionNumber: 'STU005',
          gender: 'Male',
          guardianName: 'Fatima Musa',
          guardianPhone: '+2348056789012',
        },
        {
          id: '6',
          name: 'Chioma Eze',
          class: 'Basic 6',
          admissionNumber: 'STU006',
          gender: 'Female',
          guardianName: 'Chinedu Eze',
          guardianPhone: '+2348067890123',
        },
      ];

      // Apply class filter if not 'all'
      let filteredStudents = mockStudents;
      if (classFilter !== 'all') {
        filteredStudents = mockStudents.filter(student => student.class === classFilter);
      }

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.guardianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Students</h2>
        <button
          onClick={() => router.push('/dashboard/students/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, admission number, or guardian"
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
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
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No students found. Try adjusting your filters or add a new student.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guardian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.admissionNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{student.guardianName}</div>
                    <div className="text-xs">{student.guardianPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/students/${student.id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      Edit
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