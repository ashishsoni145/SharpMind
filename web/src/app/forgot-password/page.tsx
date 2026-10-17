'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import styles from './page.module.css';

function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showToast('Enter a valid email address to request a password reset.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset({ email: normalizedEmail });
      if (!result.success) {
        showToast(result.error?.message || 'Could not request password reset. Please try again.', 'error');
        return;
      }
      showToast('If an account is associated with this email, reset instructions have been sent.', 'success');
    } catch {
      showToast('Could not request password reset. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          name="email"
          id="forgot-email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          Send Reset Instructions
        </Button>
      </form>

      <div className={styles.footerText}>
        Remembered your password?
        <Link href="/login" className={styles.backLink}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.container}>
        <Suspense fallback={<div className={styles.card}>Loading recovery form...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
