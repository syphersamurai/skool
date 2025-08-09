'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
}

export default function EditClassPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ClassData>({
    id: '',
    name: '',
    level: 1,
    teacherId: '',
    teacherName: '',
    capacity: 30,
    currentStudents: 0,
    subjects: [],
    academicYear: '',
    classRoom: '',
    description: '',
  });

  // Mock data for teachers (in a real app, this would be fetched from Firestore)
  const teachers = [
    { id: '1', name: 'Dr. Oluwaseun Adebayo' },
    { id: '2', name: 'Mrs. Chioma Eze' },
    { id: '3', name: 'Mr. Emmanuel Nwachukwu' },
    { id: '4', name: 'Ms. Fatima Ibrahim' },
    { id: '5', name: 'Mr. Tunde Bakare' },
  ];

  // Mock data for subjects (in a real app, this would be fetched from Firestore)
  const availableSubjects = [
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Creative Arts',
    'Physical Education',
    'Computer Studies',
    'Religious Studies',
    'Home Economics',
    'Agricultural Science',
    'Business Studies',
    'French',
    'Yoruba',
    'Igbo',
    'Hausa',
  ];

  useEffect(() => {
    fetchClassData();
  }, [params.id]);

  async function fetchClassData() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockClasses: Record<string, ClassData> = {
        '1': {
          id: '1',
          name: 'Basic 1',
          level: 1,
          teacherId: '3',
          teacherName: 'Mr. Emmanuel Nwachukwu',
          capacity: 30,
          currentStudents: 25,
          subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Creative Arts', 'Physical Education'],
          academicYear: '2023/2024',
          classRoom: 'Block A, Room 1',
          description: 'Basic 1 is the first year of primary education in Nigeria. Students learn fundamental skills in literacy, numeracy, and basic science concepts.',
        },
        '2': {
          id: '2',
          name: 'Basic 2',
          level: 2,
          teacherId: '4',
          teacherName: 'Ms. Fatima Ibrahim',
          capacity: 30,
          currentStudents: 28,
          subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Creative Arts', 'Physical Education'],
          academicYear: '2023/2024',
          classRoom: 'Block A, Room 2',
          description: 'Basic 2 builds on the foundation established in Basic 1. Students continue to develop their literacy and numeracy skills while exploring more complex concepts.',
        },
        // Other classes would be defined similarly
      };

      const classData = mockClasses[params.id];
      if (classData) {
        setFormData(classData);
      } else {
        setError('Class not found');
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  }

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
    setSaving(true);
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
      if (formData.capacity < formData.currentStudents) {
        throw new Error(`Capacity cannot be less than current number of students (${formData.currentStudents})`);
      }

      // In a real implementation, this would update Firestore
      // const classRef = doc(db, 'classes', params.id);
      // await updateDoc(classRef, {
      //   name: formData.name,
      //   level: formData.level,
      //   teacherId: formData.teacherId,
      //   teacherName: formData.teacherName,
      //   capacity: formData.capacity,
      //   subjects: formData.subjects,
      //   academicYear: formData.academicYear,
      //   classRoom: formData.classRoom,
      //   description: formData.description,
      //   updatedAt: new Date(),
      // });
      
      // For demo purposes, we'll just simulate a successful update
      console.log('Class would be updated with data:', formData);
      
      // Redirect to the class details page
      setTimeout(() => {
        router.push(`/dashboard/classes/${params.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error updating class:', error);
      setError(error instanceof Error ? error.message : 'Failed to update class');
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

  if (error && !formData.id) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
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
        <h2 className="text-2xl font-bold">Edit Class: {formData.name}</h2>
        <button
          onClick={() => router.push(`/dashboard/classes/${params.id}`)}
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
                    min={formData.currentStudents}
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current students: {formData.currentStudents}
                  </p>
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
                    value={formData.description || ''}
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
            disabled={saving}
            className={`px-4 py-2 ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}