'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function NewClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    teacherId: '',
    teacherName: '',
    capacity: 30,
    academicYear: '2023/2024',
    classRoom: '',
    description: '',
    subjects: [] as string[],
  });

  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeachersAndSubjects = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, 'users'), where('role', '==', 'teacher'));
        const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.data().email }));
        setTeachers(teachersData);

        const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
        const subjectsData = subjectsSnapshot.docs.map(doc => doc.data().name);
        setAvailableSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching teachers and subjects:', error);
      }
    };
    fetchTeachersAndSubjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If teacher selection changes, update the teacher name as well
    if (name === 'teacherId') {
      const selectedTeacher = teachers.find(teacher => teacher.id === value);
      if (selectedTeacher) {
        setFormData(prev => ({
          ...prev,
          teacherName: selectedTeacher.name
        }));
      }
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => {
      const subjects = [...prev.subjects];
      if (subjects.includes(subject)) {
        return {
          ...prev,
          subjects: subjects.filter(s => s !== subject)
        };
      } else {
        return {
          ...prev,
          subjects: [...subjects, subject]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.name) {
        throw new Error('Class name is required');
      }
      if (!formData.teacherId) {
        throw new Error('Class teacher is required');
      }
      if (!formData.classRoom) {
        throw new Error('Classroom is required');
      }
      if (formData.subjects.length === 0) {
        throw new Error('At least one subject must be selected');
      }

      const docRef = await addDoc(collection(db, 'classes'), {
        ...formData,
        currentStudents: 0,
        createdAt: new Date(),
      });
      
      alert('Class added successfully!');
      router.push('/dashboard/classes');
    } catch (error) {
      console.error('Error adding class:', error);
      setError(error instanceof Error ? error.message : 'Failed to add class');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Class</h2>
        <button
          onClick={() => router.push('/dashboard/classes')}
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

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Class Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Basic 1, JSS 1, SS 1"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <input
                    type="number"
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher *
                  </label>
                  <select
                    id="teacherId"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2023/2024"
                  />
                </div>

                <div>
                  <label htmlFor="classRoom" className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom *
                  </label>
                  <input
                    type="text"
                    id="classRoom"
                    name="classRoom"
                    value={formData.classRoom}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Block A, Room 1"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of the class..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-lg font-medium mb-4">Subjects *</h3>
            <p className="text-sm text-gray-500 mb-3">Select the subjects that will be taught in this class</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSubjects.map(subject => (
                <div key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject}`}
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`subject-${subject}`} className="ml-2 block text-sm text-gray-700">
                    {subject}
                  </label>
                </div>
              ))}
            </div>
            {formData.subjects.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Please select at least one subject</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </form>
    </div>
  );
}