import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../../emails/email.service';
import { logger } from '../../lib/logger';
import { BadRequestError } from '../../lib/errors';

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
}
