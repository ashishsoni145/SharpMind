'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { createVerificationPageUrl } from '@/lib/auth/verification-route';
import { useProtectedRoute } from '@/lib/auth/use-protected-route';
import { getApiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/lib/types/auth';
import styles from './page.module.css';

function SignupForm() {
  const router = useRouter();
  useProtectedRoute({ requireAuth: false });

  const { signUp, isLoading, adapterName } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailAvailability, setEmailAvailability] = useState<'idle' | 'checking' | 'taken'>('idle');
  const [isProcessingSignup, setIsProcessingSignup] = useState(false);
  const lastNotifiedEmail = useRef('');

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (adapterName === 'LocalAuthAdapter' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailAvailability('idle');
      return;
    }

    let active = true;
    setEmailAvailability('checking');
    const timer = window.setTimeout(async () => {
      try {
        const available = await api.auth.checkEmailAvailability(normalizedEmail);
        if (!active) return;
        setEmailAvailability(available ? 'idle' : 'taken');
        if (!available && lastNotifiedEmail.current !== normalizedEmail) {
          lastNotifiedEmail.current = normalizedEmail;
          showToast('An account already exists with this email. Sign in or use a different email.', 'error');
        }
      } catch {
        if (active) setEmailAvailability('idle');
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [adapterName, email, showToast]);

  // Password criteria computation
  const criteria = useMemo(() => {
    return {
      length: password.length >= 8,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (criteria.length) score += 1;
    if (criteria.mixedCase) score += 1;
    if (criteria.number) score += 1;
    if (criteria.special) score += 1;
    return score;
  }, [criteria]);

  const strengthInfo = useMemo(() => {
    switch (strengthScore) {
      case 0:
        return { label: 'Empty', color: 'transparent', width: '0%' };
      case 1:
        return { label: 'Weak', color: '#ef4444', width: '25%' };
      case 2:
        return { label: 'Fair', color: '#f59e0b', width: '50%' };
      case 3:
        return { label: 'Good', color: '#6366f1', width: '75%' };
      case 4:
        return { label: 'Strong', color: '#10b981', width: '100%' };
      default:
        return { label: '', color: 'transparent', width: '0%' };
    }
  }, [strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (emailAvailability === 'taken') {
      showToast('An account already exists with this email. Sign in or use a different email.', 'error');
      return;
    }
    if (adapterName !== 'LocalAuthAdapter') {
      try {
        if (!(await api.auth.checkEmailAvailability(normalizedEmail))) {
          setEmailAvailability('taken');
          showToast('An account already exists with this email. Sign in or use a different email.', 'error');
          return;
        }
      } catch {
        showToast('We could not check this email right now. Please try again.', 'error');
        return;
      }
    }
    if (strengthScore < 3) {
      showToast('Please create a stronger password meeting the requirements.', 'error');
      return;
    }
    if (!termsAccepted) {
      showToast('You must accept the Terms of Service and Privacy Policy to continue.', 'error');
      return;
    }

    setIsProcessingSignup(true);
    try {
      const res = await signUp({
        fullName,
        email: normalizedEmail,
        password,
        role,
        termsAccepted,
      });

      if (!res.success) {
        showToast(res.error?.code === 'email_already_in_use'
          ? 'An account already exists with this email. Sign in or use a different email.'
          : res.error?.message || 'Could not create account. Please try again.', 'error');
        return;
      }

      let welcomeEmailUnavailable = !res.user?.id;
      if (res.user?.id) {
        try {
          const response = await fetch(`${getApiBaseUrl()}/auth/welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: res.user.id }),
          });
          const result = await response.json().catch(() => null);
          welcomeEmailUnavailable = !response.ok || result?.success !== true;
        } catch {
          welcomeEmailUnavailable = true;
        }
      }

      // Supabase signUp already dispatched the first confirmation OTP. Open the
      // code form directly so Continue cannot immediately send a second code.
      const verificationUrl = new URL(createVerificationPageUrl(normalizedEmail, adapterName !== 'LocalAuthAdapter'), window.location.origin);
      if (welcomeEmailUnavailable) verificationUrl.searchParams.set('welcomeEmail', 'unavailable');
      router.push(`${verificationUrl.pathname}${verificationUrl.search}`);
    } catch {
      showToast('We could not confirm the signup response. Please try signing in or request a verification code before creating another account.', 'error');
    } finally {
      setIsProcessingSignup(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>Join SharpMind and start your adaptive learning loop</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Role Selector */}
        <div className={styles.roleGroup}>
          <label className={styles.roleLabel}>I am a:</label>
          <div className={styles.roleButtons} role="radiogroup" aria-label="Account role">
            <button
              type="button"
              role="radio"
              aria-checked={role === 'student'}
              className={`${styles.roleBtn} ${role === 'student' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('student')}
            >
              <span className={styles.roleIcon}>🎓</span>
              <span className={styles.roleText}>Student</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === 'parent'}
              className={`${styles.roleBtn} ${role === 'parent' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('parent')}
            >
              <span className={styles.roleIcon}>👨‍👩‍👧</span>
              <span className={styles.roleText}>Parent</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === 'teacher'}
              className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('teacher')}
            >
              <span className={styles.roleIcon}>👩‍🏫</span>
              <span className={styles.roleText}>Educator</span>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          id="signup-name"
          autoComplete="name"
          placeholder="e.g. Aarav Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          aria-required="true"
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          id="signup-email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailAvailability('idle');
          }}
          helperText={emailAvailability === 'checking' ? 'Checking whether this email is available…' : undefined}
          required
          aria-required="true"
        />

        <div className={styles.passwordWrapper}>
          <Input
            label="Create Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="signup-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Live Password Strength Meter */}
        {password && (
          <div className={styles.strengthMeter}>
            <div className={styles.strengthBarContainer}>
              <div
                className={styles.strengthBar}
                style={{
                  width: strengthInfo.width,
                  backgroundColor: strengthInfo.color,
                }}
              />
            </div>
            <div className={styles.strengthText}>Strength: {strengthInfo.label}</div>
            <ul className={styles.criteriaList}>
              <li
                className={`${styles.criteriaItem} ${
                  criteria.length ? styles.criteriaPassed : ''
                }`}
              >
                <span>{criteria.length ? '✓' : '•'}</span>
                <span>8+ characters</span>
              </li>
              <li
                className={`${styles.criteriaItem} ${
                  criteria.mixedCase ? styles.criteriaPassed : ''
                }`}
              >
                <span>{criteria.mixedCase ? '✓' : '•'}</span>
                <span>Mixed uppercase & lowercase</span>
              </li>
              <li
                className={`${styles.criteriaItem} ${
                  criteria.number ? styles.criteriaPassed : ''
                }`}
              >
                <span>{criteria.number ? '✓' : '•'}</span>
                <span>At least one number</span>
              </li>
              <li
                className={`${styles.criteriaItem} ${
                  criteria.special ? styles.criteriaPassed : ''
                }`}
              >
                <span>{criteria.special ? '✓' : '•'}</span>
                <span>At least one symbol</span>
              </li>
            </ul>
          </div>
        )}

        <label className={styles.termsLabel}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className={styles.termsLink} target="_blank">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className={styles.termsLink} target="_blank">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading || isProcessingSignup}
          disabled={isLoading || isProcessingSignup}
          className={styles.submitBtn}
        >
          Create Account
        </Button>
      </form>

      <div className={styles.footerText}>
        Already have an account?
        <Link href="/login" className={styles.loginLink}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.container}>
        <Suspense fallback={<div className={styles.card}>Loading sign up...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
