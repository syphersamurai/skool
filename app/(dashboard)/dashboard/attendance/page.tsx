'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
}

export default function AttendancePage() {
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Summary stats
  const [averageAttendanceRate, setAverageAttendanceRate] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pendingRecords, setPendingRecords] = useState(0);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  async function fetchAttendanceRecords() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockAttendanceRecords: AttendanceRecord[] = [
        {
          id: '1',
          date: new Date('2023-12-01'),
          className: 'Basic 1',
          totalStudents: 25,
          presentCount: 23,
          absentCount: 2,
          attendanceRate: 92,
          recordedBy: 'John Smith',
          status: 'completed',
        },
        {
          id: '2',
          date: new Date('2023-12-01'),
          className: 'Basic 2',
          totalStudents: 28,
          presentCount: 25,
          absentCount: 3,
          attendanceRate: 89.3,
          recordedBy: 'Mary Johnson',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date('2023-12-02'),
          className: 'Basic 3',
          totalStudents: 30,
          presentCount: 27,
          absentCount: 3,
          attendanceRate: 90,
          recordedBy: 'Robert Williams',
          status: 'completed',
        },
        {
          id: '4',
          date: new Date('2023-12-02'),
          className: 'Basic 1',
          totalStudents: 25,
          presentCount: 24,
          absentCount: 1,
          attendanceRate: 96,
          recordedBy: 'John Smith',
          status: 'completed',
        },
        {
          id: '5',
          date: new Date('2023-12-03'),
          className: 'Basic 2',
          totalStudents: 28,
          presentCount: 26,
          absentCount: 2,
          attendanceRate: 92.9,
          recordedBy: 'Mary Johnson',
          status: 'completed',
        },
        {
          id: '6',
          date: new Date(),
          className: 'Basic 3',
          totalStudents: 30,
          presentCount: 0,
          absentCount: 0,
          attendanceRate: 0,
          recordedBy: 'Robert Williams',
          status: 'pending',
        },
        {
          id: '7',
          date: new Date(),
          className: 'Basic 1',
          totalStudents: 25,
          presentCount: 0,
          absentCount: 0,
          attendanceRate: 0,
          recordedBy: 'John Smith',
          status: 'pending',
        },
      ];

      setAttendanceRecords(mockAttendanceRecords);
      
      // Calculate summary stats
      const completedRecords = mockAttendanceRecords.filter(record => record.status === 'completed');
      const avgRate = completedRecords.length > 0 
        ? completedRecords.reduce((sum, record) => sum + record.attendanceRate, 0) / completedRecords.length 
        : 0;
      
      setAverageAttendanceRate(avgRate);
      setTotalRecords(mockAttendanceRecords.length);
      setPendingRecords(mockAttendanceRecords.filter(record => record.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter attendance records based on search term and filters
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter ? record.className === classFilter : true;
    
    const matchesDate = dateFilter 
      ? record.date.toISOString().split('T')[0] === dateFilter 
      : true;
    
    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    
    return matchesSearch && matchesClass && matchesDate && matchesStatus;
  });

  // Get unique class names for filter dropdown
  const classOptions = Array.from(new Set(attendanceRecords.map(record => record.className)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        <button
          onClick={() => router.push('/dashboard/attendance/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Take Attendance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Attendance Rate</p>
              <p className="text-2xl font-bold">{averageAttendanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Records</p>
              <p className="text-2xl font-bold">{pendingRecords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by class or teacher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              id="classFilter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Classes</option>
              {classOptions.map((className, index) => (
                <option key={index} value={className}>{className}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAttendanceRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.presentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.absentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : record.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {record.status === 'pending' ? '-' : `${record.attendanceRate.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.recordedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/attendance/${record.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        {record.status === 'pending' && (
                          <button
                            onClick={() => router.push(`/dashboard/attendance/${record.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Take
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/attendance/reports')}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm font-medium"
          >
            View Attendance Reports
          </button>
          <button
            onClick={() => router.push('/dashboard/attendance/trends')}
            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm font-medium"
          >
            Analyze Attendance Trends
          </button>
          <button
            onClick={() => router.push('/dashboard/attendance/export')}
            className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm font-medium"
          >
            Export Attendance Data
          </button>
        </div>
      </div>
    </div>
  );
}