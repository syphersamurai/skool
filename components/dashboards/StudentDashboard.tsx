'use client';

import { useAuth } from '@/lib/auth';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
      <p>Welcome, {user?.name}!</p>
      {/* Add student-specific components here, e.g., view results, attendance */}
    </div>
  );
}
