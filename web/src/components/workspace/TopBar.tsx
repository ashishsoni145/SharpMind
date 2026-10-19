'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { StudentProfile } from '@/lib/types/onboarding';
import { Icon } from '@/components/ui/Icon';
import styles from './TopBar.module.css';

interface TopBarProps {
  profile: StudentProfile | null;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onToggleCollapse?: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/app': 'AI Next Action',
  '/app/classroom': 'Classroom Stream',
  '/app/library': 'Curriculum Library',
  '/app/tutor': 'AI Academic Tutor',
  '/app/planner': 'Study Planner',
  '/app/analytics': 'Analytics & Velocity',
  '/app/upgrade': 'SharpMind Pro',
  '/app/profile': 'Student Profile',
  '/profile': 'Student Profile',
};

export function TopBar({
  profile,
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileMenu,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentTitle = ROUTE_TITLES[pathname] || 'Workspace';

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle state for menu button animation: on mobile reflects isMobileOpen; on desktop reflects !isCollapsed
  const isMenuCross = isMobile ? Boolean(isMobileOpen) : !isCollapsed;

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      onToggleMobileMenu();
    } else if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'U';

  const academicTag = profile
    ? profile.academicProfile.grade === 'dropper'
      ? 'Dropper'
      : `${(profile.academicProfile.board || 'CBSE').toUpperCase()} ${profile.academicProfile.grade.replace('class_', '')}th`
    : 'Identity Pending';

  return (
    <header className={styles.topBar}>
      <div className={styles.leftArea}>
        <button
          type="button"
          className={`${styles.animatedMenuBtn} ${isMenuCross ? styles.cross : ''}`}
          onClick={handleMenuClick}
          aria-label={
            isMobile
              ? isMobileOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
              : !isCollapsed
                ? 'Collapse navigation sidebar'
                : 'Expand navigation sidebar'
          }
          aria-expanded={isMobile ? isMobileOpen : !isCollapsed}
          title={
            isMobile
              ? isMobileOpen
                ? 'Close menu'
                : 'Open menu'
              : !isCollapsed
                ? 'Collapse menu'
                : 'Expand menu'
          }
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>

        <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}>
          <Link href="/app" className={styles.crumbRoot}>
            Workspace
          </Link>
          <span className={styles.crumbSeparator}>/</span>
          <span className={styles.crumbActive}>{currentTitle}</span>
        </nav>
      </div>

      <div className={styles.centerArea}>
        <button
          type="button"
          className={styles.searchBtn}
          onClick={onOpenSearch}
          aria-label="Quick search or jump to module"
        >
          <Icon name="search" size="sm" />
          <span>Search or jump to...</span>
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </button>
      </div>

      <div className={styles.rightArea}>
        <Link href="/app/profile" className={styles.academicPill} title="View and Edit Profile">
          <span className={styles.pulseDot} aria-hidden="true" />
          <span>{academicTag}</span>
        </Link>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={onOpenNotifications}
          aria-label="View notifications"
          title="Notifications"
        >
          <Icon name="bell" size="sm" />
          <span className={styles.unreadDot} aria-hidden="true" />
        </button>

        <div className={styles.userMenuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.userMenuBtn}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className={styles.avatar} aria-hidden="true">
              {initials}
            </div>
            <span className={styles.userName}>{user?.fullName?.split(' ')[0] || 'Learner'}</span>
            <Icon name="chevronDown" size="xs" style={{ color: 'var(--color-text-tertiary)' }} />
          </button>

          {isUserMenuOpen && (
            <div className={styles.menuDropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{user?.fullName}</div>
                <div className={styles.dropdownEmail}>{user?.email}</div>
                <span className={styles.dropdownRole}>{user?.role}</span>
              </div>

              <Link
                href="/app/profile"
                className={styles.dropdownItem}
                onClick={() => setIsUserMenuOpen(false)}
                role="menuitem"
              >
                <Icon name="user" size="sm" />
                <span>Profile</span>
              </Link>
              <Link
                href="https://sharpmind.live"
                className={styles.dropdownItem}
                onClick={() => setIsUserMenuOpen(false)}
                role="menuitem"
              >
                <Icon name="externalLink" size="sm" />
                <span>Public Homepage</span>
              </Link>
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.danger}`}
                onClick={handleSignOut}
                role="menuitem"
              >
                <Icon name="logout" size="sm" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
