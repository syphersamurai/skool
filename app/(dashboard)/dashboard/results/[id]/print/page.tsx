'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

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

export default function PrintReportCardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResultDetails();
  }, [params.id]);

  async function fetchResultDetails() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockResults: Record<string, Result> = {
        '1': {
          id: '1',
          studentId: '1',
          studentName: 'John Doe',
          className: 'Basic 1',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 15, ca2: 18, exam: 55, total: 88, grade: 'A', remarks: 'Excellent' },
            { name: 'English', ca1: 12, ca2: 15, exam: 48, total: 75, grade: 'B', remarks: 'Good' },
            { name: 'Science', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
            { name: 'Social Studies', ca1: 13, ca2: 14, exam: 45, total: 72, grade: 'B', remarks: 'Good' },
            { name: 'Creative Arts', ca1: 14, ca2: 15, exam: 50, total: 79, grade: 'B', remarks: 'Good' },
            { name: 'Physical Education', ca1: 15, ca2: 15, exam: 60, total: 90, grade: 'A', remarks: 'Excellent' },
          ],
          totalScore: 484,
          averageScore: 80.67,
          position: 2,
          classAverage: 72.5,
          teacherRemarks: 'John is a hardworking student who shows great potential.',
          principalRemarks: 'Keep up the good work, John!',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        '2': {
          id: '2',
          studentId: '7',
          studentName: 'Amina Yusuf',
          className: 'Basic 1',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 18, ca2: 19, exam: 58, total: 95, grade: 'A', remarks: 'Excellent' },
            { name: 'English', ca1: 15, ca2: 17, exam: 52, total: 84, grade: 'A', remarks: 'Very Good' },
            { name: 'Science', ca1: 16, ca2: 18, exam: 54, total: 88, grade: 'A', remarks: 'Excellent' },
            { name: 'Social Studies', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
            { name: 'Creative Arts', ca1: 15, ca2: 17, exam: 53, total: 85, grade: 'A', remarks: 'Very Good' },
            { name: 'Physical Education', ca1: 15, ca2: 15, exam: 62, total: 92, grade: 'A', remarks: 'Excellent' },
          ],
          totalScore: 524,
          averageScore: 87.33,
          position: 1,
          classAverage: 72.5,
          teacherRemarks: 'Amina is an exceptional student who consistently performs at the highest level.',
          principalRemarks: 'Outstanding performance, Amina!',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        // Add more mock results as needed
      };

      const resultDetails = mockResults[params.id];
      if (resultDetails) {
        setResult(resultDetails);
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

  const handlePrint = () => {
    window.print();
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
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 print:hidden"
        >
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Print Report Card</h2>
        <div className="flex space-x-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Print
          </button>
          <button
            onClick={() => router.push(`/dashboard/results/${result.id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Report Card for Printing */}
      <div ref={printRef} className="bg-white shadow-lg rounded-lg overflow-hidden p-8 max-w-4xl mx-auto print:shadow-none print:p-0">
        {/* School Header */}
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
          <div className="flex justify-center mb-2">
            {/* Placeholder for school logo */}
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-xs">School Logo</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-indigo-800">SKOOL ACADEMY</h1>
          <p className="text-gray-600">123 Education Street, Learning City</p>
          <p className="text-gray-600">Tel: +234 123 456 7890 | Email: info@skoolacademy.edu</p>
          <h2 className="text-xl font-bold mt-4 text-indigo-700">STUDENT REPORT CARD</h2>
          <p className="text-gray-700 font-medium">{result.term} - {result.academicYear} Academic Session</p>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-indigo-700">Student Information</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Name:</td>
                  <td className="py-2 font-semibold">{result.studentName}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Student ID:</td>
                  <td className="py-2">{result.studentId}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Class:</td>
                  <td className="py-2">{result.className}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3 text-indigo-700">Performance Summary</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Total Score:</td>
                  <td className="py-2 font-semibold">{result.totalScore} / {result.subjects.length * 100}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Average Score:</td>
                  <td className="py-2 font-semibold">{result.averageScore.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Position in Class:</td>
                  <td className="py-2 font-semibold">{result.position}{result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 font-medium">Class Average:</td>
                  <td className="py-2">{result.classAverage.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading System */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-indigo-700">Grading System</h3>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded">
              <p className="font-medium">A: 80-100%</p>
              <p className="text-xs text-gray-600">Excellent</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="font-medium">B: 70-79%</p>
              <p className="text-xs text-gray-600">Very Good</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <p className="font-medium">C: 60-69%</p>
              <p className="text-xs text-gray-600">Good</p>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <p className="font-medium">D: 50-59%</p>
              <p className="text-xs text-gray-600">Fair</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="font-medium">F: 0-49%</p>
              <p className="text-xs text-gray-600">Fail</p>
            </div>
          </div>
        </div>

        {/* Subject Scores */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-indigo-700">Academic Performance</h3>
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b border-r text-left">Subject</th>
                <th className="py-2 px-4 border-b border-r text-center">CA1 (15%)</th>
                <th className="py-2 px-4 border-b border-r text-center">CA2 (15%)</th>
                <th className="py-2 px-4 border-b border-r text-center">Exam (70%)</th>
                <th className="py-2 px-4 border-b border-r text-center">Total</th>
                <th className="py-2 px-4 border-b border-r text-center">Grade</th>
                <th className="py-2 px-4 border-b text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 border-b border-r font-medium">{subject.name}</td>
                  <td className="py-2 px-4 border-b border-r text-center">{subject.ca1}</td>
                  <td className="py-2 px-4 border-b border-r text-center">{subject.ca2}</td>
                  <td className="py-2 px-4 border-b border-r text-center">{subject.exam}</td>
                  <td className="py-2 px-4 border-b border-r text-center font-medium">{subject.total}</td>
                  <td className="py-2 px-4 border-b border-r text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-sm">{subject.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-indigo-700">Remarks</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Teacher's Remarks:</p>
              <p className="text-gray-800">{result.teacherRemarks}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Principal's Remarks:</p>
              <p className="text-gray-800">{result.principalRemarks}</p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 mt-10">
              <p className="text-sm font-medium">Class Teacher's Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 mt-10">
              <p className="text-sm font-medium">Principal's Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 mt-10">
              <p className="text-sm font-medium">Parent's Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs mt-10 pt-6 border-t border-gray-200">
          <p>This report card was generated on {new Date().toLocaleDateString()}</p>
          <p>© {new Date().getFullYear()} Skool Academy. All rights reserved.</p>
        </div>
      </div>

      {/* Print Styles - These will only apply when printing */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:shadow-none {
            box-shadow: none !important;
          }
          .print\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}