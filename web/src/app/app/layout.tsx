import { Suspense } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-400">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/10 border-t-white" aria-hidden="true" />
            <p className="font-mono text-sm">
              Loading SharpMind Workspace...
            </p>
          </div>
        }
      >
      {children}
    </Suspense>
  );
}
