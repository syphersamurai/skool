'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentsService, attendanceService, classesService } from '@/lib/db';
import { Student, Attendance } from '@/lib/types';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudentAttendanceInput {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note: string;
}

export default function BulkAttendanceRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceInput[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      try {
        const classesList = await classesService.getAll();
        setClasses(classesList.map(cls => cls.name));
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes.');
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchStudentsForClass() {
      if (selectedClass) {
        setLoading(true);
        try {
          const studentsList = await studentsService.getWhere('class', '==', selectedClass);
          setStudents(studentsList);
          // Initialize student attendance structure
          setStudentAttendance(studentsList.map(student => ({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            rollNumber: student.admissionNumber,
            status: 'present', // Default status
            note: '',
          })));
        } catch (err) {
          console.error('Error fetching students for class:', err);
          setError('Failed to load students for selected class.');
        } finally {
          setLoading(false);
        }
      } else {
        setStudents([]);
        setStudentAttendance([]);
      }
    }
    fetchStudentsForClass();
  }, [selectedClass]);

  const handleStudentStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudentAttendance(prev => {
      return prev.map(student =>
        student.studentId === studentId
          ? { ...student, status }
          : student
      );
    });
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    setStudentAttendance(prev => {
      return prev.map(student =>
        student.studentId === studentId
          ? { ...student, note }
          : student
      );
    });
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudentAttendance(prev => {
      return prev.map(student => ({
        ...student,
        status,
      }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const totalStudents = studentAttendance.length;
      const presentCount = studentAttendance.filter(student => student.status === 'present' || student.status === 'late').length;
      const absentCount = studentAttendance.filter(student => student.status === 'absent' || student.status === 'excused').length;
      const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

      const attendanceRecord = {
        date: new Date(selectedDate),
        className: selectedClass,
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
        recordedBy: 'Current User', // Replace with actual user ID/name
        status: 'completed', // Mark as completed upon bulk entry
        studentRecords: studentAttendance.map(student => ({
          studentId: student.studentId,
          studentName: student.studentName,
          rollNumber: student.rollNumber,
          status: student.status,
          note: student.note,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await attendanceService.create(attendanceRecord);
      setSuccess(true);
      alert('Bulk attendance recorded successfully!');
      router.push('/dashboard/attendance');
    } catch (err) {
      console.error('Error saving bulk attendance:', err);
      setError('Failed to save bulk attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bulk Attendance Recording</h2>
        <button
          onClick={() => router.push('/dashboard/attendance')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          Bulk attendance recorded successfully!
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Select Class and Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Mark Attendance</h3>
          <div className="flex justify-end space-x-2 mb-4">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note (Optional)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAttendance.map((student, index) => (
                  <tr key={student.studentId}>
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
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No students found in this class.
        </div>
      )}
    </div>
  );
}
