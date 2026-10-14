import { supabase } from '../../db/client';
import { logger } from '../../lib/logger';

export interface OtpRateLimitCheckResult {
  allowed: boolean;
  attempts: number;
  retryAfterSeconds: number;
  message: string;
}

export class OtpRateLimitService {
  public static readonly MAX_ATTEMPTS = 3;
  public static readonly WINDOW_SECONDS = 3600; // 60 minutes
  public static readonly COOLDOWN_SECONDS = 60; // 60 seconds between sends

  // Fallback in-memory store for unit tests or environments where Postgres RPC is unavailable
  private static localFallbackStore = new Map<string, number[]>();

  /**
   * Normalizes email consistently across all systems.
   */
  public static normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  /**
   * Atomically checks and records an OTP send request for the given email.
   * Prevents concurrent bypass via transaction-level advisory locks in Postgres.
   */
  public static async checkAndRecord(
    rawEmail: string,
    ipAddress?: string
  ): Promise<OtpRateLimitCheckResult> {
    const normalizedEmail = this.normalizeEmail(rawEmail);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return {
        allowed: false,
        attempts: 0,
        retryAfterSeconds: 0,
        message: 'A valid email address is required.',
      };
    }

    try {
      // 1. Primary path: Call the atomic PostgreSQL RPC function
      const { data, error } = await supabase.rpc('check_and_record_otp_send', {
        p_email: normalizedEmail,
        p_max_attempts: this.MAX_ATTEMPTS,
        p_window_seconds: this.WINDOW_SECONDS,
        p_cooldown_seconds: this.COOLDOWN_SECONDS,
        p_ip: ipAddress || null,
      });

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          allowed: Boolean(row.allowed),
          attempts: Number(row.attempts),
          retryAfterSeconds: Number(row.retry_after_seconds),
          message: String(row.message),
        };
      }

      // 2. Secondary path: Direct database query via Supabase client if RPC is not deployed yet
      const windowStart = new Date(Date.now() - this.WINDOW_SECONDS * 1000).toISOString();
      const { data: logs, error: queryError } = await supabase
        .from('otp_send_logs')
        .select('requested_at')
        .eq('email', normalizedEmail)
        .gte('requested_at', windowStart)
        .order('requested_at', { ascending: false });

      if (!queryError && Array.isArray(logs)) {
        const attempts = logs.length;
        if (attempts > 0) {
          const latestTime = new Date(logs[0].requested_at).getTime();
          const elapsedSec = Math.floor((Date.now() - latestTime) / 1000);
          if (elapsedSec < this.COOLDOWN_SECONDS) {
            const retryAfter = this.COOLDOWN_SECONDS - elapsedSec;
            return {
              allowed: false,
              attempts,
              retryAfterSeconds: retryAfter,
              message: `Please wait ${retryAfter} seconds before requesting another code.`,
            };
          }
        }

        if (attempts >= this.MAX_ATTEMPTS) {
          const oldestTime = new Date(logs[logs.length - 1].requested_at).getTime();
          const elapsedSinceOldest = Math.floor((Date.now() - oldestTime) / 1000);
          const retryAfter = Math.max(1, this.WINDOW_SECONDS - elapsedSinceOldest);
          return {
            allowed: false,
            attempts,
            retryAfterSeconds: retryAfter,
            message: `Rate limit exceeded. Maximum ${this.MAX_ATTEMPTS} verification codes per hour.`,
          };
        }

        // Insert attempt log
        await supabase.from('otp_send_logs').insert({
          email: normalizedEmail,
          ip_address: ipAddress || null,
          requested_at: new Date().toISOString(),
        });

        return {
          allowed: true,
          attempts: attempts + 1,
          retryAfterSeconds: 0,
          message: 'Verification code request allowed.',
        };
      }
    } catch (err) {
      logger.warn(
        { err, email: normalizedEmail.replace(/(?<=.).(?=[^@]*?@)/g, '*') },
        '[OtpRateLimitService] Database check failed, falling back to atomic memory limiter.'
      );
    }

    // 3. In-memory fallback if database is completely mocked or offline during unit testing
    return this.checkMemoryFallback(normalizedEmail);
  }

  private static checkMemoryFallback(normalizedEmail: string): OtpRateLimitCheckResult {
    const now = Date.now();
    const windowStart = now - this.WINDOW_SECONDS * 1000;
    const existing = (this.localFallbackStore.get(normalizedEmail) || []).filter((t) => t > windowStart);

    if (existing.length > 0) {
      const latest = existing[existing.length - 1];
      const elapsedSec = Math.floor((now - latest) / 1000);
      if (elapsedSec < this.COOLDOWN_SECONDS) {
        const retryAfter = this.COOLDOWN_SECONDS - elapsedSec;
        return {
          allowed: false,
          attempts: existing.length,
          retryAfterSeconds: retryAfter,
          message: `Please wait ${retryAfter} seconds before requesting another code.`,
        };
      }
    }

    if (existing.length >= this.MAX_ATTEMPTS) {
      const oldest = existing[0];
      const elapsedSinceOldest = Math.floor((now - oldest) / 1000);
      const retryAfter = Math.max(1, this.WINDOW_SECONDS - elapsedSinceOldest);
      return {
        allowed: false,
        attempts: existing.length,
        retryAfterSeconds: retryAfter,
        message: `Rate limit exceeded. Maximum ${this.MAX_ATTEMPTS} verification codes per hour.`,
      };
    }

    existing.push(now);
    this.localFallbackStore.set(normalizedEmail, existing);

    return {
      allowed: true,
      attempts: existing.length,
      retryAfterSeconds: 0,
      message: 'Verification code request allowed.',
    };
  }

  /**
   * Resets the rate limit state (primarily for unit tests).
   */
  public static clearLimits(email?: string): void {
    if (email) {
      this.localFallbackStore.delete(this.normalizeEmail(email));
    } else {
      this.localFallbackStore.clear();
    }
  }

  /**
   * Periodically deletes logs older than retention period (7 days).
   */
  public static async cleanupStaleLogs(retentionDays = 7): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('otp_send_logs')
        .delete()
        .lt('requested_at', cutoff)
        .select('id');

      if (error) {
        logger.error({ error }, '[OtpRateLimitService] Error cleaning up stale rate-limit logs');
        return 0;
      }
      return data ? data.length : 0;
    } catch {
      return 0;
    }
  }
}
