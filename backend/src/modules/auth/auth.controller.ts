import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../../emails/email.service';
import { logger } from '../../lib/logger';
import { BadRequestError, UnauthorizedError } from '../../lib/errors';
import { OtpRateLimitService } from './otp-rate-limit.service';
import { RetentionService } from './retention.service';
import { supabase } from '../../db/client';
import { config } from '../../config';

export class AuthController {
  /**
   * POST /api/v1/auth/welcome-email
   * Dispatches welcome email for a verified Supabase user after signup.
   * Email failure never throws or marks the operation failed.
   */
  public static async sendWelcomeEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId || typeof userId !== 'string') {
        throw new BadRequestError('Field "userId" is required and must be a string.');
      }

      logger.info({ userId }, '[AuthController] Requesting welcome email dispatch');
      const result = await EmailService.sendWelcomeEmail({ userId });

      // Always return 200 with delivery details; do not fail auth
      res.status(200).json({
        success: true,
        data: {
          delivered: result.success && !result.skipped,
          duplicate: Boolean(result.duplicate),
          skipped: Boolean(result.skipped),
          messageId: result.messageId || null,
          error: result.error || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/verification-success-email
   * Dispatches verification success email ONLY after authoritative Supabase Auth confirmation.
   * Rejects unverified requests without sending.
   */
  public static async sendVerificationSuccessEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId || typeof userId !== 'string') {
        throw new BadRequestError('Field "userId" is required and must be a string.');
      }

      logger.info({ userId }, '[AuthController] Requesting verification success email dispatch');
      const result = await EmailService.sendVerificationSuccessEmail({ userId });

      if (!result.success && result.error?.includes('not verified')) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          delivered: result.success && !result.skipped,
          duplicate: Boolean(result.duplicate),
          skipped: Boolean(result.skipped),
          messageId: result.messageId || null,
          error: result.error || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/webhook
   * Supabase Auth webhook endpoint for auth events (INSERT, UPDATE).
   */
  public static async handleAuthWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = req.body;
      const type = event?.type;
      const record = event?.record;

      if (!record?.id) {
        res.status(200).json({ received: true, ignored: true, reason: 'No record id' });
        return;
      }

      const userId = record.id;

      // Handle user creation -> Welcome email
      if (type === 'INSERT') {
        await EmailService.sendWelcomeEmail({ userId, email: record.email });
      }

      // Handle email confirmation -> Verification success email
      if (type === 'UPDATE' && record.email_confirmed_at && !event.old_record?.email_confirmed_at) {
        await EmailService.sendVerificationSuccessEmail({ userId, email: record.email });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      // Webhooks should acknowledge receipt even on secondary errors to avoid infinite redelivery
      logger.error({ err }, '[AuthController] Auth webhook processing error');
      res.status(200).json({ received: true, error: (err as any)?.message });
    }
  }

  /**
   * POST /api/v1/auth/request-otp
   * Request an email verification OTP for an existing unverified account.
   * Atomically rate limited to 3 sends per normalized email address per rolling 60 minutes.
   * Returns a safe response to prevent user enumeration.
   */
  public static async requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        throw new BadRequestError('Field "email" is required and must be a string.');
      }

      const normalizedEmail = OtpRateLimitService.normalizeEmail(email);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new BadRequestError('Please provide a valid email address.');
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const rateLimit = await OtpRateLimitService.checkAndRecord(normalizedEmail, clientIp);

      if (!rateLimit.allowed) {
        logger.warn(
          { email: EmailService.maskEmail(normalizedEmail), attempts: rateLimit.attempts },
          '[AuthController] OTP send rate limited'
        );
        res.status(429).json({
          success: false,
          error: rateLimit.message,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        });
        return;
      }

      // Dispatch OTP through Supabase Auth
      try {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: normalizedEmail,
        });
        if (resendError) {
          logger.warn(
            { error: resendError.message, email: EmailService.maskEmail(normalizedEmail) },
            '[AuthController] Supabase resend returned non-fatal error'
          );
        }
      } catch (sendErr) {
        logger.error(
          { sendErr, email: EmailService.maskEmail(normalizedEmail) },
          '[AuthController] Exception dispatching OTP'
        );
      }

      // Always return a neutral success response to prevent account enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a verification code has been dispatched.',
        cooldownSeconds: OtpRateLimitService.COOLDOWN_SECONDS,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/retention-cleanup
   * Scheduled or admin-triggered cleanup of accounts unverified after 7 days.
   * Protected by secret header x-retention-secret or admin session.
   */
  public static async triggerRetentionCleanup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providedSecret = req.headers['x-retention-secret'];
      const expectedSecret = process.env.RETENTION_SECRET || config.supabase.serviceRoleKey;

      const isAuthorizedSecret = Boolean(expectedSecret && providedSecret === expectedSecret);
      const isAdminUser = req.user?.role === 'admin';

      if (!isAuthorizedSecret && !isAdminUser) {
        throw new UnauthorizedError('Unauthorized: valid retention secret or admin session required.');
      }

      const { dryRun, batchSize, maxAgeDays } = req.body || {};
      const report = await RetentionService.cleanupUnverifiedAccounts({
        dryRun: typeof dryRun === 'boolean' ? dryRun : undefined,
        batchSize: typeof batchSize === 'number' ? batchSize : undefined,
        maxAgeDays: typeof maxAgeDays === 'number' ? maxAgeDays : undefined,
      });

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}
