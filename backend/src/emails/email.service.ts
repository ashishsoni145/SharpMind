import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { config } from '../config';
import { supabase } from '../db/client';
import { logger } from '../lib/logger';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  duplicate?: boolean;
  skipped?: boolean;
}

export interface WelcomeEmailParams {
  userId: string;
  email?: string;
  name?: string;
}

export interface VerificationSuccessEmailParams {
  userId: string;
  email?: string;
  name?: string;
}

export class EmailService {
  private static resendClient: Resend | null = null;
  // In-memory idempotency cache: key -> timestamp sent
  private static idempotencyCache = new Map<string, number>();
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  // In-flight dispatches: key -> Promise<EmailSendResult> to propagate identical outcome to concurrent callers
  private static inFlightDispatches = new Map<string, Promise<EmailSendResult>>();

  /**
   * Safe email masking for logs to protect user PII (e.g., j***e@example.com)
   */
  public static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0] || '*'}***@${domain}`;
    }
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  }

  /**
   * Lazily initializes and returns singleton Resend client
   */
  public static getResendClient(): Resend | null {
    if (!this.resendClient) {
      const apiKey = config.email.apiKey;
      if (!apiKey || apiKey.trim() === '') {
        return null;
      }
      this.resendClient = new Resend(apiKey);
    }
    return this.resendClient;
  }

  /**
   * Overrides or resets the Resend client instance (primarily for testing and mock injection)
   */
  public static setResendClient(client: Resend | null): void {
    this.resendClient = client;
  }

  /**
   * Resets the in-memory idempotency cache and pending in-flight dispatches (useful for testing)
   */
  public static clearIdempotencyCache(): void {
    this.idempotencyCache.clear();
    this.inFlightDispatches.clear();
  }

  /**
   * Checks if an action was already dispatched
   */
  private static isIdempotent(key: string): boolean {
    const sentAt = this.idempotencyCache.get(key);
    if (!sentAt) return false;
    if (Date.now() - sentAt > this.CACHE_TTL_MS) {
      this.idempotencyCache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Records an action in the in-memory idempotency cache
   */
  public static markIdempotent(key: string): void {
    this.idempotencyCache.set(key, Date.now());
  }

  /**
   * Releases an action from the in-memory idempotency cache (e.g. on dispatch failure)
   */
  public static releaseIdempotent(key: string): void {
    this.idempotencyCache.delete(key);
  }

  /**
   * Resolves the HTML template file from several possible runtime paths,
   * with a reliable embedded HTML string fallback.
   */
  public static loadTemplate(templateFileName: string, variables: Record<string, string>): string {
    const candidatePaths = [
      path.resolve(__dirname, 'templates', templateFileName),
      path.resolve(__dirname, '../emails/templates', templateFileName),
      path.resolve(process.cwd(), 'src/emails/templates', templateFileName),
      path.resolve(process.cwd(), 'dist/emails/templates', templateFileName),
      path.resolve(process.cwd(), 'backend/src/emails/templates', templateFileName),
    ];

    let templateContent: string | null = null;
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          templateContent = fs.readFileSync(p, 'utf-8');
          break;
        }
      } catch {
        // Continue trying fallback paths
      }
    }

    if (!templateContent) {
      logger.warn(
        { templateFileName },
        '[EmailService] Template file not found on disk; utilizing embedded fallback template.'
      );
      templateContent = this.getEmbeddedFallbackTemplate(templateFileName);
    }

    // Render variables and simple conditionals
    return this.interpolateTemplate(templateContent, variables);
  }

  /**
   * Simple template interpolation for {{variable}} and {{#if variable}}...{{/if}}
   */
  public static interpolateTemplate(template: string, variables: Record<string, string>): string {
    let result = template;

    // Handle conditional blocks: {{#if var}}content{{/if}}
    const ifRegex = /\{\{#if\s+([a-zA-Z0-9_-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifRegex, (_match, varName, innerContent) => {
      const val = variables[varName];
      return val && val.trim().length > 0 ? innerContent : '';
    });

    // Handle variables: {{var}}
    const varRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    result = result.replace(varRegex, (_match, varName) => {
      return variables[varName] !== undefined ? variables[varName] : '';
    });

    return result;
  }

  /**
   * Embedded fallback templates ensuring email service works even in stripped container/serverless environments
   */
  private static getEmbeddedFallbackTemplate(templateFileName: string): string {
    if (templateFileName.includes('welcome')) {
      return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#fff;padding:24px;">
        <h1 style="color:#6366f1;">Welcome to SharpMind</h1>
        <p>Hello{{#if name}} {{name}}{{/if}},</p>
        <p>Please verify your email address to activate your account. Verification must be completed within 7 days.</p>
        <p><a href="{{verificationUrl}}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Verify your account</a></p>
        <p style="font-size:12px;color:#94a3b8;">Please note: Opening this link alone does not verify your account. You will be guided to enter your confirmation code or complete verification on the portal.</p>
        <p style="font-size:12px;color:#9ca3af;">Fallback URL: {{verificationUrl}}</p>
        <hr style="border-color:#1f2937;" />
        <p style="font-size:11px;color:#6b7280;"><a href="{{landingUrl}}" style="color:#818cf8;">https://sharpmind.live</a> &bull; &copy; {{year}} SharpMind</p>
      </body></html>`;
    }

    return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#fff;padding:24px;">
      <h1 style="color:#10b981;">Email verified successfully</h1>
      <p>Hello{{#if name}} {{name}}{{/if}},</p>
      <p>Your email ({{email}}) has been verified successfully. Your SharpMind account is active.</p>
      <p><a href="{{dashboardUrl}}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Open SharpMind</a></p>
      <hr style="border-color:#1f2937;" />
      <p style="font-size:11px;color:#6b7280;"><a href="{{landingUrl}}" style="color:#818cf8;">https://sharpmind.live</a> &bull; &copy; {{year}} SharpMind</p>
    </body></html>`;
  }

  /**
   * Internal generic dispatcher
   */
  public static async sendRawEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    idempotencyKey?: string;
  }): Promise<EmailSendResult> {
    const maskedTo = this.maskEmail(options.to);

    // 1. Idempotency check
    if (options.idempotencyKey && this.isIdempotent(options.idempotencyKey)) {
      logger.info(
        { idempotencyKey: options.idempotencyKey, to: maskedTo },
        '[EmailService] Email already sent (in-memory idempotency hit); skipping dispatch.'
      );
      return { success: true, duplicate: true, skipped: true };
    }

    // 2. Check Resend Client & Configuration
    const resend = this.getResendClient();
    if (!resend) {
      logger.warn(
        { to: maskedTo, subject: options.subject },
        '[EmailService] RESEND_API_KEY is not configured; email dispatch skipped safely.'
      );
      return {
        success: false,
        error: 'RESEND_API_KEY is not configured on the server.',
        skipped: true,
      };
    }

    const fromAddress = config.email.from || 'SharpMind <noreply@sharpmind.live>';

    try {
      logger.info({ to: maskedTo, subject: options.subject, from: fromAddress }, '[EmailService] Dispatching email via Resend...');

      const response = await resend.emails.send({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (response.error) {
        logger.error(
          { error: response.error, to: maskedTo, subject: options.subject },
          '[EmailService] Resend API rejected message dispatch.'
        );
        return {
          success: false,
          error: response.error.message || 'Resend API error',
        };
      }

      if (options.idempotencyKey) {
        this.markIdempotent(options.idempotencyKey);
      }

      logger.info({ messageId: response.data?.id, to: maskedTo }, '[EmailService] Email dispatched successfully.');

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (err: any) {
      logger.error(
        { error: err?.message || err, to: maskedTo, subject: options.subject },
        '[EmailService] Unexpected failure during email dispatch.'
      );
      return {
        success: false,
        error: err?.message || 'Unexpected email transmission failure',
      };
    }
  }

  /**
   * Sends the Welcome Email after a verified user signup event.
   * Authoritatively checks that the user exists in Supabase Auth before dispatching.
   */
  public static async sendWelcomeEmail(params: WelcomeEmailParams): Promise<EmailSendResult> {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'Invalid or missing userId' };
    }

    // 1. Authoritative check: User MUST exist in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authData?.user) {
      logger.warn(
        { userId, error: authError?.message },
        '[EmailService] Denied welcome email: user does not exist in Supabase Auth.'
      );
      return {
        success: false,
        error: 'User not found in Supabase Auth. Unauthenticated/arbitrary requests are rejected.',
      };
    }

    const user = authData.user;
    const recipientEmail = user.email || params.email;
    if (!recipientEmail) {
      return { success: false, error: 'User does not have a valid email address' };
    }

    // 2. Persistent idempotency check from Supabase user metadata
    const userMetadata = user.user_metadata || {};
    if (userMetadata.welcome_email_sent_at) {
      logger.info(
        { userId, email: this.maskEmail(recipientEmail) },
        '[EmailService] Welcome email already marked as sent in user metadata; skipping.'
      );
      return { success: true, duplicate: true, skipped: true };
    }

    // 3. In-flight and in-memory idempotency check & immediate reservation
    const idempotencyKey = `welcome:${userId}`;

    // If a dispatch is currently in flight, await its outcome so concurrent callers receive the same result
    const inFlight = this.inFlightDispatches.get(idempotencyKey);
    if (inFlight) {
      return await inFlight;
    }

    if (this.isIdempotent(idempotencyKey)) {
      return { success: true, duplicate: true, skipped: true };
    }
    this.markIdempotent(idempotencyKey);

    const dispatchPromise = (async (): Promise<EmailSendResult> => {
      try {
        // Normalize name before fallback template rendering
        const rawName =
          userMetadata.full_name ||
          userMetadata.name ||
          params.name ||
          (recipientEmail.includes('@') ? recipientEmail.split('@')[0] : '') ||
          '';
        const recipientName = typeof rawName === 'string' ? rawName.trim() : '';

        const verificationUrl = `${config.email.appUrl}/verify-email?email=${encodeURIComponent(recipientEmail)}`;

        const htmlContent = this.loadTemplate('welcome.html', {
          name: recipientName,
          email: recipientEmail,
          verificationUrl,
          appUrl: config.email.appUrl,
          landingUrl: config.email.landingUrl,
          year: new Date().getFullYear().toString(),
        });

        const plainText = [
          `Welcome to SharpMind`,
          ``,
          `Hello ${recipientName || 'there'},`,
          `Thank you for joining SharpMind, your AI Academic Operating System.`,
          `Please verify your email within 7 days by visiting:`,
          verificationUrl,
          ``,
          `Note: Opening this link alone does not verify your account. Please complete the verification process on the portal.`,
          ``,
          `https://sharpmind.live`,
        ].join('\n');

        const result = await this.sendRawEmail({
          to: recipientEmail,
          subject: 'Welcome to SharpMind — Verify your account',
          html: htmlContent,
          text: plainText,
        });

        // If email dispatch fails, release the reservation to allow subsequent retry
        if (!result.success) {
          this.releaseIdempotent(idempotencyKey);
          return result;
        }

        // 4. If email sent successfully, persist state to user metadata
        if (result.success && !result.skipped) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              user_metadata: {
                ...userMetadata,
                welcome_email_sent_at: new Date().toISOString(),
              },
            });
          } catch (err: any) {
            logger.warn(
              { userId, error: err?.message },
              '[EmailService] Could not persist welcome_email_sent_at to user metadata; continuing.'
            );
          }
        }

        return result;
      } catch (err: any) {
        // Release reservation on pre-dispatch or unexpected exception so subsequent retries are allowed
        this.releaseIdempotent(idempotencyKey);
        logger.error(
          { userId, error: err?.message || err },
          '[EmailService] Exception during welcome email dispatch.'
        );
        return {
          success: false,
          error: err?.message || 'Welcome email dispatch failed due to an unexpected error',
        };
      }
    })();

    this.inFlightDispatches.set(idempotencyKey, dispatchPromise);
    try {
      return await dispatchPromise;
    } finally {
      this.inFlightDispatches.delete(idempotencyKey);
    }
  }

  /**
   * Sends the Verification Success Email.
   * AUTHORITATIVE: Only sends after verifying that Supabase Auth has email_confirmed_at set.
   * NEVER trusts frontend flags!
   */
  public static async sendVerificationSuccessEmail(
    params: VerificationSuccessEmailParams
  ): Promise<EmailSendResult> {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'Invalid or missing userId' };
    }

    // 1. Authoritative check: User MUST have email_confirmed_at in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authData?.user) {
      logger.warn(
        { userId, error: authError?.message },
        '[EmailService] Verification success denied: user does not exist in Supabase Auth.'
      );
      return { success: false, error: 'User does not exist in authentication system.' };
    }

    const user = authData.user;
    if (!user.email_confirmed_at) {
      logger.warn(
        { userId, email: this.maskEmail(user.email || '') },
        '[EmailService] Verification success email REJECTED: email_confirmed_at is null/unconfirmed in Supabase Auth.'
      );
      return {
        success: false,
        error: 'Email is not verified according to authoritative Supabase Auth records.',
      };
    }

    const recipientEmail = user.email || params.email;
    if (!recipientEmail) {
      return { success: false, error: 'User has no valid email address' };
    }

    // 2. Check persistent idempotency in user metadata
    const userMetadata = user.user_metadata || {};
    if (userMetadata.verification_success_email_sent_at) {
      logger.info(
        { userId, email: this.maskEmail(recipientEmail) },
        '[EmailService] Verification success email already marked as sent in user metadata; skipping.'
      );
      return { success: true, duplicate: true, skipped: true };
    }

    // 3. In-flight and in-memory idempotency check & immediate reservation
    const idempotencyKey = `verification_success:${userId}`;

    // If a dispatch is currently in flight, await its outcome so concurrent callers receive the same result
    const inFlight = this.inFlightDispatches.get(idempotencyKey);
    if (inFlight) {
      return await inFlight;
    }

    if (this.isIdempotent(idempotencyKey)) {
      return { success: true, duplicate: true, skipped: true };
    }
    this.markIdempotent(idempotencyKey);

    const dispatchPromise = (async (): Promise<EmailSendResult> => {
      try {
        // Normalize name before fallback template rendering
        const rawName =
          userMetadata.full_name ||
          userMetadata.name ||
          params.name ||
          (recipientEmail.includes('@') ? recipientEmail.split('@')[0] : '') ||
          '';
        const recipientName = typeof rawName === 'string' ? rawName.trim() : '';

        const dashboardUrl = `${config.email.appUrl}/dashboard`;

        const htmlContent = this.loadTemplate('verification-success.html', {
          name: recipientName,
          email: recipientEmail,
          dashboardUrl,
          appUrl: config.email.appUrl,
          landingUrl: config.email.landingUrl,
          year: new Date().getFullYear().toString(),
        });

        const plainText = [
          `Email verified successfully — SharpMind`,
          ``,
          `Hello ${recipientName || 'there'},`,
          `Your email address (${recipientEmail}) has been successfully verified.`,
          `Open SharpMind to access your academic dashboard:`,
          dashboardUrl,
          ``,
          `https://sharpmind.live`,
        ].join('\n');

        const result = await this.sendRawEmail({
          to: recipientEmail,
          subject: 'Email verified successfully — Welcome to SharpMind',
          html: htmlContent,
          text: plainText,
        });

        // If email dispatch fails, release the reservation to allow subsequent retry
        if (!result.success) {
          this.releaseIdempotent(idempotencyKey);
          return result;
        }

        // 4. Update user metadata
        if (result.success && !result.skipped) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              user_metadata: {
                ...userMetadata,
                verification_success_email_sent_at: new Date().toISOString(),
              },
            });
          } catch (err: any) {
            logger.warn(
              { userId, error: err?.message },
              '[EmailService] Could not persist verification_success_email_sent_at to user metadata; continuing.'
            );
          }
        }

        return result;
      } catch (err: any) {
        // Release reservation on pre-dispatch or unexpected exception so subsequent retries are allowed
        this.releaseIdempotent(idempotencyKey);
        logger.error(
          { userId, error: err?.message || err },
          '[EmailService] Exception during verification success email dispatch.'
        );
        return {
          success: false,
          error: err?.message || 'Verification success email dispatch failed due to an unexpected error',
        };
      }
    })();

    this.inFlightDispatches.set(idempotencyKey, dispatchPromise);
    try {
      return await dispatchPromise;
    } finally {
      this.inFlightDispatches.delete(idempotencyKey);
    }
  }
}

export default EmailService;
