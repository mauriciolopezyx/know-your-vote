'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

// List of public routes that don't require authentication
const publicRoutes = [
  '/login', 
  '/register', 
  '/verify-email', 
  '/reset-password', 
  '/update-password',
  '/auth/callback'  // IMPORTANT: This must be public
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // CRITICAL: Don't redirect if we're on the auth callback page
    // Let the callback page handle the authentication flow
    if (pathname === '/auth/callback') {
      return;
    }

    // Skip check if still loading or on a public route
    if (isLoading || publicRoutes.includes(pathname)) return;

    // If no user is logged in and we're not on a public route, redirect to login
    if (!user) {
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  // CRITICAL: Always render children immediately on the callback page
  // to prevent any redirects that would lose the hash fragment
  if (pathname === '/auth/callback') {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // If on a public route or user is authenticated, render children
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}