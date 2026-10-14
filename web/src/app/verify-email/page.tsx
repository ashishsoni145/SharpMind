'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, verifyOtp, refreshSession } = useAuth();

  // Prefer search param or authenticated user's email
  const paramEmail = searchParams?.get('email');
  const initialEmail = paramEmail || user?.email || '';

  const [email, setEmail] = useState<string>(initialEmail);
  const [isRequestingOtp, setIsRequestingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep email synced if auth state finishes restoring
  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Focus the first OTP input when the OTP section appears
  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  const clearAlerts = () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setRateLimitMessage(null);
  };

  /**
   * Request a confirmation OTP via the backend rate-limited endpoint.
   * Frontend never calls Supabase's resend directly to ensure atomic rate limiting.
   */
  const handleRequestOtp = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cooldown > 0) return;

    clearAlerts();
    setIsRequestingOtp(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        // Rate limit reached (max 3 sends per rolling 60 minutes)
        const retryAfter = data.retryAfterSeconds || 3600;
        const minutes = Math.ceil(retryAfter / 60);
        setRateLimitMessage(
          `Rate limit exceeded: Maximum 3 verification codes allowed per hour. Please wait ${minutes} minute${
            minutes > 1 ? 's' : ''
          } before requesting another code.`
        );
        setCooldown(retryAfter);
        return;
      }

      if (!response.ok || data.success === false) {
        setErrorMessage(data.error || 'Failed to request verification code. Please try again.');
        return;
      }

      setOtpSent(true);
      setStatusMessage(`If an account exists for ${targetEmail}, a verification code has been requested.`);
      setCooldown(data.cooldownSeconds || 60);
    } catch {
      setErrorMessage('Network error communicating with the verification service. Please try again.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const numericChar = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = numericChar;
    setOtpDigits(updated);
    setErrorMessage(null);

    // Auto advance to next input
    if (numericChar && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all 6 digits entered
    const combined = updated.join('');
    if (combined.length === 6) {
      handleVerifyCode(combined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    } else {
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  /**
   * Verify the 6-digit OTP code using Supabase Auth.
   */
  const handleVerifyCode = async (explicitCode?: string) => {
    const code = explicitCode || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    clearAlerts();
    setIsVerifying(true);
    setStatusMessage('Verifying code with security services...');

    try {
      const res = await verifyOtp(email, code, 'signup');

      if (!res.success) {
        const errorMsg =
          res.error?.message?.toLowerCase().includes('expired') ||
          res.error?.code === 'token_invalid_or_expired'
            ? 'The verification code is incorrect or has expired. Please enter a valid code or request a new one.'
            : res.error?.message || 'Verification failed. Please check the code and try again.';
        setErrorMessage(errorMsg);
        setStatusMessage(null);
        return;
      }

      // Authoritative verification succeeded
      setStatusMessage('Email verified successfully! Refreshing session...');

      // Notify backend non-blocking to trigger the verification-success email
      const verifiedUserId = res.user?.id || user?.id;
      if (verifiedUserId) {
        fetch(`${getApiBaseUrl()}/auth/verification-success-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: verifiedUserId }),
        }).catch(() => {
          // Non-blocking
        });
      }

      // Refresh authoritative session and navigate to dashboard
      await refreshSession();
      setTimeout(() => {
        router.push('/app');
      }, 1000);
    } catch {
      setErrorMessage('An unexpected error occurred during verification. Please try again.');
      setStatusMessage(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper} aria-hidden="true">
        ✉️
      </div>

      <h1 className={styles.title}>Verify your email</h1>

      <p className={styles.description}>
        {otpSent ? (
          <>
            Enter the 6-digit verification code sent to <br />
            <span className={styles.emailHighlight}>{email}</span>
          </>
        ) : (
          <>
            Verification is required to secure your account and unlock your learning workspace.
          </>
        )}
      </p>

      {/* Accessible Feedback Alerts */}
      {statusMessage && (
        <div className={styles.alert} role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorAlert} role="alert" aria-live="assertive">
          {errorMessage}
        </div>
      )}

      {rateLimitMessage && (
        <div className={styles.rateLimitAlert} role="alert" aria-live="assertive">
          {rateLimitMessage}
        </div>
      )}

      {/* Initial Step: Display account email and Continue button */}
      {!otpSent ? (
        <div className={styles.actions}>
          <div className={styles.emailInputWrapper}>
            <label htmlFor="verify-email-field" className={styles.otpLabel}>
              Account email
            </label>
            <input
              id="verify-email-field"
              type="email"
              className={styles.emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isRequestingOtp || Boolean(paramEmail || user?.email)}
              autoComplete="email"
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            loading={isRequestingOtp}
            disabled={isRequestingOtp || !email.trim()}
            onClick={handleRequestOtp}
          >
            Continue
          </Button>

          <Button href="/login" variant="ghost" size="sm" fullWidth>
            Return to Sign In
          </Button>
        </div>
      ) : (
        /* Second Step: 6-Digit Numeric OTP Input */
        <div className={styles.otpSection}>
          <label className={styles.otpLabel} htmlFor="otp-input-0">
            6-digit verification code
          </label>

          <div className={styles.otpInputsWrapper} onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={styles.otpInput}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying}
                aria-label={`Digit ${idx + 1} of verification code`}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              loading={isVerifying}
              disabled={isVerifying || otpDigits.join('').length !== 6}
              onClick={() => handleVerifyCode()}
            >
              Verify Code
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              disabled={cooldown > 0 || isRequestingOtp || isVerifying}
              onClick={handleRequestOtp}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
            </Button>

            <Button href="/login" variant="ghost" size="sm" fullWidth>
              Return to Sign In
            </Button>
          </div>

          {cooldown > 0 && (
            <p className={styles.cooldownNote}>
              A reasonable cooldown is applied to protect against unauthorized requests.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.container}>
        <Suspense fallback={<div className={styles.card}>Loading verification status...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
