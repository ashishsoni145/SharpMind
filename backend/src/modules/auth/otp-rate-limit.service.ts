import { supabase } from '../../db/client';
import { logger } from '../../lib/logger';

export interface OtpRateLimitCheckResult {
  allowed: boolean;
  attempts: number;
  retryAfterSeconds: number;
  message: string;
  unavailable?: boolean;
}

export class OtpRateLimitService {
  public static readonly MAX_ATTEMPTS = 3;
  public static readonly WINDOW_SECONDS = 3600; // 60 minutes
  public static readonly COOLDOWN_SECONDS = 60; // 60 seconds between sends

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

      if (!error && Array.isArray(data) && data.length === 1) {
        const row = data[0];
        return {
          allowed: Boolean(row.allowed),
          attempts: Number(row.attempts),
          retryAfterSeconds: Number(row.retry_after_seconds),
          message: String(row.message),
        };
      }

      // PostgREST error codes distinguish a missing/unexposed migration (PGRST202)
      // from permission and database failures, without logging the email or secrets.
      logger.error(
        {
          rpc: 'check_and_record_otp_send',
          errorCode: error?.code || (error ? 'UNKNOWN_RPC_ERROR' : 'EMPTY_RPC_RESULT'),
          errorMessage: error?.message || 'RPC returned no result',
        },
        '[OtpRateLimitService] Atomic OTP limiter is unavailable'
      );
    } catch (err) {
      logger.warn(
        { err, email: normalizedEmail.replace(/(?<=.).(?=[^@]*?@)/g, '*') },
        '[OtpRateLimitService] Database check failed; refusing OTP request.'
      );
    }

    return {
      allowed: false,
      attempts: 0,
      retryAfterSeconds: 60,
      message: 'Verification service is temporarily unavailable. Please try again shortly.',
      unavailable: true,
    };
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
