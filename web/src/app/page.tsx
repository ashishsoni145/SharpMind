'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLoadingSkeleton } from '@/components/workspace/WorkspaceLoadingSkeleton';
import { useAuth } from '@/lib/auth/auth-context';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/app' : '/login');
    }
  }, [isLoading, router, user]);

  return <WorkspaceLoadingSkeleton label="Opening SharpMind..." />;
}
