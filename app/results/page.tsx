'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resultsService } from '@/lib/db';
import { Result } from '@/lib/types';
import Link from 'next/link';

interface SubjectDisplay {
  subjectName: string;
  total: number;
  grade: string;
  remarks: string;
}

export default function PublicResultCheckPage() {
  const [studentId, setStudentId] = useState('');
  const [resultKey, setResultKey] = useState(''); // Could be admission number, or a unique result ID
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // In a real scenario, you'd have a more secure way to retrieve results,
      // e.g., by a unique result ID or by authenticating the parent/student.
      // For this example, we'll assume studentId is the document ID for simplicity.
      const fetchedResult = await resultsService.getById(studentId); // Assuming studentId is the result document ID

      if (fetchedResult && fetchedResult.status === 'published') {
        setResult(fetchedResult);
      } else {
        setError('Result not found or not yet published.');
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setError('An error occurred while fetching the result.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-purple-100 text-purple-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Check Student Result</h1>

        <form onSubmit={handleCheckResult} className="space-y-4">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID / Result ID</label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="resultKey" className="block text-sm font-medium text-gray-700">Result Key (e.g., Admission No.)</label>
            <input
              type="text"
              id="resultKey"
              value={resultKey}
              onChange={(e) => setResultKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? 'Checking...' : 'Check Result'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold text-center mb-4">Report Card</h2>
            <div className="text-center border-b-2 border-gray-200 pb-4 mb-4">
              <h1 className="text-xl font-bold text-indigo-800">SKOOL ACADEMY</h1>
              <p className="text-gray-600 text-sm">123 Education Street, Learning City</p>
              <p className="text-gray-700 font-medium mt-2">{result.term} - {result.academicYear} Academic Session</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Student Name: <span className="font-medium text-gray-900">{result.studentName}</span></p>
                <p className="text-sm text-gray-600">Class: <span className="font-medium text-gray-900">{result.className}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Score: <span className="font-medium text-gray-900">{result.totalScore}</span></p>
                <p className="text-sm text-gray-600">Average Score: <span className="font-medium text-gray-900">{result.averageScore.toFixed(2)}%</span></p>
                <p className="text-sm text-gray-600">Position: <span className="font-medium text-gray-900">{result.position}</span></p>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-2">Subject Scores</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 border-b border-r text-left text-xs">Subject</th>
                    <th className="py-2 px-3 border-b border-r text-center text-xs">Total</th>
                    <th className="py-2 px-3 border-b border-r text-center text-xs">Grade</th>
                    <th className="py-2 px-3 border-b text-left text-xs">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects.map((subject, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b border-r text-sm font-medium">{subject.subjectName}</td>
                      <td className="py-2 px-3 border-b border-r text-center text-sm">{subject.total}</td>
                      <td className="py-2 px-3 border-b border-r text-center text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{subject.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mb-2">Remarks</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">Teacher's Remarks: <span className="font-medium text-gray-900">{result.teacherComment}</span></p>
              <p className="text-sm text-gray-600">Principal's Remarks: <span className="font-medium text-gray-900">{result.principalComment}</span></p>
            </div>

            <div className="text-center text-gray-500 text-xs mt-6">
              <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-indigo-600 hover:underline">Admin Login</Link>
      </div>
    </div>
  );
}
