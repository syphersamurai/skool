'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render anything
  // (will be redirected by the useEffect)
  if (!user) {
    return null;
  }

  // Navigation items based on user role
  const navigationItems = getNavigationItems(user.role);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Skool</h2>
          <p className="text-sm opacity-75">{user.role}</p>
        </div>
        <nav className="mt-8">
          <ul>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 ${isActive ? 'bg-indigo-900' : 'hover:bg-indigo-700'}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Sign out
            </button>
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
      label: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️',
      roles: ['super_admin', 'school_admin'],
    },
  ];

  // Filter items based on user role
  return items.filter((item) => item.roles.includes(role));
}