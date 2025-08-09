'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    pendingFees: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        
        const classChartData = classesSnapshot.docs.map(doc => ({
          name: doc.data().name,
          students: doc.data().students.length,
        }));
        setClassData(classChartData);

        setStats({
          students: studentsSnapshot.size,
          teachers: teachersSnapshot.size,
          classes: classesSnapshot.size,
          pendingFees: 0, // Placeholder
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
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
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Students" value={stats.students} icon="👨‍🎓" color="bg-blue-500" />
        <StatCard title="Teachers" value={stats.teachers} icon="👨‍🏫" color="bg-green-500" />
        <StatCard title="Classes" value={stats.classes} icon="🏫" color="bg-yellow-500" />
        <StatCard
          title="Pending Fees"
          value={`₦${stats.pendingFees.toLocaleString()}`}
          icon="💰"
          color="bg-red-500"
        />
      </div>

      {/* Class Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Student Distribution by Class</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            title="Promote Classes"
            icon="⬆️"
            href="#"
            onClick={() => alert('This feature will promote all students to the next class for the new academic year.')}
          />
          <QuickActionButton
            title="Add Student"
            icon="➕"
            href="/dashboard/students/new"
          />
          <QuickActionButton
            title="Record Payment"
            icon="💳"
            href="/dashboard/fees/new"
          />
          <QuickActionButton
            title="Enter Results"
            icon="📝"
            href="/dashboard/results/new"
          />
        </div>
      </div>
    </div>
  );
}

// ... (StatCard and QuickActionButton components remain the same)

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

// Quick Action Button Component
function QuickActionButton({ title, icon, href }: { title: string; icon: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
    >
      <span className="mr-2 text-xl">{icon}</span>
      <span className="font-medium">{title}</span>
    </a>
  );
}
