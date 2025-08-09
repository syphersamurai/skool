'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

export default function AttendanceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
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
        '2': {
          id: '2',
          date: new Date('2023-12-01'),
          className: 'Basic 2',
          totalStudents: 10,
          presentCount: 9,
          absentCount: 1,
          attendanceRate: 90,
          recordedBy: 'Mary Johnson',
          status: 'completed',
          studentRecords: [
            { studentId: '11', studentName: 'Alex Turner', rollNumber: 'B2001', status: 'present', note: '' },
            { studentId: '12', studentName: 'Olivia Parker', rollNumber: 'B2002', status: 'present', note: '' },
            { studentId: '13', studentName: 'Mohammed Ali', rollNumber: 'B2003', status: 'present', note: '' },
            { studentId: '14', studentName: 'Grace Okafor', rollNumber: 'B2004', status: 'present', note: '' },
            { studentId: '15', studentName: 'Daniel Lee', rollNumber: 'B2005', status: 'present', note: '' },
            { studentId: '16', studentName: 'Sophia Chen', rollNumber: 'B2006', status: 'present', note: '' },
            { studentId: '17', studentName: 'Tunde Bakare', rollNumber: 'B2007', status: 'present', note: '' },
            { studentId: '18', studentName: 'Zainab Ibrahim', rollNumber: 'B2008', status: 'present', note: '' },
            { studentId: '19', studentName: 'Emeka Eze', rollNumber: 'B2009', status: 'absent', note: 'Medical appointment' },
            { studentId: '20', studentName: 'Ngozi Obi', rollNumber: 'B2010', status: 'present', note: '' },
          ],
          createdAt: new Date('2023-12-01T09:15:00'),
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Attendance Details</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/dashboard/attendance/${attendanceRecord.id}/print`)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Print
          </button>
          {attendanceRecord.status === 'pending' && (
            <button
              onClick={() => router.push(`/dashboard/attendance/${attendanceRecord.id}/edit`)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Take Attendance
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/attendance')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${attendanceRecord.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1)}
        </span>
      </div>

      {/* Attendance Information */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="font-medium">{attendanceRecord.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Class</span>
                  <p>{attendanceRecord.className}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Recorded By</span>
                  <p>{attendanceRecord.recordedBy}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Recorded On</span>
                  <p>{attendanceRecord.createdAt.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Total Students</span>
                  <p>{attendanceRecord.totalStudents}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Present</span>
                  <p className="text-green-600 font-medium">{attendanceRecord.presentCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Absent</span>
                  <p className="text-red-600 font-medium">{attendanceRecord.absentCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Attendance Rate</span>
                  <p className="font-medium">{attendanceRecord.attendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Attendance Visualization</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="w-48 h-48 relative rounded-full overflow-hidden">
              <div 
                className="absolute bg-green-500" 
                style={{
                  width: '100%',
                  height: '100%',
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * attendanceRecord.presentCount / attendanceRecord.totalStudents)}% ${50 - 50 * Math.sin(2 * Math.PI * attendanceRecord.presentCount / attendanceRecord.totalStudents)}%, 50% 50%)`
                }}
              ></div>
              <div 
                className="absolute bg-red-500" 
                style={{
                  width: '100%',
                  height: '100%',
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * attendanceRecord.presentCount / attendanceRecord.totalStudents)}% ${50 - 50 * Math.sin(2 * Math.PI * attendanceRecord.presentCount / attendanceRecord.totalStudents)}%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{attendanceRecord.attendanceRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Attendance</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-8 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>Present: {attendanceRecord.presentCount} students</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span>Absent: {attendanceRecord.absentCount} students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Attendance Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Student Attendance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecord.studentRecords.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/students/${student.studentId}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              onClick={() => router.push(`/dashboard/attendance?class=${encodeURIComponent(attendanceRecord.className)}`)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm font-medium"
            >
              View Class Attendance History
            </button>
            <button
              onClick={() => router.push(`/dashboard/attendance/reports?class=${encodeURIComponent(attendanceRecord.className)}`)}
              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm font-medium"
            >
              Generate Attendance Report
            </button>
            <button
              onClick={() => router.push(`/dashboard/attendance/export?id=${attendanceRecord.id}`)}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm font-medium"
            >
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}