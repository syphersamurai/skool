'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface Subject {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
}

interface ResultFormData {
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  subjects: Subject[];
  teacherRemarks: string;
  principalRemarks: string;
  status: 'draft' | 'published';
}

export default function EditResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<ResultFormData>({
    studentId: '',
    studentName: '',
    className: '',
    term: '',
    academicYear: '',
    subjects: [],
    teacherRemarks: '',
    principalRemarks: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResultDetails();
  }, [params.id]);

  async function fetchResultDetails() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockResults: Record<string, any> = {
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
          teacherRemarks: 'John is a hardworking student who shows great potential.',
          principalRemarks: 'Keep up the good work, John!',
          status: 'draft',
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
          teacherRemarks: 'Amina is an exceptional student who consistently performs at the highest level.',
          principalRemarks: 'Outstanding performance, Amina!',
          status: 'draft',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        // Add more mock results as needed
      };

      const resultDetails = mockResults[params.id];
      if (resultDetails) {
        setFormData({
          studentId: resultDetails.studentId,
          studentName: resultDetails.studentName,
          className: resultDetails.className,
          term: resultDetails.term,
          academicYear: resultDetails.academicYear,
          subjects: resultDetails.subjects,
          teacherRemarks: resultDetails.teacherRemarks,
          principalRemarks: resultDetails.principalRemarks,
          status: resultDetails.status,
        });
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

  const calculateTotal = (ca1: number, ca2: number, exam: number) => {
    return ca1 + ca2 + exam;
  };

  const calculateGrade = (total: number) => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    if (total >= 40) return 'E';
    return 'F';
  };

  const calculateRemarks = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Fair';
      case 'E': return 'Pass';
      default: return 'Needs Improvement';
    }
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: any) => {
    const updatedSubjects = [...formData.subjects];
    
    // Update the specified field
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: field === 'name' ? value : Number(value),
    };
    
    // If CA1, CA2, or Exam was changed, recalculate total, grade, and remarks
    if (field === 'ca1' || field === 'ca2' || field === 'exam') {
      const subject = updatedSubjects[index];
      const total = calculateTotal(subject.ca1, subject.ca2, subject.exam);
      const grade = calculateGrade(total);
      const remarks = calculateRemarks(grade);
      
      updatedSubjects[index] = {
        ...subject,
        total,
        grade,
        remarks,
      };
    }
    
    setFormData({
      ...formData,
      subjects: updatedSubjects,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Calculate total and average scores
      const totalScore = formData.subjects.reduce((sum, subject) => sum + subject.total, 0);
      const averageScore = totalScore / formData.subjects.length;
      
      const updatedResult = {
        ...formData,
        status: saveAsDraft ? 'draft' : 'published',
        totalScore,
        averageScore,
        updatedAt: new Date(),
      };
      
      // In a real implementation, this would update Firestore
      // For demo purposes, we'll just simulate a delay
      /*
      await updateDoc(doc(db, 'results', params.id), {
        ...updatedResult,
        updatedAt: serverTimestamp(),
      });
      */
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/dashboard/results/${params.id}`);
    } catch (error) {
      console.error('Error updating result:', error);
      setError('Failed to update result');
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

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
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
        <h2 className="text-2xl font-bold">Edit Result</h2>
        <button
          onClick={() => router.push(`/dashboard/results/${params.id}`)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Student Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="2023/2024">2023/2024</option>
                <option value="2022/2023">2022/2023</option>
                <option value="2021/2022">2021/2022</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Subject Scores</h3>
            <p className="text-sm text-gray-500 mt-1">Enter scores for each subject (CA1: 15%, CA2: 15%, Exam: 70%)</p>
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
                {formData.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={subject.ca1}
                        onChange={(e) => handleSubjectChange(index, 'ca1', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={subject.ca2}
                        onChange={(e) => handleSubjectChange(index, 'ca2', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        value={subject.exam}
                        onChange={(e) => handleSubjectChange(index, 'exam', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.grade}
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

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Remarks</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Remarks</label>
              <textarea
                name="teacherRemarks"
                value={formData.teacherRemarks}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal's Remarks</label>
              <textarea
                name="principalRemarks"
                value={formData.principalRemarks}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mb-6">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish Result'}
          </button>
        </div>
      </form>
    </div>
  );
}