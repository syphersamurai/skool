'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

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
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'classes'));
        const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClassData[];
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classRoom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classes</h2>
        <button
          onClick={() => router.push('/dashboard/classes/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Class
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by class name, teacher, or classroom"
          className="w-full px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white p-6 text-center text-gray-500 rounded-lg shadow">
          No classes found. Try adjusting your search or add a new class.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div 
              key={cls.id} 
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/classes/${cls.id}`)}
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{cls.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cls.currentStudents >= cls.capacity ? 'bg-red-100 text-red-800' :
                    cls.currentStudents >= cls.capacity * 0.9 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {cls.currentStudents}/{cls.capacity} Students
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{cls.classRoom}</p>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="text-sm">{cls.teacherName}</span>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Subjects</h4>
                  <div className="flex flex-wrap gap-1">
                    {cls.subjects.slice(0, 3).map((subject, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {subject}
                      </span>
                    ))}
                    {cls.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        +{cls.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Academic Year: {cls.academicYear}
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/classes/${cls.id}/students`);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 mr-4"
                >
                  View Students
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/classes/${cls.id}/edit`);
                  }}
                  className="text-xs text-yellow-600 hover:text-yellow-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}