'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teachersService, attendanceService } from '@/lib/db';
import { Teacher, Attendance } from '@/lib/types';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function TeacherAttendancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');

  const [newRecord, setNewRecord] = useState({
    date: '',
    status: 'present',
    remarks: '',
  });

  useEffect(() => {
    fetchTeacherAndAttendance();
  }, [params.id]);

  async function fetchTeacherAndAttendance() {
    setLoading(true);
    try {
      const teacherData = await teachersService.getById(params.id);
      if (teacherData) {
        setTeacher(teacherData);
        const q = query(
          collection(attendanceService.collectionName),
          where('recordedBy', '==', teacherData.id),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Attendance[];
        setAttendanceRecords(records);
      } else {
        setError('Teacher not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load teacher data or attendance.');
    } finally {
      setLoading(false);
    }
  }

  const handleRecordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecording(true);
    setError('');

    if (!teacher) {
      setError('Teacher data not loaded.');
      setRecording(false);
      return;
    }

    try {
      await attendanceService.create({
        studentId: '', // Not applicable for teacher attendance, but required by interface
        studentName: '', // Not applicable for teacher attendance
        class: '', // Not applicable for teacher attendance
        date: newRecord.date,
        status: newRecord.status as 'present' | 'absent' | 'late' | 'excused',
        remarks: newRecord.remarks,
        recordedBy: teacher.id,
      });
      alert('Attendance recorded successfully!');
      setNewRecord({ date: '', status: 'present', remarks: '' });
      fetchTeacherAndAttendance(); // Refresh list
    } catch (err) {
      console.error('Error recording attendance:', err);
      setError('Failed to record attendance.');
    } finally {
      setRecording(false);
    }
  };

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
        <h2 className="text-2xl font-bold">Attendance for {teacher.firstName} {teacher.lastName}</h2>
        <button
          onClick={() => router.push(`/dashboard/teachers/${params.id}`)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Profile
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {/* Record New Attendance */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Record New Attendance</h3>
        <form onSubmit={handleRecordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              value={newRecord.date}
              onChange={handleRecordChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={newRecord.status}
              onChange={handleRecordChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              name="remarks"
              id="remarks"
              value={newRecord.remarks}
              onChange={handleRecordChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={recording}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {recording ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>

      {/* Attendance History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Attendance History</h3>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for this teacher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map(record => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
