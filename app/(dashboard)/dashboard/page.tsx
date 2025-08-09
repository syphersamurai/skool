'use client';

import { useAuth, UserRole } from '@/lib/auth';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in.</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.SCHOOL_ADMIN:
        return <AdminDashboard />;
      case UserRole.TEACHER:
        return <TeacherDashboard />;
      case UserRole.PARENT:
        return <ParentDashboard />;
      case UserRole.STUDENT:
        return <StudentDashboard />;
      default:
        return <div>Welcome!</div>;
    }
  };

  return <div>{renderDashboard()}</div>;
}
