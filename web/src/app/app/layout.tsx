import { Suspense } from 'react';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { WorkspaceLoadingSkeleton } from '@/components/workspace/WorkspaceLoadingSkeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell>
      <Suspense fallback={<WorkspaceLoadingSkeleton label="Loading workspace page..." contentOnly />}>
        {children}
      </Suspense>
    </WorkspaceShell>
  );
}
