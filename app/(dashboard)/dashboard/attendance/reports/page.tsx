'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  createdAt: Date;
}

interface ClassAttendance {
  className: string;
  averageAttendanceRate: number;
  totalRecords: number;
}

interface MonthlyAttendance {
  month: string;
  attendanceRate: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

export default function AttendanceReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last6Months');
  const [classes, setClasses] = useState<string[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedClass, selectedPeriod]);

  async function fetchAttendanceData() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      
      // Mock attendance records
      const mockAttendanceRecords: AttendanceRecord[] = [
        {
          id: '1',
          date: new Date('2023-12-01'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 8,
          absentCount: 2,
          attendanceRate: 80,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-12-01T08:30:00'),
        },
        {
          id: '2',
          date: new Date('2023-12-02'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 9,
          absentCount: 1,
          attendanceRate: 90,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-12-02T08:30:00'),
        },
        {
          id: '3',
          date: new Date('2023-12-01'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 10,
          absentCount: 2,
          attendanceRate: 83.33,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-12-01T09:15:00'),
        },
        {
          id: '4',
          date: new Date('2023-12-02'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 11,
          absentCount: 1,
          attendanceRate: 91.67,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-12-02T09:15:00'),
        },
        {
          id: '5',
          date: new Date('2023-12-01'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 13,
          absentCount: 2,
          attendanceRate: 86.67,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-12-01T10:00:00'),
        },
        {
          id: '6',
          date: new Date('2023-11-15'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 7,
          absentCount: 3,
          attendanceRate: 70,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-11-15T08:30:00'),
        },
        {
          id: '7',
          date: new Date('2023-11-15'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 9,
          absentCount: 3,
          attendanceRate: 75,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-11-15T09:15:00'),
        },
        {
          id: '8',
          date: new Date('2023-11-15'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 12,
          absentCount: 3,
          attendanceRate: 80,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-11-15T10:00:00'),
        },
        {
          id: '9',
          date: new Date('2023-10-20'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 8,
          absentCount: 2,
          attendanceRate: 80,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-10-20T08:30:00'),
        },
        {
          id: '10',
          date: new Date('2023-10-20'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 10,
          absentCount: 2,
          attendanceRate: 83.33,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-10-20T09:15:00'),
        },
        {
          id: '11',
          date: new Date('2023-10-20'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 14,
          absentCount: 1,
          attendanceRate: 93.33,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-10-20T10:00:00'),
        },
        {
          id: '12',
          date: new Date('2023-09-10'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 9,
          absentCount: 1,
          attendanceRate: 90,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-09-10T08:30:00'),
        },
        {
          id: '13',
          date: new Date('2023-09-10'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 11,
          absentCount: 1,
          attendanceRate: 91.67,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-09-10T09:15:00'),
        },
        {
          id: '14',
          date: new Date('2023-09-10'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 13,
          absentCount: 2,
          attendanceRate: 86.67,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-09-10T10:00:00'),
        },
        {
          id: '15',
          date: new Date('2023-08-05'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 7,
          absentCount: 3,
          attendanceRate: 70,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-08-05T08:30:00'),
        },
        {
          id: '16',
          date: new Date('2023-08-05'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 8,
          absentCount: 4,
          attendanceRate: 66.67,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-08-05T09:15:00'),
        },
        {
          id: '17',
          date: new Date('2023-08-05'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 11,
          absentCount: 4,
          attendanceRate: 73.33,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-08-05T10:00:00'),
        },
        {
          id: '18',
          date: new Date('2023-07-15'),
          className: 'Basic 1',
          totalStudents: 10,
          presentCount: 8,
          absentCount: 2,
          attendanceRate: 80,
          recordedBy: 'John Smith',
          status: 'completed',
          createdAt: new Date('2023-07-15T08:30:00'),
        },
        {
          id: '19',
          date: new Date('2023-07-15'),
          className: 'Basic 2',
          totalStudents: 12,
          presentCount: 10,
          absentCount: 2,
          attendanceRate: 83.33,
          recordedBy: 'Jane Doe',
          status: 'completed',
          createdAt: new Date('2023-07-15T09:15:00'),
        },
        {
          id: '20',
          date: new Date('2023-07-15'),
          className: 'Basic 3',
          totalStudents: 15,
          presentCount: 12,
          absentCount: 3,
          attendanceRate: 80,
          recordedBy: 'Robert Williams',
          status: 'completed',
          createdAt: new Date('2023-07-15T10:00:00'),
        },
      ];

      // Extract unique class names
      const uniqueClasses = Array.from(new Set(mockAttendanceRecords.map(record => record.className)));
      setClasses(uniqueClasses);

      // Filter records based on selected class
      let filteredRecords = mockAttendanceRecords;
      if (selectedClass !== 'all') {
        filteredRecords = mockAttendanceRecords.filter(record => record.className === selectedClass);
      }

      // Filter records based on selected period
      const now = new Date();
      let periodStartDate: Date;
      
      switch (selectedPeriod) {
        case 'last3Months':
          periodStartDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'last6Months':
          periodStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case 'lastYear':
          periodStartDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          periodStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      }
      
      filteredRecords = filteredRecords.filter(record => record.date >= periodStartDate);

      // Process class attendance data
      const classAttendanceMap = new Map<string, { totalRate: number; count: number }>();
      filteredRecords.forEach(record => {
        const existing = classAttendanceMap.get(record.className) || { totalRate: 0, count: 0 };
        classAttendanceMap.set(record.className, {
          totalRate: existing.totalRate + record.attendanceRate,
          count: existing.count + 1,
        });
      });

      const classAttendanceData: ClassAttendance[] = Array.from(classAttendanceMap.entries()).map(
        ([className, data]) => ({
          className,
          averageAttendanceRate: data.totalRate / data.count,
          totalRecords: data.count,
        })
      );
      setClassAttendance(classAttendanceData);

      // Process monthly attendance data
      const monthlyMap = new Map<string, { totalRate: number; count: number }>();
      filteredRecords.forEach(record => {
        const monthYear = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(monthYear) || { totalRate: 0, count: 0 };
        monthlyMap.set(monthYear, {
          totalRate: existing.totalRate + record.attendanceRate,
          count: existing.count + 1,
        });
      });

      const monthlyData: MonthlyAttendance[] = Array.from(monthlyMap.entries())
        .map(([monthYear, data]) => {
          const [year, month] = monthYear.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          return {
            month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            attendanceRate: data.totalRate / data.count,
          };
        })
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });
      setMonthlyAttendance(monthlyData);

      // Process status distribution data
      const presentCount = filteredRecords.reduce((sum, record) => sum + record.presentCount, 0);
      const absentCount = filteredRecords.reduce((sum, record) => sum + record.absentCount, 0);
      const lateCount = Math.round((presentCount + absentCount) * 0.05); // Assuming 5% of students are late (for demo)
      const excusedCount = Math.round((presentCount + absentCount) * 0.03); // Assuming 3% of students have excused absences (for demo)
      
      setStatusDistribution([
        { status: 'Present', count: presentCount - lateCount },
        { status: 'Absent', count: absentCount - excusedCount },
        { status: 'Late', count: lateCount },
        { status: 'Excused', count: excusedCount },
      ]);

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }

  const exportData = () => {
    // In a real implementation, this would generate a CSV or Excel file
    alert('Attendance data export initiated. The file will be downloaded shortly.');
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
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Attendance Reports & Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Data
          </button>
          <button
            onClick={() => router.push('/dashboard/attendance')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Attendance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="last3Months">Last 3 Months</option>
                <option value="last6Months">Last 6 Months</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Average Attendance Rate</p>
              <p className="text-2xl font-bold">
                {classAttendance.length > 0
                  ? `${(classAttendance.reduce((sum, item) => sum + item.averageAttendanceRate, 0) / classAttendance.length).toFixed(2)}%`
                  : '0%'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Total Records</p>
              <p className="text-2xl font-bold">
                {classAttendance.reduce((sum, item) => sum + item.totalRecords, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Attendance by Class</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classAttendance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Legend />
                <Bar dataKey="averageAttendanceRate" name="Average Attendance Rate (%)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Attendance Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Monthly Attendance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyAttendance}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="attendanceRate" name="Attendance Rate (%)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Class Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Attendance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classAttendance.map((item, index) => (
                <tr key={item.className} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.averageAttendanceRate.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.totalRecords}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getPerformanceColor(item.averageAttendanceRate)}`}
                          style={{ width: `${item.averageAttendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{getPerformanceLabel(item.averageAttendanceRate)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getPerformanceColor(rate: number): string {
  if (rate >= 90) return 'bg-green-600';
  if (rate >= 80) return 'bg-blue-600';
  if (rate >= 70) return 'bg-yellow-600';
  return 'bg-red-600';
}

function getPerformanceLabel(rate: number): string {
  if (rate >= 90) return 'Excellent';
  if (rate >= 80) return 'Good';
  if (rate >= 70) return 'Average';
  return 'Poor';
}