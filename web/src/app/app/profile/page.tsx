'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { settingsAdapter } from '@/lib/adapters/settings';
import type { UserSettings } from '@/lib/types/settings';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import styles from './profile.module.css';

const CLASS_OPTIONS = [
  { value: 'class_11', label: 'Class 11', subtext: 'Senior Secondary Year 1' },
  { value: 'class_12', label: 'Class 12', subtext: 'Board Examination Year' },
  { value: 'dropper', label: 'Dropper', subtext: 'Full-Time Repeater' },
];

const BOARD_OPTIONS = [
  { value: 'cbse', label: 'CBSE (Central Board of Secondary Education)' },
  { value: 'icse', label: 'ICSE / ISC' },
  { value: 'state_board', label: 'State Higher Secondary Board' },
  { value: 'other', label: 'Other / International Board' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('class_11');
  const [board, setBoard] = useState('cbse');

  // Password fields
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Save profile status
  const [isSaving, setIsSaving] = useState(false);

  const userId = user?.id || '';

  const loadData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const settingsData = await settingsAdapter.getSettings(id);

      const initialName = user?.fullName || settingsData.name || '';
      const initialEmail = user?.email || settingsData.email || '';
      const initialUsername = settingsData.username || (user?.email ? user.email.split('@')[0] : 'learner');

      const activeGrade = settingsData.academicProfile.grade || 'class_11';
      const activeBoard = settingsData.academicProfile.board || 'cbse';

      setName(initialName);
      setUsername(initialUsername);
      setEmail(initialEmail);
      setGrade(activeGrade);
      setBoard(activeBoard);

      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      loadData(userId);
    }
  }, [userId, loadData]);

  // Handle Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      // 1. Update basic profile info (name, username)
      await settingsAdapter.updateProfile(userId, {
        name: name.trim(),
        username: sanitizedUsername,
      });

      // 2. Update academic setup (grade, board)
      const selectedBoard = grade === 'dropper' ? '' : board;
      await settingsAdapter.updateAcademicProfile(userId, {
        grade,
        board: selectedBoard,
      });

      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      console.error('Failed to save profile changes:', err);
      showToast(err instanceof Error ? err.message : 'Could not save profile changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      showToast('Current password is required to change your password.', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await settingsAdapter.changePassword(userId, currentPassword, newPassword);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('An unexpected error occurred while updating password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : user?.email ? user.email.slice(0, 2) : 'AS';

  const isDropper = grade === 'dropper';

  return (
    <WorkspaceShell>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar} aria-hidden="true">
              {initials}
            </div>
            <div className={styles.titleArea}>
              <h1 className={styles.title}>{name || 'Student Profile'}</h1>
              <p className={styles.subtitle}>{email}</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading your profile details...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Identity & Account Card */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>
                    <Icon name="user" size="sm" />
                    Student Identity
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Your personal name, username handle, and primary account email.
                  </p>
                </div>
              </div>

              <div className={styles.gridTwo}>
                {/* Full Name */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="profile-name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                  <span className={styles.helpText}>Visible on student model and progress diagnostics</span>
                </div>

                {/* Username */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="profile-username" className={styles.label}>
                    Username
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>@</span>
                    <input
                      id="profile-username"
                      type="text"
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                      value={username}
                      minLength={3}
                      maxLength={24}
                      pattern="[a-zA-Z0-9_]{3,24}"
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <span className={styles.helpText}>Unique alphanumeric identifier</span>
                </div>
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label htmlFor="profile-email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="profile-email"
                    type="email"
                    className={styles.input}
                    value={email}
                    disabled
                  />
                  <span className={styles.verifiedBadge}>
                    <Icon name="check" size="xs" /> Verified
                  </span>
                </div>
                <span className={styles.helpText}>Managed through authenticated session</span>
              </div>
            </section>

            {/* Academic Class & Board Card */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>
                    <Icon name="classroom" size="sm" />
                    Academic Class & Board
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Select your current academic standard and examination board.
                  </p>
                </div>
              </div>

              {/* Current Class */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Current Class</label>
                <div className={styles.classGrid} role="radiogroup" aria-label="Current Class">
                  {CLASS_OPTIONS.map((opt) => {
                    const isSelected = grade === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${styles.classBtn} ${isSelected ? styles.classBtnActive : ''}`}
                        onClick={() => setGrade(opt.value)}
                        disabled={isSaving}
                      >
                        <span>{opt.label}</span>
                        <span className={styles.classSubtext}>{opt.subtext}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Education Board — Shown ONLY if Class 11 or 12, hidden for Dropper */}
              {!isDropper && (
                <div className={styles.fieldGroup}>
                  <label htmlFor="profile-board" className={styles.label}>
                    Education Board
                  </label>
                  <select
                    id="profile-board"
                    className={styles.select}
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    disabled={isSaving}
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <span className={styles.helpText}>Syllabus blueprint aligned with state or national curriculum</span>
                </div>
              )}
            </section>

            {/* Theme Toggle Card */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>
                    <Icon name={resolvedTheme === 'dark' ? 'moon' : 'sun'} size="sm" />
                    Interface Theme
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Toggle between dark engineering mode and high-contrast light mode.
                  </p>
                </div>
              </div>

              <div className={styles.themeToggleGroup}>
                <button
                  type="button"
                  className={`${styles.themeBtn} ${resolvedTheme === 'dark' ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme('dark')}
                  aria-pressed={resolvedTheme === 'dark'}
                >
                  <Icon name="moon" size="sm" />
                  <span>Dark Mode</span>
                </button>

                <button
                  type="button"
                  className={`${styles.themeBtn} ${resolvedTheme === 'light' ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme('light')}
                  aria-pressed={resolvedTheme === 'light'}
                >
                  <Icon name="sun" size="sm" />
                  <span>Light Mode</span>
                </button>
              </div>
            </section>

            {/* Save Profile Button Row */}
            <div className={styles.actionsRow}>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                <Icon name="check" size="xs" />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Password & Security Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <Icon name="lock" size="sm" />
                Password & Security
              </h2>
              <p className={styles.cardSubtitle}>
                Update your account password. You can change your password only if you know your current password.
              </p>
            </div>
            <button
              type="button"
              className={styles.passwordTriggerBtn}
              onClick={() => {
                setIsPasswordDrawerOpen((prev) => !prev);
              }}
              aria-expanded={isPasswordDrawerOpen}
            >
              <Icon name="lock" size="xs" />
              <span>{isPasswordDrawerOpen ? 'Close' : 'Change Password'}</span>
            </button>
          </div>

          {isPasswordDrawerOpen && (
            <form className={styles.passwordDrawer} onSubmit={handlePasswordSubmit}>
              {/* Current Password */}
              <div className={styles.fieldGroup}>
                <label htmlFor="current-password" className={styles.label}>
                  Current Password (Required)
                </label>
                <input
                  id="current-password"
                  type="password"
                  className={styles.input}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isUpdatingPassword}
                  autoComplete="current-password"
                />
                <span className={styles.helpText}>Verified against your active authentication vault</span>
              </div>

              <div className={styles.gridTwo}>
                {/* New Password */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="new-password" className={styles.label}>
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className={styles.input}
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isUpdatingPassword}
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm New Password */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="confirm-password" className={styles.label}>
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className={styles.input}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isUpdatingPassword}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.updatePassBtn}
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                <Icon name="lock" size="xs" />
                {isUpdatingPassword ? 'Verifying & Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
