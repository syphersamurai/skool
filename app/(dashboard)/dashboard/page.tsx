'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    pendingFees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // This is a simplified example - in a real app, you would fetch actual data
        // based on the user's role and permissions

        // For demo purposes, we'll just set some placeholder stats
        setStats({
          students: 120,
          teachers: 15,
          classes: 6,
          pendingFees: 25000,
        });

        // In a real implementation, you would fetch data from Firestore like this:
        // const studentsSnapshot = await getDocs(collection(db, 'students'));
        // const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        // setStats({
        //   students: studentsSnapshot.size,
        //   teachers: teachersSnapshot.size,
        //   ...
        // });
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
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            title="New Student Registration"
            description="John Doe was registered in Basic 3"
            time="2 hours ago"
          />
          <ActivityItem
            title="Fee Payment"
            description="₦15,000 paid for Mary Johnson"
            time="Yesterday"
          />
          <ActivityItem
            title="Exam Results Published"
            description="2nd Term results for Basic 5 are now available"
            time="3 days ago"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

// Activity Item Component
function ActivityItem({ title, description, time }: { title: string; description: string; time: string }) {
  return (
    <div className="flex items-start">
      <div className="bg-indigo-100 rounded-full p-2 mr-4">
        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
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