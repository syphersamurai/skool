'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
}

interface AttendanceFormData {
  date: string;
  className: string;
  students: {
    id: string;
    name: string;
    rollNumber: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note: string;
  }[];
}

export default function TakeAttendancePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AttendanceFormData>({
    date: new Date().toISOString().split('T')[0],
    className: '',
    students: [],
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (formData.className) {
      fetchStudentsByClass(formData.className);
    }
  }, [formData.className]);

  async function fetchClasses() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockClasses = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'];
      setClasses(mockClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudentsByClass(className: string) {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockStudents: Student[] = [
        { id: '1', name: 'John Doe', rollNumber: 'B1001', className: 'Basic 1' },
        { id: '2', name: 'Jane Smith', rollNumber: 'B1002', className: 'Basic 1' },
        { id: '3', name: 'Michael Johnson', rollNumber: 'B1003', className: 'Basic 1' },
        { id: '4', name: 'Emily Davis', rollNumber: 'B1004', className: 'Basic 1' },
        { id: '5', name: 'David Wilson', rollNumber: 'B1005', className: 'Basic 1' },
        { id: '6', name: 'Sarah Brown', rollNumber: 'B1006', className: 'Basic 1' },
        { id: '7', name: 'Amina Yusuf', rollNumber: 'B1007', className: 'Basic 1' },
        { id: '8', name: 'Chinedu Okonkwo', rollNumber: 'B1008', className: 'Basic 1' },
        { id: '9', name: 'Fatima Ahmed', rollNumber: 'B1009', className: 'Basic 1' },
        { id: '10', name: 'Oluwaseun Adeyemi', rollNumber: 'B1010', className: 'Basic 1' },
        { id: '11', name: 'Alex Turner', rollNumber: 'B2001', className: 'Basic 2' },
        { id: '12', name: 'Olivia Parker', rollNumber: 'B2002', className: 'Basic 2' },
        { id: '13', name: 'Mohammed Ali', rollNumber: 'B2003', className: 'Basic 2' },
        { id: '14', name: 'Grace Okafor', rollNumber: 'B2004', className: 'Basic 2' },
        { id: '15', name: 'Daniel Lee', rollNumber: 'B2005', className: 'Basic 2' },
        { id: '16', name: 'Sophia Chen', rollNumber: 'B2006', className: 'Basic 2' },
        { id: '17', name: 'Tunde Bakare', rollNumber: 'B2007', className: 'Basic 2' },
        { id: '18', name: 'Zainab Ibrahim', rollNumber: 'B2008', className: 'Basic 2' },
        { id: '19', name: 'Emeka Eze', rollNumber: 'B2009', className: 'Basic 2' },
        { id: '20', name: 'Ngozi Obi', rollNumber: 'B2010', className: 'Basic 2' },
      ];

      const filteredStudents = mockStudents.filter(student => student.className === className);
      
      setFormData(prev => ({
        ...prev,
        students: filteredStudents.map(student => ({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          status: 'present', // Default status
          note: '',
        })),
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStudentStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student =>
        student.id === studentId
          ? { ...student, status }
          : student
      ),
    }));
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student =>
        student.id === studentId
          ? { ...student, note }
          : student
      ),
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late' | 'excused') => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student => ({
        ...student,
        status,
      })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Calculate attendance statistics
      const totalStudents = formData.students.length;
      const presentCount = formData.students.filter(student => student.status === 'present' || student.status === 'late').length;
      const absentCount = formData.students.filter(student => student.status === 'absent' || student.status === 'excused').length;
      const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
      
      const attendanceRecord = {
        date: new Date(formData.date),
        className: formData.className,
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        recordedBy: 'Current User', // In a real app, this would be the current user's name
        status: 'completed',
        studentRecords: formData.students.map(student => ({
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          status: student.status,
          note: student.note,
        })),
        createdAt: new Date(),
      };
      
      // In a real implementation, this would save to Firestore
      // For demo purposes, we'll just simulate a delay
      /*
      await addDoc(collection(db, 'attendance'), {
        ...attendanceRecord,
        createdAt: serverTimestamp(),
      });
      */
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard/attendance');
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Take Attendance</h2>
        <button
          onClick={() => router.push('/dashboard/attendance')}
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Attendance Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Class</option>
                {classes.map((className, index) => (
                  <option key={index} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {formData.className && formData.students.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Student Attendance</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note (Optional)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.students.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'present')}
                            className={`px-3 py-1 rounded-md text-sm ${student.status === 'present' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 rounded-md text-sm ${student.status === 'absent' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'late')}
                            className={`px-3 py-1 rounded-md text-sm ${student.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(student.id, 'excused')}
                            className={`px-3 py-1 rounded-md text-sm ${student.status === 'excused' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Add note"
                          value={student.note}
                          onChange={(e) => handleStudentNoteChange(student.id, e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 mb-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/attendance')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.className || formData.students.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}