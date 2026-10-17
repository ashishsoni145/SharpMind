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
  useProtectedRoute({ requireAuth: true });

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gradeId, setGradeId] = useState<(typeof CLASS_OPTIONS)[number]['value'] | ''>('');
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        setErrorMessage('We could not check your saved profile. You can still submit these details.');
        setUsername(user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24));
        setIsChecking(false);
      }
    };

    void checkProfileSetup();
    return () => {
      active = false;
    };
  }, [adapterName, isLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    if (cleanName.length < 2 || cleanName.length > 100) {
      setErrorMessage('Enter a name between 2 and 100 characters.');
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      setErrorMessage('Username must be 3–24 characters using letters, numbers, and underscores.');
      return;
    }
    if (!gradeId) {
      setErrorMessage('Select your current class to continue.');
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

      setStatusMessage('Your profile is saved. Opening your dashboard…');
      router.replace('/app');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your profile. Please try again.');
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

        {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}
        {statusMessage && <div className={styles.status} role="status">{statusMessage}</div>}

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
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              aria-describedby="username-hint"
              required
            />
            <small id="username-hint">3–24 letters, numbers, or underscores. Usernames are unique.</small>
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
