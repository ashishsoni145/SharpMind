'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useProtectedRoute } from '@/lib/auth/use-protected-route';
import { api } from '@/lib/api';
import { settingsAdapter } from '@/lib/adapters/settings';
import { studentProfileAdapter } from '@/lib/adapters/student';
import type { StudentProfile } from '@/lib/types/onboarding';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import styles from './page.module.css';

const CLASS_OPTIONS = [
  { value: 'class_11', label: 'Class 11' },
  { value: 'class_12', label: 'Class 12' },
  { value: 'dropper', label: 'Dropper' },
] as const;

function makeLocalProfile(userId: string, fullName: string, gradeId: string): StudentProfile {
  const now = new Date().toISOString();
  return {
    id: `profile-${userId}`,
    userId,
    fullName,
    academicProfile: { grade: gradeId, board: '', academicYear: '', enrolledSubjects: [] },
    targetExams: [],
    readinessBaseline: {
      currentPreparationLevel: 'beginner',
      selfAssessedStrengths: [],
      selfAssessedFocusAreas: [],
    },
    studyPreferences: {
      dailyAvailableHours: 3,
      preferredStudyTime: 'evening',
      learningStylePreference: 'problem_solving_first',
      reminderPreferences: { email: true, dailyGoalPrompt: true },
    },
    onboardingStatus: { currentStep: 1, isCompleted: false, nextAction: 'take_diagnostic' },
    knowledgeModelAttachment: { status: 'pending_initial_diagnostic' },
    createdAt: now,
    updatedAt: now,
  };
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, isLoading, adapterName } = useAuth();
  const { showToast } = useToast();
  useProtectedRoute({ requireAuth: true });

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gradeId, setGradeId] = useState<(typeof CLASS_OPTIONS)[number]['value'] | ''>('');
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'failed'>('idle');

  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase();
    if (adapterName === 'LocalAuthAdapter' || !/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      setUsernameStatus('idle');
      return;
    }

    let active = true;
    setUsernameStatus('checking');
    const timer = window.setTimeout(async () => {
      try {
        const available = await api.users.checkUsernameAvailability(cleanUsername);
        if (active) setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        if (active) setUsernameStatus('failed');
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [adapterName, username]);

  useEffect(() => {
    if (isLoading || !user) return;

    setFullName(user.fullName || '');
    if (user.role !== 'student') {
      router.replace('/app');
      return;
    }

    let active = true;
    const checkProfileSetup = async () => {
      try {
        let isComplete: boolean;
        if (adapterName === 'LocalAuthAdapter') {
          const localProfile = await studentProfileAdapter.getProfile(user.id);
          isComplete = Boolean(localProfile?.onboardingStatus.isCompleted);
        } else {
          const remoteProfile = (await api.users.getStudentProfile()) as
            | { profileSetupCompleted?: boolean }
            | null;
          isComplete = Boolean(remoteProfile?.profileSetupCompleted);
        }

        if (!active) return;
        if (isComplete) {
          router.replace('/app');
          return;
        }

        const initialUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
        setUsername(initialUsername);
        setIsChecking(false);
      } catch {
        if (!active) return;
        showToast('We could not check your saved profile. Please retry, then continue setup.', 'error');
        setUsername(user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24));
        setIsChecking(false);
      }
    };

    void checkProfileSetup();
    return () => {
      active = false;
    };
  }, [adapterName, isLoading, router, showToast, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    if (cleanName.length < 2 || cleanName.length > 100) {
      showToast('Enter a name between 2 and 100 characters.', 'error');
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      showToast('Username must be 3–24 characters using letters, numbers, and underscores.', 'error');
      return;
    }
    if (usernameStatus === 'taken') {
      showToast('Username already taken. Please choose another.', 'error');
      return;
    }
    if (adapterName !== 'LocalAuthAdapter') {
      try {
        if (!(await api.users.checkUsernameAvailability(cleanUsername))) {
          setUsernameStatus('taken');
          showToast('Username already taken. Please choose another.', 'error');
          return;
        }
      } catch {
        showToast('Could not check username availability. Please try again.', 'error');
        return;
      }
    }
    if (!gradeId) {
      showToast('Select your current class to continue.', 'error');
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      if (adapterName === 'LocalAuthAdapter') {
        await settingsAdapter.updateProfile(user.id, { name: cleanName, username: cleanUsername });
        const existing = await studentProfileAdapter.getProfile(user.id);
        await studentProfileAdapter.completeOnboarding(
          user.id,
          existing
            ? {
                ...existing,
                fullName: cleanName,
                academicProfile: { ...existing.academicProfile, grade: gradeId },
              }
            : makeLocalProfile(user.id, cleanName, gradeId)
        );
      } else {
        await api.onboarding.completeSignupProfile({
          fullName: cleanName,
          username: cleanUsername,
          gradeId,
        });
      }

      showToast('Your profile is saved. Opening your dashboard…', 'success');
      router.replace('/app');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save your profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user || isChecking) {
    return (
      <main className={styles.page}>
        <div className={styles.dialog} role="status">Loading your account details…</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="profile-setup-title">
        <div className={styles.eyebrow}>One-time setup</div>
        <h1 id="profile-setup-title" className={styles.title}>Complete your profile</h1>
        <p className={styles.description}>Add these details once to continue to your SharpMind dashboard.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field} htmlFor="profile-name">
            <span>Name</span>
            <input
              id="profile-name"
              name="fullName"
              autoComplete="name"
              value={fullName}
              maxLength={100}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

          <label className={styles.field} htmlFor="profile-username">
            <span>Username</span>
            <input
              id="profile-username"
              name="username"
              autoComplete="username"
              value={username}
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]{3,24}"
              onChange={(event) => {
                setUsername(event.target.value.toLowerCase());
                setUsernameStatus('idle');
              }}
              aria-describedby="username-hint"
              required
            />
            <small id="username-hint">3–24 letters, numbers, or underscores. Usernames are unique.</small>
            {usernameStatus !== 'idle' && (
              <small
                className={usernameStatus === 'available' ? styles.usernameAvailable : usernameStatus === 'taken' || usernameStatus === 'failed' ? styles.usernameUnavailable : styles.usernameChecking}
                role={usernameStatus === 'taken' || usernameStatus === 'failed' ? 'status' : 'status'}
                aria-live="polite"
              >
                {usernameStatus === 'checking' && 'Checking username…'}
                {usernameStatus === 'available' && 'Username is available'}
                {usernameStatus === 'taken' && 'Username already taken'}
                {usernameStatus === 'failed' && 'Could not check username availability'}
              </small>
            )}
          </label>

          <label className={styles.field} htmlFor="profile-email">
            <span>Email</span>
            <input id="profile-email" type="email" value={user.email} disabled readOnly />
          </label>

          <label className={styles.field} htmlFor="profile-grade">
            <span>Class</span>
            <select
              id="profile-grade"
              name="gradeId"
              value={gradeId}
              onChange={(event) => setGradeId(event.target.value as typeof gradeId)}
              required
            >
              <option value="" disabled>Select your class</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isSaving} disabled={isSaving}>
            Save and continue
          </Button>
        </form>
      </section>
    </main>
  );
}
