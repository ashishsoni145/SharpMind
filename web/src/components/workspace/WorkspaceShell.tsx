'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useProtectedRoute } from '@/lib/auth/use-protected-route';
import { studentProfileAdapter } from '@/lib/adapters/student';
import type { StudentProfile } from '@/lib/types/onboarding';
import { getApiClient } from '@/lib/api';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { NotificationsDrawer } from './NotificationsDrawer';
import styles from './WorkspaceShell.module.css';

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const { user, isLoading, isAuthenticated, adapterName } = useAuth();
  const router = useRouter();
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
        if (active) setProfileSetupState('failed');
      }
    };

    void checkProfileSetup();
    return () => {
      active = false;
    };
  }, [adapterName, isAuthenticated, isLoading, router, user]);

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
    return (
      <div className={styles.loadingScreen} role="status" aria-live="polite">
        <div className={styles.spinner} />
        <p>Restoring SharpMind workspace...</p>
      </div>
    );
  }

  if (profileSetupState === 'checking') {
    return (
      <div className={styles.loadingScreen} role="status" aria-live="polite">
        <div className={styles.spinner} />
        <p>Checking your profile setup...</p>
      </div>
    );
  }

  if (profileSetupState === 'failed') {
    return (
      <div className={styles.loadingScreen} role="alert">
        <p>We could not confirm your profile setup. Please try again or complete your profile.</p>
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

        {!user.isEmailVerified && (
          <aside className={styles.verificationNotice} role="alert" aria-live="polite">
            <div className={styles.noticeContent}>
              <span className={styles.noticeIcon} aria-hidden="true">
                ⚠️
              </span>
              <span className={styles.noticeText}>
                <strong>Email verification required:</strong> Please verify your email address ({user.email}) within 7 days of signup to ensure continuous access to AI tutoring and study features.
              </span>
            </div>
            <Link
              href={`/verify-email?email=${encodeURIComponent(user.email)}`}
              className={styles.noticeActionBtn}
            >
              Verify Email &rarr;
            </Link>
          </aside>
        )}

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
