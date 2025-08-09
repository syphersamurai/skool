import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK for server-side auth verification
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: '/dashboard',
    roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
  },
  {
    path: '/dashboard/admin',
    roles: ['super_admin', 'school_admin'],
  },
  {
    path: '/dashboard/teacher',
    roles: ['super_admin', 'school_admin', 'teacher'],
  },
  {
    path: '/dashboard/parent',
    roles: ['super_admin', 'school_admin', 'parent'],
  },
  {
    path: '/dashboard/student',
    roles: ['super_admin', 'school_admin', 'student'],
  },
];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';
  const pathname = request.nextUrl.pathname;

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route.path)
  );

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For protected routes, verify the session
  if (!session) {
    return redirectToLogin(request);
  }

  try {
    // Verify the session cookie
    const decodedClaims = await getAuth().verifySessionCookie(session, true);
    
    // Get the user's role from the claims
    const userRole = decodedClaims.role || 'parent';
    
    // Check if the user has permission to access this route
    const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
    
    if (matchedRoute && !matchedRoute.roles.includes(userRole)) {
      // User doesn't have the required role
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // User is authenticated and authorized
    return NextResponse.next();
  } catch (error) {
    // Invalid session cookie
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirectTo', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside public)
     * 4. /examples (inside public)
     * 5. all root files inside public (e.g. /favicon.ico)
     */
    '/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)',
  ],
};