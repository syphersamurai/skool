'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface ClassData {
  id: string;
  name: string;
  level: number;
  teacherId: string;
  teacherName: string;
  capacity: number;
  currentStudents: number;
  subjects: string[];
  academicYear: string;
  classRoom: string;
  description?: string;
  schedule?: {
    day: string;
    periods: {
      time: string;
      subject: string;
    }[];
  }[];
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'schedule', 'subjects'
  const router = useRouter();

  useEffect(() => {
    fetchClassDetails();
  }, [params.id]);

  async function fetchClassDetails() {
    setLoading(true);
    try {
      const classDocRef = doc(db, 'classes', params.id);
      const classDocSnap = await getDoc(classDocRef);

      if (classDocSnap.exists()) {
        const classData = { id: classDocSnap.id, ...classDocSnap.data() } as ClassData;
        setClassData(classData);
        fetchStudentsInClass(classData.name);
      } else {
        setError('Class not found');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      setError('Failed to load class details');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudentsInClass(className: string) {
    try {
      const q = query(collection(db, 'students'), where('class', '==', className));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Class not found'}</p>
        <button
          onClick={() => router.push('/dashboard/classes')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{classData.name}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/dashboard/classes/${classData.id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit Class
          </button>
          <button
            onClick={() => router.push('/dashboard/classes')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'students' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Students ({classData.currentStudents})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subjects' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Subjects
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Class Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Class Name</span>
                    <p>{classData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Level</span>
                    <p>{classData.level}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Classroom</span>
                    <p>{classData.classRoom}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Academic Year</span>
                    <p>{classData.academicYear}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Capacity</span>
                    <p>{classData.currentStudents}/{classData.capacity} Students</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className={`h-2.5 rounded-full ${classData.currentStudents >= classData.capacity ? 'bg-red-600' : classData.currentStudents >= classData.capacity * 0.9 ? 'bg-yellow-600' : 'bg-green-600'}`} 
                        style={{ width: `${(classData.currentStudents / classData.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Class Teacher</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-4">
                      {classData.teacherName.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium">{classData.teacherName}</h4>
                      <p className="text-sm text-gray-500">Class Teacher</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/staff/${classData.teacherId}`)}
                    className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm"
                  >
                    View Teacher Profile
                  </button>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Description</h3>
                  <p className="text-gray-700">{classData.description || 'No description available.'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push(`/dashboard/classes/${classData.id}/students/add`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Student
                </button>
                <button
                  onClick={() => router.push(`/dashboard/classes/${classData.id}/attendance`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Take Attendance
                </button>
                <button
                  onClick={() => router.push(`/dashboard/classes/${classData.id}/results`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Manage Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Students in {classData.name}</h3>
              <button
                onClick={() => router.push(`/dashboard/classes/${classData.id}/students/add`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Add Student
              </button>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students assigned to this class yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guardian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.admissionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{student.guardianName}</div>
                          <div className="text-xs">{student.guardianPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/students/${student.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={() => alert('This would remove the student from this class')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Class Schedule</h3>
              <button
                onClick={() => router.push(`/dashboard/classes/${classData.id}/schedule/edit`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Edit Schedule
              </button>
            </div>
            
            {!classData.schedule || classData.schedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No schedule has been set for this class yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {classData.schedule.map((day, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b font-medium">
                      {day.day}
                    </div>
                    <div className="divide-y">
                      {day.periods.map((period, periodIndex) => (
                        <div key={periodIndex} className="px-4 py-2">
                          <div className="text-xs text-gray-500">{period.time}</div>
                          <div className={`text-sm ${period.subject === 'Break' ? 'text-green-600 font-medium' : ''}`}>
                            {period.subject}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Subjects Taught</h3>
              <button
                onClick={() => router.push(`/dashboard/classes/${classData.id}/subjects/edit`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Edit Subjects
              </button>
            </div>
            
            {classData.subjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subjects have been assigned to this class yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.subjects.map((subject, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-medium">{subject}</h4>
                    <div className="mt-2 flex justify-between">
                      <button
                        onClick={() => router.push(`/dashboard/subjects/${subject.toLowerCase().replace(/\s+/g, '-')}`)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        View Curriculum
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/classes/${classData.id}/subjects/${subject.toLowerCase().replace(/\s+/g, '-')}/results`)}
                        className="text-sm text-green-600 hover:text-green-900"
                      >
                        View Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}