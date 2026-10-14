import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { EmailService } from '../emails/email.service';
import { supabase } from '../db/client';
import { createApp } from '../app';
import { config } from '../config';

describe('SharpMind Email Integration & Verification Suite', () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
    EmailService.clearIdempotencyCache();
  });

  afterEach(() => {
    EmailService.setResendClient(null);
    vi.restoreAllMocks();
  });

  describe('1. Welcome Email Template & Rendering', () => {
    it('should correctly load welcome.html and interpolate all required branding, links, and notices', () => {
      const email = 'student@sharpmind.live';
      const name = 'Aashish Soni';
      const verificationUrl = 'https://app.sharpmind.live/verify-email?email=student%40sharpmind.live';

      const html = EmailService.loadTemplate('welcome.html', {
        name,
        email,
        verificationUrl,
        appUrl: 'https://app.sharpmind.live',
        landingUrl: 'https://sharpmind.live',
        year: '2026',
      });

      // Brand name
      expect(html).toContain('SharpMind');

      // Heading
      expect(html).toContain('Welcome to SharpMind');

      // Personalized greeting
      expect(html).toContain('Aashish Soni');

      // 7 days requirement statement
      expect(html).toMatch(/7\s*days/i);

      // Button labelled "Verify your account"
      expect(html).toContain('Verify your account');

      // Correct verification URL link
      expect(html).toContain(verificationUrl);

      // Fallback plain-text URL
      expect(html).toContain('Button not working? Copy and paste this URL into your browser:');

      // Note explaining opening the link alone does not verify the account
      expect(html).toMatch(/Opening this link alone does not verify your account/i);

      // Footer linking to https://sharpmind.live
      expect(html).toContain('https://sharpmind.live');
    });

    it('should fallback gracefully when optional name is omitted', () => {
      const html = EmailService.loadTemplate('welcome.html', {
        name: '',
        email: 'test@sharpmind.live',
        verificationUrl: 'https://app.sharpmind.live/verify-email?email=test%40sharpmind.live',
        appUrl: 'https://app.sharpmind.live',
        landingUrl: 'https://sharpmind.live',
        year: '2026',
      });

      expect(html).toContain('Welcome to SharpMind');
      expect(html).not.toContain('Hello, <strong></strong>');
    });
  });

  describe('2. Verification Success Email Template & Rendering', () => {
    it('should correctly load verification-success.html and interpolate all required branding, links, and confirmation', () => {
      const email = 'learner@sharpmind.live';
      const name = 'Priya Patel';
      const dashboardUrl = 'https://app.sharpmind.live/dashboard';

      const html = EmailService.loadTemplate('verification-success.html', {
        name,
        email,
        dashboardUrl,
        appUrl: 'https://app.sharpmind.live',
        landingUrl: 'https://sharpmind.live',
        year: '2026',
      });

      // Brand name
      expect(html).toContain('SharpMind');

      // Heading
      expect(html).toContain('Email verified successfully');

      // Confirmation message
      expect(html).toContain('has been verified successfully');

      // Button labelled "Open SharpMind"
      expect(html).toContain('Open SharpMind');

      // Target dashboard link
      expect(html).toContain('https://app.sharpmind.live/dashboard');

      // Footer linking to https://sharpmind.live
      expect(html).toContain('https://sharpmind.live');
    });
  });

  describe('3. Authoritative Verification and Welcome Email Logic', () => {
    it('should reject welcome email if user is not in Supabase Auth (unauthenticated/arbitrary request prevention)', async () => {
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: { user: null as any },
        error: { message: 'User not found' } as any,
      });

      const result = await EmailService.sendWelcomeEmail({
        userId: 'non-existent-user-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/User not found in Supabase Auth/i);
    });

    it('should successfully send welcome email when user exists in Supabase Auth', async () => {
      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'msg_welcome_123' },
        error: null,
      });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'valid-user-1',
            email: 'newstudent@example.com',
            user_metadata: { full_name: 'New Student' },
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValueOnce({
        data: { user: {} as any },
        error: null,
      });

      const result = await EmailService.sendWelcomeEmail({
        userId: 'valid-user-1',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_welcome_123');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('newstudent@example.com');
      expect(callArgs.subject).toContain('Welcome to SharpMind');
      expect(callArgs.html).toContain('Verify your account');
      expect(callArgs.html).toContain('https://app.sharpmind.live/verify-email?email=newstudent%40example.com');
    });

    it('should REJECT verification success email if Supabase Auth email_confirmed_at is null/unconfirmed', async () => {
      const mockSend = vi.fn();
      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'unverified-user-1',
            email: 'unconfirmed@example.com',
            email_confirmed_at: null, // NOT verified in Supabase Auth!
          } as any,
        },
        error: null,
      });

      const result = await EmailService.sendVerificationSuccessEmail({
        userId: 'unverified-user-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Email is not verified according to authoritative Supabase Auth records/i);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should send verification success email ONLY when Supabase Auth authoritatively confirms email', async () => {
      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'msg_success_456' },
        error: null,
      });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'verified-user-1',
            email: 'confirmed@example.com',
            user_metadata: { full_name: 'Confirmed Learner' },
            email_confirmed_at: '2026-10-14T10:00:00Z', // Authoritative verified timestamp!
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValueOnce({
        data: { user: {} as any },
        error: null,
      });

      const result = await EmailService.sendVerificationSuccessEmail({
        userId: 'verified-user-1',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_success_456');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('confirmed@example.com');
      expect(callArgs.subject).toContain('Email verified successfully');
      expect(callArgs.html).toContain('Open SharpMind');
      expect(callArgs.html).toContain('https://app.sharpmind.live/dashboard');
    });
  });

  describe('4. Idempotency & Duplicate Send Prevention', () => {
    it('should prevent duplicate welcome email dispatch when requested twice consecutively', async () => {
      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'msg_idem_1' },
        error: null,
      });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'idem-user-1',
            email: 'idem@example.com',
            user_metadata: {},
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
        data: { user: {} as any },
        error: null,
      });

      // First call -> Sends email
      const first = await EmailService.sendWelcomeEmail({ userId: 'idem-user-1' });
      expect(first.success).toBe(true);
      expect(first.duplicate).toBeFalsy();
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Second call -> Prevented by in-memory idempotency cache
      const second = await EmailService.sendWelcomeEmail({ userId: 'idem-user-1' });
      expect(second.success).toBe(true);
      expect(second.duplicate).toBe(true);
      expect(second.skipped).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1); // Not called again!
    });

    it('should respect persistent idempotency flag in user metadata', async () => {
      const mockSend = vi.fn();
      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'persisted-idem-user',
            email: 'persisted@example.com',
            user_metadata: {
              welcome_email_sent_at: '2026-10-14T08:00:00Z',
            },
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      const res = await EmailService.sendWelcomeEmail({ userId: 'persisted-idem-user' });
      expect(res.success).toBe(true);
      expect(res.duplicate).toBe(true);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should release idempotency reservation if welcome email sending fails, allowing retry', async () => {
      // First attempt fails due to Resend error
      const mockSend = vi
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Network error or unverified domain' },
        })
        .mockResolvedValueOnce({
          data: { id: 'msg_retry_success' },
          error: null,
        });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'retry-user-1',
            email: 'retry@example.com',
            user_metadata: {},
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
        data: { user: {} as any },
        error: null,
      });

      // First call fails
      const first = await EmailService.sendWelcomeEmail({ userId: 'retry-user-1' });
      expect(first.success).toBe(false);
      expect(first.error).toBe('Network error or unverified domain');

      // Second call should NOT be blocked as duplicate because failure released reservation
      const second = await EmailService.sendWelcomeEmail({ userId: 'retry-user-1' });
      expect(second.success).toBe(true);
      expect(second.duplicate).toBeFalsy();
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should release idempotency reservation if verification success sending fails, allowing retry', async () => {
      const mockSend = vi
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Temporary service error' },
        })
        .mockResolvedValueOnce({
          data: { id: 'msg_success_retry' },
          error: null,
        });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'retry-verify-user',
            email: 'verified_retry@example.com',
            user_metadata: {},
            email_confirmed_at: '2026-10-14T10:00:00Z',
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
        data: { user: {} as any },
        error: null,
      });

      const first = await EmailService.sendVerificationSuccessEmail({ userId: 'retry-verify-user' });
      expect(first.success).toBe(false);

      const second = await EmailService.sendVerificationSuccessEmail({ userId: 'retry-verify-user' });
      expect(second.success).toBe(true);
      expect(second.duplicate).toBeFalsy();
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should propagate pending in-flight dispatch result to concurrent callers (welcome email)', async () => {
      let resolveSend!: (val: any) => void;
      const delayedSendPromise = new Promise((resolve) => {
        resolveSend = resolve;
      });

      const mockSend = vi.fn().mockImplementation(() => delayedSendPromise);

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'concurrent-user-1',
            email: 'concurrent@example.com',
            user_metadata: { full_name: '  Concurrent Student  ' },
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
        data: { user: {} as any },
        error: null,
      });

      // Launch 2 dispatches concurrently
      const call1Promise = EmailService.sendWelcomeEmail({ userId: 'concurrent-user-1' });
      const call2Promise = EmailService.sendWelcomeEmail({ userId: 'concurrent-user-1' });

      // Resolve the in-flight Resend call
      resolveSend({ data: { id: 'msg_concurrent_123' }, error: null });

      const [res1, res2] = await Promise.all([call1Promise, call2Promise]);

      expect(res1.success).toBe(true);
      expect(res1.messageId).toBe('msg_concurrent_123');
      expect(res2.success).toBe(true);
      expect(res2.messageId).toBe('msg_concurrent_123');
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Name should be trimmed
      expect(mockSend.mock.calls[0][0].html).toContain('Concurrent Student');
      expect(mockSend.mock.calls[0][0].html).not.toContain('  Concurrent Student  ');
    });

    it('should propagate in-flight failure to concurrent callers without premature duplicate mark', async () => {
      let resolveSend!: (val: any) => void;
      const delayedSendPromise = new Promise((resolve) => {
        resolveSend = resolve;
      });

      const mockSend = vi.fn().mockImplementation(() => delayedSendPromise);

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'concurrent-fail-user',
            email: 'concurrent_fail@example.com',
            user_metadata: {},
            email_confirmed_at: '2026-10-14T10:00:00Z',
          } as any,
        },
        error: null,
      });

      const call1Promise = EmailService.sendVerificationSuccessEmail({ userId: 'concurrent-fail-user' });
      const call2Promise = EmailService.sendVerificationSuccessEmail({ userId: 'concurrent-fail-user' });

      // Fail the in-flight Resend call
      resolveSend({ data: null, error: { message: 'Out of quota' } });

      const [res1, res2] = await Promise.all([call1Promise, call2Promise]);

      expect(res1.success).toBe(false);
      expect(res1.error).toBe('Out of quota');
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Out of quota');
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Subsequent call should be allowed to retry since reservation was released
      mockSend.mockResolvedValueOnce({ data: { id: 'msg_retry_after_fail' }, error: null });
      const retryResult = await EmailService.sendVerificationSuccessEmail({ userId: 'concurrent-fail-user' });
      expect(retryResult.success).toBe(true);
      expect(retryResult.duplicate).toBeFalsy();
    });

    it('should release reservation on pre-dispatch exception allowing subsequent retry', async () => {
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'pre-dispatch-user',
            email: 'predispatch@example.com',
            user_metadata: {},
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      // Force loadTemplate to throw on first call
      const originalLoadTemplate = EmailService.loadTemplate;
      EmailService.loadTemplate = vi.fn().mockImplementationOnce(() => {
        throw new Error('Template rendering syntax error');
      });

      const first = await EmailService.sendWelcomeEmail({ userId: 'pre-dispatch-user' });
      expect(first.success).toBe(false);
      expect(first.error).toContain('Template rendering syntax error');

      // Restore original loadTemplate
      EmailService.loadTemplate = originalLoadTemplate;

      const mockSend = vi.fn().mockResolvedValue({ data: { id: 'msg_ok' }, error: null });
      EmailService.setResendClient({ emails: { send: mockSend } } as any);
      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({ data: { user: {} as any }, error: null });

      const second = await EmailService.sendWelcomeEmail({ userId: 'pre-dispatch-user' });
      expect(second.error).toBeUndefined();
      expect(second.success).toBe(true);
      expect(second.messageId).toBe('msg_ok');
    });
  });

  describe('5. Error Resilience & Missing Configuration', () => {
    it('should safely handle missing RESEND_API_KEY without crashing or throwing', async () => {
      // Simulate client returning null when API key is missing
      EmailService.setResendClient(null);
      const originalKey = config.email.apiKey;
      (config.email as any).apiKey = '';

      const result = await EmailService.sendRawEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      (config.email as any).apiKey = originalKey;

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.error).toMatch(/RESEND_API_KEY is not configured/i);
    });

    it('should gracefully handle Resend API rejection error', async () => {
      const mockSend = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Domain not verified in Resend' },
      });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      const result = await EmailService.sendRawEmail({
        to: 'target@example.com',
        subject: 'Test Failure',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Domain not verified in Resend');
    });

    it('should gracefully handle unexpected network exception during Resend call', async () => {
      const mockSend = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      const result = await EmailService.sendRawEmail({
        to: 'target@example.com',
        subject: 'Test Network Timeout',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ETIMEDOUT');
    });

    it('should properly mask email addresses in log outputs to prevent PII exposure', () => {
      expect(EmailService.maskEmail('aashish@sharpmind.live')).toBe('a***h@sharpmind.live');
      expect(EmailService.maskEmail('al@sharpmind.live')).toBe('a***@sharpmind.live');
      expect(EmailService.maskEmail('invalid-email')).toBe('***');
    });
  });

  describe('6. Auth API Endpoints for Email Integration', () => {
    it('POST /api/v1/auth/welcome-email should reject missing userId', async () => {
      const res = await request(app).post('/api/v1/auth/welcome-email').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/welcome-email should respond 200 with delivery details for valid user', async () => {
      const mockSend = vi.fn().mockResolvedValue({
        data: { id: 'msg_api_welcome' },
        error: null,
      });

      EmailService.setResendClient({
        emails: { send: mockSend },
      } as any);

      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'api-user-1',
            email: 'apiuser@example.com',
            user_metadata: { full_name: 'API User' },
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValueOnce({
        data: { user: {} as any },
        error: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/welcome-email')
        .send({ userId: 'api-user-1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.delivered).toBe(true);
    });

    it('POST /api/v1/auth/verification-success-email should return 400 if user email is not yet confirmed in Supabase Auth', async () => {
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValueOnce({
        data: {
          user: {
            id: 'unconfirmed-api-user',
            email: 'unconfirmed@example.com',
            email_confirmed_at: null,
          } as any,
        },
        error: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/verification-success-email')
        .send({ userId: 'unconfirmed-api-user' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/not verified/i);
    });
  });
});
