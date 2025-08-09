'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedClasses: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!user) return;

      try {
        const q = query(collection(db, "classes"), where("teacher_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        let studentCount = 0;
        querySnapshot.forEach((doc) => {
          studentCount += doc.data().students.length;
        });
        setStats({
          assignedClasses: querySnapshot.size,
          totalStudents: studentCount,
        });
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacherData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Teacher Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Assigned Classes" value={stats.assignedClasses} icon="🏫" color="bg-blue-500" />
        <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="bg-green-500" />
      </div>
      {/* Add more teacher-specific components here */}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`${color} h-2`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </div>
  );
}
