'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface SchedulePeriod {
  time: string;
  subject: string;
}

interface ScheduleDay {
  day: string;
  periods: SchedulePeriod[];
}

interface ClassData {
  id: string;
  name: string;
  schedule?: ScheduleDay[];
}

export default function EditClassSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    async function fetchClassSchedule() {
      setLoading(true);
      try {
        const docRef = doc(db, 'classes', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as ClassData;
          setClassData(data);
          // Initialize schedule with existing data or empty structure
          setSchedule(data.schedule || daysOfWeek.map(day => ({ day, periods: [] })));
        } else {
          setError('Class not found');
        }
      } catch (err) {
        console.error('Error fetching class schedule:', err);
        setError('Failed to load class schedule.');
      } finally {
        setLoading(false);
      }
    }
    fetchClassSchedule();
  }, [params.id]);

  const handlePeriodChange = (dayIndex: number, periodIndex: number, field: keyof SchedulePeriod, value: string) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex].periods[periodIndex] = {
        ...newSchedule[dayIndex].periods[periodIndex],
        [field]: value,
      };
      return newSchedule;
    });
  };

  const handleAddPeriod = (dayIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex].periods.push({ time: '', subject: '' });
      return newSchedule;
    });
  };

  const handleRemovePeriod = (dayIndex: number, periodIndex: number) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex].periods.splice(periodIndex, 1);
      return newSchedule;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const classRef = doc(db, 'classes', params.id);
      await updateDoc(classRef, { schedule });
      alert('Schedule updated successfully!');
      router.push(`/dashboard/classes/${params.id}`);
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Failed to update schedule.');
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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Schedule for {classData.name}</h2>
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

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedule.map((day, dayIndex) => (
            <div key={day.day} className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">{day.day}</h3>
              {day.periods.map((period, periodIndex) => (
                <div key={periodIndex} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Time (e.g., 8:00 - 8:45)"
                    value={period.time}
                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'time', e.target.value)}
                    className="w-1/2 px-2 py-1 border rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={period.subject}
                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'subject', e.target.value)}
                    className="w-1/2 px-2 py-1 border rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePeriod(dayIndex, periodIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddPeriod(dayIndex)}
                className="mt-4 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600"
              >
                Add Period
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
