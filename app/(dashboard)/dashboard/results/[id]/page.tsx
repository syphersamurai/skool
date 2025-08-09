'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Subject {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
}

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  subjects: Subject[];
  totalScore: number;
  averageScore: number;
  position: number;
  classAverage: number;
  teacherRemarks: string;
  principalRemarks: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export default function ResultDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResultDetails();
  }, [params.id]);

  async function fetchResultDetails() {
    setLoading(true);
    try {
      const resultData = await resultsService.getById(params.id);
      if (resultData) {
        setResult(resultData);
      } else {
        setError('Result not found');
      }
    } catch (error) {
      console.error('Error fetching result details:', error);
      setError('Failed to load result details');
    } finally {
      setLoading(false);
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
      case 'E':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Result not found'}</p>
        <button
          onClick={() => router.push('/dashboard/results')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Result Details</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/dashboard/results/${result.id}/print`)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Print Report Card
          </button>
          {result.status === 'draft' && (
            <button
              onClick={() => router.push(`/dashboard/results/${result.id}/edit`)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Edit Result
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/results')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${result.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
        </span>
      </div>

      {/* Student and Result Information */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Student Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Student Name</span>
                  <p className="font-medium">{result.studentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Class</span>
                  <p>{result.className}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Student ID</span>
                  <p>{result.studentId}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Result Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Term</span>
                  <p>{result.term}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Academic Year</span>
                  <p>{result.academicYear}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Position in Class</span>
                  <p className="font-medium">{result.position}{result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Performance Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-sm text-indigo-600 mb-1">Total Score</div>
              <div className="text-2xl font-bold">{result.totalScore}</div>
              <div className="text-sm text-gray-500 mt-1">Out of {result.subjects.length * 100}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Average Score</div>
              <div className="text-2xl font-bold">{result.averageScore.toFixed(2)}%</div>
              <div className="text-sm text-gray-500 mt-1">Class Average: {result.classAverage.toFixed(2)}%</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Performance</div>
              <div className="text-2xl font-bold">
                {result.averageScore >= 70 ? 'Excellent' : 
                 result.averageScore >= 60 ? 'Very Good' : 
                 result.averageScore >= 50 ? 'Good' : 
                 result.averageScore >= 45 ? 'Fair' : 
                 result.averageScore >= 40 ? 'Pass' : 'Fail'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {result.averageScore >= result.classAverage ? 'Above Class Average' : 'Below Class Average'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Scores */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Subject Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA1 (15%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA2 (15%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam (70%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.subjects.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.ca1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.ca2}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.exam}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Remarks</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Teacher's Remarks</h4>
            <p className="text-gray-900 p-4 bg-gray-50 rounded-md">{result.teacherRemarks}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Principal's Remarks</h4>
            <p className="text-gray-900 p-4 bg-gray-50 rounded-md">{result.principalRemarks}</p>
          </div>
        </div>
      </div>

      {/* Approval Workflow Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Approval Workflow</h3>
        </div>
        <div className="p-6 text-gray-500">
          <p>This section will manage the result approval process (e.g., teacher submission, principal approval).</p>
          <button
            onClick={() => alert('Implement result approval functionality here.')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Manage Approval
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/dashboard/students/${result.studentId}`)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm font-medium"
            >
              View Student Profile
            </button>
            <button
              onClick={() => router.push(`/dashboard/results?class=${encodeURIComponent(result.className)}&term=${encodeURIComponent(result.term)}&year=${encodeURIComponent(result.academicYear)}`)}
              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm font-medium"
            >
              View Class Results
            </button>
            <button
              onClick={() => router.push(`/dashboard/results/compare?student=${result.studentId}&term=${encodeURIComponent(result.term)}&year=${encodeURIComponent(result.academicYear)}`)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium"
            >
              Compare with Previous Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}