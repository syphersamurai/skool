'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note: string;
}

interface AttendanceRecord {
  id: string;
  date: Date;
  className: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  recordedBy: string;
  status: 'pending' | 'completed';
  studentRecords: StudentAttendance[];
  createdAt: Date;
}

export default function EditAttendancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceDetails();
  }, [params.id]);

  async function fetchAttendanceDetails() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockAttendanceRecords: Record<string, AttendanceRecord> = {
        '1': {
          id: '1',
          date: new Date('2023-12-01'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 8,
          absentCount: 2,
          attendanceRate: 80,
          recordedBy: 'John Smith',
          status: 'completed',
          studentRecords: [
            { studentId: '1', studentName: 'John Doe', rollNumber: 'B1001', status: 'present', note: '' },
            { studentId: '2', studentName: 'Jane Smith', rollNumber: 'B1002', status: 'present', note: '' },
            { studentId: '3', studentName: 'Michael Johnson', rollNumber: 'B1003', status: 'present', note: '' },
            { studentId: '4', studentName: 'Emily Davis', rollNumber: 'B1004', status: 'present', note: '' },
            { studentId: '5', studentName: 'David Wilson', rollNumber: 'B1005', status: 'absent', note: 'Sick leave' },
            { studentId: '6', studentName: 'Sarah Brown', rollNumber: 'B1006', status: 'present', note: '' },
            { studentId: '7', studentName: 'Amina Yusuf', rollNumber: 'B1007', status: 'present', note: '' },
            { studentId: '8', studentName: 'Chinedu Okonkwo', rollNumber: 'B1008', status: 'present', note: '' },
            { studentId: '9', studentName: 'Fatima Ahmed', rollNumber: 'B1009', status: 'present', note: '' },
            { studentId: '10', studentName: 'Oluwaseun Adeyemi', rollNumber: 'B1010', status: 'absent', note: 'Family emergency' },
          ],
          createdAt: new Date('2023-12-01T08:30:00'),
        },
        '6': {
          id: '6',
          date: new Date(),
          className: 'Basic 3',
          totalStudents: 10,
          presentCount: 0,
          absentCount: 0,
          attendanceRate: 0,
          recordedBy: 'Robert Williams',
          status: 'pending',
          studentRecords: [
            { studentId: '21', studentName: 'Ade Johnson', rollNumber: 'B3001', status: 'present', note: '' },
            { studentId: '22', studentName: 'Blessing Okafor', rollNumber: 'B3002', status: 'present', note: '' },
            { studentId: '23', studentName: 'Chisom Eze', rollNumber: 'B3003', status: 'present', note: '' },
            { studentId: '24', studentName: 'Damilola Adeyemi', rollNumber: 'B3004', status: 'present', note: '' },
            { studentId: '25', studentName: 'Emmanuel Obi', rollNumber: 'B3005', status: 'present', note: '' },
            { studentId: '26', studentName: 'Folake Adeleke', rollNumber: 'B3006', status: 'present', note: '' },
            { studentId: '27', studentName: 'Gabriel Nnamdi', rollNumber: 'B3007', status: 'present', note: '' },
            { studentId: '28', studentName: 'Hannah Ibrahim', rollNumber: 'B3008', status: 'present', note: '' },
            { studentId: '29', studentName: 'Isaac Okonkwo', rollNumber: 'B3009', status: 'present', note: '' },
            { studentId: '30', studentName: 'Joy Afolayan', rollNumber: 'B3010', status: 'present', note: '' },
          ],
          createdAt: new Date(),
        },
        '7': {
          id: '7',
          date: new Date(),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 0,
          absentCount: 0,
          attendanceRate: 0,
          recordedBy: 'John Smith',
          status: 'pending',
          studentRecords: [
            { studentId: '1', studentName: 'John Doe', rollNumber: 'B1001', status: 'present', note: '' },
            { studentId: '2', studentName: 'Jane Smith', rollNumber: 'B1002', status: 'present', note: '' },
            { studentId: '3', studentName: 'Michael Johnson', rollNumber: 'B1003', status: 'present', note: '' },
            { studentId: '4', studentName: 'Emily Davis', rollNumber: 'B1004', status: 'present', note: '' },
            { studentId: '5', studentName: 'David Wilson', rollNumber: 'B1005', status: 'present', note: '' },
            { studentId: '6', studentName: 'Sarah Brown', rollNumber: 'B1006', status: 'present', note: '' },
            { studentId: '7', studentName: 'Amina Yusuf', rollNumber: 'B1007', status: 'present', note: '' },
            { studentId: '8', studentName: 'Chinedu Okonkwo', rollNumber: 'B1008', status: 'present', note: '' },
            { studentId: '9', studentName: 'Fatima Ahmed', rollNumber: 'B1009', status: 'present', note: '' },
            { studentId: '10', studentName: 'Oluwaseun Adeyemi', rollNumber: 'B1010', status: 'present', note: '' },
          ],
          createdAt: new Date(),
        },
        // Add more mock records as needed
      };

      const recordDetails = mockAttendanceRecords[params.id];
      if (recordDetails) {
        setAttendanceRecord(recordDetails);
      } else {
        setError('Attendance record not found');
      }
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      setError('Failed to load attendance details');
    } finally {
      setLoading(false);
    }
  }

  const handleStudentStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!attendanceRecord) return;
    
    setAttendanceRecord(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        studentRecords: prev.studentRecords.map(student =>
          student.studentId === studentId
            ? { ...student, status }
            : student
        ),
      };
    });
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    if (!attendanceRecord) return;
    
    setAttendanceRecord(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        studentRecords: prev.studentRecords.map(student =>
          student.studentId === studentId
            ? { ...student, note }
            : student
        ),
      };
    });
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!attendanceRecord) return;
    
    setAttendanceRecord(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        studentRecords: prev.studentRecords.map(student => ({
          ...student,
          status,
        })),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceRecord) return;
    
    setSaving(true);
    
    try {
      // Calculate attendance statistics
      const totalStudents = attendanceRecord.studentRecords.length;
      const presentCount = attendanceRecord.studentRecords.filter(student => 
        student.status === 'present' || student.status === 'late'
      ).length;
      const absentCount = attendanceRecord.studentRecords.filter(student => 
        student.status === 'absent' || student.status === 'excused'
      ).length;
      const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
      
      const updatedAttendanceRecord = {
        ...attendanceRecord,
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        status: 'completed' as const,
      };
      
      // In a real implementation, this would update Firestore
      // For demo purposes, we'll just simulate a delay
      /*
      await updateDoc(doc(db, 'attendance', params.id), {
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        status: 'completed',
        studentRecords: updatedAttendanceRecord.studentRecords,
        updatedAt: serverTimestamp(),
      });
      */
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/dashboard/attendance/${params.id}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      setError('Failed to update attendance');
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

  if (error || !attendanceRecord) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Attendance record not found'}</p>
        <button
          onClick={() => router.push('/dashboard/attendance')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Attendance
        </button>
      </div>
    );
  }

  if (attendanceRecord.status === 'completed') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <p className="text-yellow-700">This attendance record has already been completed and cannot be edited.</p>
        <button
          onClick={() => router.push(`/dashboard/attendance/${params.id}`)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          View Attendance Details
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Take Attendance</h2>
        <button
          onClick={() => router.push(`/dashboard/attendance/${params.id}`)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Attendance Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="text"
                value={attendanceRecord.date.toLocaleDateString()}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                value={attendanceRecord.className}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

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
                {attendanceRecord.studentRecords.map((student, index) => (
                  <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStudentStatusChange(student.studentId, 'present')}
                          className={`px-3 py-1 rounded-md text-sm ${student.status === 'present' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStudentStatusChange(student.studentId, 'absent')}
                          className={`px-3 py-1 rounded-md text-sm ${student.status === 'absent' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStudentStatusChange(student.studentId, 'late')}
                          className={`px-3 py-1 rounded-md text-sm ${student.status === 'late' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStudentStatusChange(student.studentId, 'excused')}
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
                        onChange={(e) => handleStudentNoteChange(student.studentId, e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mb-6">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/attendance/${params.id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
}