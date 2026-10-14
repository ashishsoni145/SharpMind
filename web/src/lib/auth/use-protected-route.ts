'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';

interface UseProtectedRouteOptions {
  requireAuth?: boolean; // If true, redirect to login when unauthenticated. If false, redirect to app when authenticated.
  redirectTo?: string;
}

export function useProtectedRoute({
  requireAuth = true,
  redirectTo,
}: UseProtectedRouteOptions = {}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const searchStr = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(searchStr);

    if (requireAuth && !isAuthenticated) {
      const currentFullUrl = pathname + (searchStr ? searchStr : '');
      const target = redirectTo || `/login?redirectTo=${encodeURIComponent(currentFullUrl)}`;
      router.replace(target);
    } else if (!requireAuth && isAuthenticated) {
      const redirectParam = params.get('redirectTo');
      const target = redirectTo || (redirectParam ? decodeURIComponent(redirectParam) : '/app');
      router.replace(target);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, pathname]);

  return { isAuthenticated, isLoading, user };
}
