'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useProtectedRoute } from '@/lib/auth/use-protected-route';
import { studentProfileAdapter } from '@/lib/adapters/student';
import type { StudentProfile } from '@/lib/types/onboarding';
import { getApiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';
import { WorkspaceLoadingSkeleton } from './WorkspaceLoadingSkeleton';
import styles from './WorkspaceShell.module.css';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const { user, isLoading, isAuthenticated, adapterName } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileSetupState, setProfileSetupState] = useState<'checking' | 'ready' | 'failed'>('checking');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Enforce authentication on all workspace views
  useProtectedRoute({ requireAuth: true });

  // Enforce the one-time required student profile step on every workspace entry.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    if (user.role !== 'student') {
      setProfileSetupState('ready');
      return;
    }

    let active = true;
    setProfileSetupState('checking');

    const checkProfileSetup = async () => {
      try {
        let isComplete = false;
        if (adapterName === 'LocalAuthAdapter') {
          const localProfile = await studentProfileAdapter.getProfile(user.id);
          isComplete = Boolean(localProfile?.onboardingStatus.isCompleted);
        } else {
          const studentProfile = (await getApiClient().users.getStudentProfile()) as
            | { profileSetupCompleted?: boolean }
            | null;
          isComplete = Boolean(studentProfile?.profileSetupCompleted);
        }

        if (!active) return;
        if (isComplete) {
          setProfileSetupState('ready');
        } else {
          router.replace('/complete-profile');
        }
      } catch {
        if (active) {
          setProfileSetupState('failed');
          showToast('We could not confirm your profile setup. Please complete the required setup to continue.', 'error', {
            label: 'Complete profile',
            onClick: () => router.push('/complete-profile'),
          });
        }
      }
    };

    void checkProfileSetup();
    return () => {
      active = false;
    };
  }, [adapterName, isAuthenticated, isLoading, router, showToast, user]);

  useEffect(() => {
    if (!isLoading && user?.role === 'student' && !user.isEmailVerified) {
      showToast(`Please verify ${user.email} to unlock all study features.`, 'warning', {
        label: 'Verify email',
        onClick: () => router.push(`/verify-email?email=${encodeURIComponent(user.email)}`),
      });
    }
  }, [isLoading, router, showToast, user]);

  // Restore sidebar collapse preference from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sharpmind_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch student profile for academic context
  useEffect(() => {
    if (user?.id) {
      studentProfileAdapter.getProfile(user.id).then((p) => setProfile(p));
    }
  }, [user?.id]);

  // Global Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sharpmind_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  if (isLoading || !isAuthenticated || !user) {
    return <WorkspaceLoadingSkeleton label="Restoring SharpMind workspace..." />;
  }

  if (profileSetupState === 'checking') {
    return <WorkspaceLoadingSkeleton label="Checking your profile setup..." />;
  }

  if (profileSetupState === 'failed') {
    return (
      <div className={styles.loadingScreen}>
        <Link href="/complete-profile">Continue to profile setup</Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className={`${styles.mainColumn} ${isCollapsed ? styles.collapsed : ''}`}>
        <TopBar
          profile={profile}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggleCollapse={handleToggleCollapse}
        />

        <main id="workspace-content" className={styles.contentWrapper}>
          {children}
        </main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
