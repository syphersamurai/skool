import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import Notifications from '@/components/Notifications';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

  // ... (useEffect for redirect remains the same)

  // ... (loading and !user checks remain the same)

  // ... (getNavigationItems remains the same)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ... (Sidebar remains the same) ... */}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {showNotifications && <Notifications />}
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

// Helper function to get navigation items based on user role
function getNavigationItems(role: string) {
  const items = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: '📊',
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
    },
    {
      label: 'Students',
      href: '/dashboard/students',
      icon: '👨‍🎓',
      roles: ['super_admin', 'school_admin', 'teacher'],
    },
    {
      label: 'Teachers',
      href: '/dashboard/teachers',
      icon: '👨‍🏫',
      roles: ['super_admin', 'school_admin'],
    },
    {
      label: 'Classes',
      href: '/dashboard/classes',
      icon: '🏫',
      roles: ['super_admin', 'school_admin', 'teacher'],
    },
    {
      label: 'Results',
      href: '/dashboard/results',
      icon: '📝',
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
    },
    {
      label: 'Fees',
      href: '/dashboard/fees',
      icon: '💰',
      roles: ['super_admin', 'school_admin', 'parent'],
    },
    {
      label: 'Payments',
      href: '/dashboard/payments',
      icon: '💳',
      roles: ['super_admin', 'school_admin', 'parent'],
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: '📅',
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: '👤',
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️',
      roles: ['super_admin', 'school_admin'],
    },
  ];

  // Filter items based on user role
  return items.filter((item) => item.roles.includes(role));
}