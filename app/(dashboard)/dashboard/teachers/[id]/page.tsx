'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teachersService } from '@/lib/db';
import { Teacher } from '@/lib/types';

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTeacherDetails();
  }, [params.id]);

  async function fetchTeacherDetails() {
    setLoading(true);
    try {
      const teacherData = await teachersService.getById(params.id);
      if (teacherData) {
        setTeacher(teacherData);
      } else {
        setError('Teacher not found');
      }
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setError('Failed to load teacher details');
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

  if (error || !teacher) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Teacher not found'}</p>
        <button
          onClick={() => router.push('/dashboard/teachers')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Teachers
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{teacher.firstName} {teacher.lastName}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/dashboard/teachers/${teacher.id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => router.push('/dashboard/teachers')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Teacher Details */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Full Name</span>
              <p>{teacher.firstName} {teacher.middleName} {teacher.lastName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Employee ID</span>
              <p>{teacher.employeeId}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Gender</span>
              <p>{teacher.gender}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Date of Birth</span>
              <p>{teacher.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Hire Date</span>
              <p>{teacher.hireDate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                teacher.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : teacher.status === 'inactive'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {teacher.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p>{teacher.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone</span>
              <p>{teacher.phone}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Address</span>
              <p>{teacher.address}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Qualification</span>
              <p>{teacher.qualification}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Experience (Years)</span>
              <p>{teacher.experience}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Salary</span>
              <p>₦{teacher.salary.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Subjects Taught</span>
              <div className="flex flex-wrap gap-1">
                {teacher.subjects.map((subject, index) => (
                  <span key={index} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Assigned Classes</span>
              <div className="flex flex-wrap gap-1">
                {teacher.classes.map((className, index) => (
                  <span key={index} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {className}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Evaluation Section */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Performance Evaluation</h3>
          <div className="text-gray-500">
            <p>This section will display performance evaluation history and allow new evaluations.</p>
            <button
              onClick={() => alert('Implement performance evaluation functionality here.')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Conduct New Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
