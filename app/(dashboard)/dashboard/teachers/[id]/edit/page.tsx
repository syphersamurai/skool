'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { teachersService, classesService, subjectsService } from '@/lib/db';
import { Teacher, Class, Subject } from '@/lib/types';

export default function EditTeacherPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const [formData, setFormData] = useState<Partial<Teacher>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: 0,
    subjects: [],
    classes: [],
    employeeId: '',
    hireDate: '',
    salary: 0,
    status: 'active',
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const teacherData = await teachersService.getById(params.id);
        if (teacherData) {
          setTeacher(teacherData);
          setFormData(teacherData);
        } else {
          setError('Teacher not found');
        }

        const classesData = await classesService.getAll();
        setAllClasses(classesData);

        const subjectsData = await subjectsService.getAll();
        setAllSubjects(subjectsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: selectedValues
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!teacher) return;
      await teachersService.update(teacher.id, formData);
      alert('Teacher updated successfully!');
      router.push(`/dashboard/teachers/${teacher.id}`);
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError('Failed to update teacher.');
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Teacher: {teacher.firstName} {teacher.lastName}</h2>
        <button
          onClick={() => router.push(`/dashboard/teachers/${params.id}`)}
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

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Personal Information</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md"></textarea>
          </div>

          {/* Professional Information */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Professional Information</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            <input type="number" name="experience" value={formData.experience} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Hire Date</label>
            <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Salary</label>
            <input type="number" name="salary" value={formData.salary} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          {/* Assignments */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Assignments</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assigned Classes</label>
            <select multiple name="classes" value={formData.classes} onChange={handleMultiSelectChange} className="w-full px-3 py-2 border rounded-md h-32">
              {allClasses.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assigned Subjects</label>
            <select multiple name="subjects" value={formData.subjects} onChange={handleMultiSelectChange} className="w-full px-3 py-2 border rounded-md h-32">
              {allSubjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/teachers/${params.id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
