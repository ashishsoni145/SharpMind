import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { supabase } from '../db/client';
import { OtpRateLimitService } from '../modules/auth/otp-rate-limit.service';
import { RetentionService } from '../modules/auth/retention.service';
import { requireVerifiedEmail } from '../middleware/authorization';
import { AuthenticatedUser } from '../types/express';
import { Request, Response, NextFunction } from 'express';

describe('SharpMind Email OTP Verification, Rate Limiting & Retention Suite', () => {
  const app = createApp();
  let requestTimes: Map<string, number[]>;

  beforeEach(() => {
    vi.restoreAllMocks();
    requestTimes = new Map();
    vi.spyOn(supabase, 'rpc').mockImplementation(async (_fn: any, args: any) => {
      const email = String(args.p_email).trim().toLowerCase();
      const now = Date.now();
      const recent = (requestTimes.get(email) || []).filter((time) => time > now - 60 * 60 * 1000);
      const latest = recent[recent.length - 1];
      let row: any;
      if (latest !== undefined && now - latest < 60_000) {
        row = { allowed: false, attempts: recent.length, retry_after_seconds: Math.ceil((60_000 - (now - latest)) / 1000), message: 'Please wait before requesting another code.' };
      } else if (recent.length >= 3) {
        row = { allowed: false, attempts: recent.length, retry_after_seconds: 3600, message: 'Rate limit exceeded. Maximum 3 verification codes per hour.' };
      } else {
        recent.push(now);
        requestTimes.set(email, recent);
        row = { allowed: true, attempts: recent.length, retry_after_seconds: 0, message: 'Verification code request allowed.' };
      }
      return { data: [row], error: null } as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // PHASE 1: Verification Flow & Safe Auth
  // ===========================================================================
  describe('Phase 1: Verification Flow & Safe Auth', () => {
    it('POST /api/v1/auth/request-otp should reject empty or invalid email address', async () => {
      const resEmpty = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({})
        .expect(400);

      const emptyMsg = resEmpty.body.error?.message || resEmpty.body.message || JSON.stringify(resEmpty.body);
      expect(emptyMsg).toMatch(/Field "email" is required/i);

      const resInvalid = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ email: 'not-an-email' })
        .expect(400);

      const invalidMsg = resInvalid.body.error?.message || resInvalid.body.message || JSON.stringify(resInvalid.body);
      expect(invalidMsg).toMatch(/valid email/i);
    });

    it('POST /api/v1/auth/request-otp should return neutral success message and cooldown without leaking account existence', async () => {
      vi.spyOn(supabase.auth, 'resend').mockResolvedValue({
        data: {} as any,
        error: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ email: 'newstudent@example.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If an account exists');
      expect(res.body.cooldownSeconds).toBe(60);
    });

    it('POST /api/v1/auth/request-otp should fail closed when the atomic limiter RPC is unavailable', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: { message: 'function not found' } } as any);
      const resend = vi.spyOn(supabase.auth, 'resend');
      const res = await request(app).post('/api/v1/auth/request-otp').send({ email: 'student@example.com' }).expect(503);
      expect(res.body.success).toBe(false);
      expect(resend).not.toHaveBeenCalled();
    });

    it('POST /api/v1/auth/request-otp should report Supabase delivery request failures', async () => {
      vi.spyOn(supabase.auth, 'resend').mockResolvedValue({ data: {} as any, error: { message: 'provider unavailable' } as any });
      const res = await request(app).post('/api/v1/auth/request-otp').send({ email: 'student@example.com' }).expect(503);
      expect(res.body.error).toMatch(/could not be requested/i);
    });

    it('POST /api/v1/auth/verification-success-email should reject unverified accounts based on Supabase Auth', async () => {
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'unverified-user-1',
            email: 'unverified@example.com',
            email_confirmed_at: null, // Unverified
            user_metadata: {},
          } as any,
        },
        error: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/verification-success-email')
        .send({ userId: 'unverified-user-1' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Email is not verified according to authoritative Supabase Auth records/i);
    });
  });

  // ===========================================================================
  // PHASE 2: Rate Limiting & Verified-Only Authorization
  // ===========================================================================
  describe('Phase 2: OTP Rate Limiting & Verified-Only Authorization', () => {
    it('OtpRateLimitService should enforce resend cooldown between immediate requests', async () => {
      const email = 'cooldown-test@example.com';

      // 1st request -> allowed
      const first = await OtpRateLimitService.checkAndRecord(email);
      expect(first.allowed).toBe(true);

      // 2nd immediate request -> rejected due to cooldown
      const immediateSecond = await OtpRateLimitService.checkAndRecord(email);
      expect(immediateSecond.allowed).toBe(false);
      expect(immediateSecond.retryAfterSeconds).toBeGreaterThan(0);
      expect(immediateSecond.message).toMatch(/wait/i);
    });

    it('OtpRateLimitService should enforce maximum 3 sends in rolling 60 minutes and normalize email addresses', async () => {
      const email1 = 'LimitTest@Example.com';
      const email2 = 'limittest@example.com'; // Normalized identical
      const now = Date.now();

      // Mock Date.now to test rolling window boundary past cooldown
      const dateSpy = vi.spyOn(Date, 'now');

      // Attempt 1 at t=0
      dateSpy.mockReturnValue(now);
      const res1 = await OtpRateLimitService.checkAndRecord(email1);
      expect(res1.allowed).toBe(true);
      expect(res1.attempts).toBe(1);

      // Attempt 2 at t=70s (cooldown elapsed)
      dateSpy.mockReturnValue(now + 70 * 1000);
      const res2 = await OtpRateLimitService.checkAndRecord(email2);
      expect(res2.allowed).toBe(true);
      expect(res2.attempts).toBe(2);

      // Attempt 3 at t=140s
      dateSpy.mockReturnValue(now + 140 * 1000);
      const res3 = await OtpRateLimitService.checkAndRecord(email1);
      expect(res3.allowed).toBe(true);
      expect(res3.attempts).toBe(3);

      // Attempt 4 at t=200s -> MUST BE REJECTED by 3-per-hour rate limit
      dateSpy.mockReturnValue(now + 200 * 1000);
      const res4 = await OtpRateLimitService.checkAndRecord(email2);
      expect(res4.allowed).toBe(false);
      expect(res4.message).toMatch(/Maximum 3 verification codes per hour/i);
      expect(res4.retryAfterSeconds).toBeGreaterThan(0);

      // Endpoint integration check for 429
      const apiRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ email: 'limittest@example.com' })
        .expect(429);

      expect(apiRes.body.success).toBe(false);
      expect(apiRes.body.error).toMatch(/Rate limit exceeded/i);
      expect(apiRes.body.retryAfterSeconds).toBeDefined();

      dateSpy.mockRestore();
    });

    it('requireVerifiedEmail middleware should reject unverified users with 403 Forbidden', () => {
      const req: Partial<Request> = {
        user: {
          id: 'unverified-1',
          email: 'unverified@example.com',
          role: 'student',
          fullName: 'Unverified Student',
          isEmailVerified: false, // Unverified
        } as AuthenticatedUser,
      };

      const res: Partial<Response> = {};
      let nextCalledWith: any = null;
      const next: NextFunction = (err) => {
        nextCalledWith = err;
      };

      requireVerifiedEmail(req as Request, res as Response, next);

      expect(nextCalledWith).toBeDefined();
      expect(nextCalledWith?.statusCode).toBe(403);
      expect(nextCalledWith?.message).toMatch(/Email verification required/i);
    });

    it('requireVerifiedEmail middleware should allow verified users', () => {
      const req: Partial<Request> = {
        user: {
          id: 'verified-1',
          email: 'verified@example.com',
          role: 'student',
          fullName: 'Verified Student',
          isEmailVerified: true, // Authoritatively verified
        } as AuthenticatedUser,
      };

      const res: Partial<Response> = {};
      let nextCalledWith: any = null;
      const next: NextFunction = (err) => {
        nextCalledWith = err;
      };

      requireVerifiedEmail(req as Request, res as Response, next);

      expect(nextCalledWith).toBeUndefined(); // Passed
    });

    it('Stale profile flag should NOT bypass unverified auth: verification derives strictly from Supabase Auth', async () => {
      // Mock Supabase Auth getUser returning unconfirmed user
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: {
          user: {
            id: 'stale-user-1',
            email: 'stale@example.com',
            email_confirmed_at: null, // Auth says UNVERIFIED
            user_metadata: { full_name: 'Stale Learner' },
          } as any,
        },
        error: null,
      });

      // Mock database profile saying is_email_verified = true (stale!)
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                role: 'student',
                full_name: 'Stale Learner',
                is_email_verified: true, // Stale profile flag!
              },
            }),
          }),
        }),
      } as any);

      // Attempt accessing verified-only AI tutor session
      const res = await request(app)
        .post('/api/v1/tutor/sessions')
        .set('Authorization', 'Bearer token_stale_profile')
        .send({})
        .expect(403);

      const errorMsg = res.body.error?.message || res.body.message || JSON.stringify(res.body);
      expect(errorMsg).toMatch(/Email verification required/i);

      const assessmentRes = await request(app)
        .get('/api/v1/assessments/submissions/private-submission/resume')
        .set('Authorization', 'Bearer token_stale_profile')
        .expect(403);
      expect(assessmentRes.body.error?.message || assessmentRes.body.message).toMatch(/Email verification required/i);
    });
  });

  // ===========================================================================
  // PHASE 3: 7-Day Unverified Account Retention
  // ===========================================================================
  describe('Phase 3: 7-Day Unverified Account Retention', () => {
    it('RetentionService should delete accounts that remain unverified > 7 days', async () => {
      const now = Date.now();
      const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
      const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

      const candidateUsers = [
        {
          id: 'user-old-unverified',
          created_at: eightDaysAgo,
          email_confirmed_at: null, // Eligible for deletion
        },
        {
          id: 'user-recent-unverified',
          created_at: twoDaysAgo,
          email_confirmed_at: null, // Within 7-day grace window, keep
        },
        {
          id: 'user-old-verified',
          created_at: tenDaysAgo,
          email_confirmed_at: tenDaysAgo, // Verified, NEVER DELETE
        },
      ];

      vi.spyOn(supabase.auth.admin, 'listUsers').mockResolvedValue({
        data: { users: candidateUsers as any },
        error: null,
      });

      // Mock pre-deletion re-check
      vi.spyOn(supabase.auth.admin, 'getUserById').mockImplementation(async (id: string) => {
        const found = candidateUsers.find((u) => u.id === id);
        return { data: { user: found as any }, error: null };
      });

      const deleteUserSpy = vi.spyOn(supabase.auth.admin, 'deleteUser').mockResolvedValue({
        data: { user: null as any },
        error: null,
      });

      const report = await RetentionService.cleanupUnverifiedAccounts({ dryRun: false });

      expect(report.scannedCount).toBe(3);
      expect(report.eligibleCount).toBe(1);
      expect(report.deletedCount).toBe(1);
      expect(report.skippedVerifiedCount).toBe(0);

      // Verify that deleteUser was called ONLY for the expired unverified account
      expect(deleteUserSpy).toHaveBeenCalledTimes(1);
      expect(deleteUserSpy).toHaveBeenCalledWith('user-old-unverified');
    });

    it('RetentionService should handle pre-deletion race conditions: never delete if verified just before deletion', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

      vi.spyOn(supabase.auth.admin, 'listUsers').mockResolvedValue({
        data: {
          users: [
            {
              id: 'user-just-verified',
              created_at: eightDaysAgo,
              email_confirmed_at: null, // Unverified at listing time
            } as any,
          ],
        },
        error: null,
      });

      // Immediate pre-deletion re-check reveals account was verified moments ago
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({
        data: {
          user: {
            id: 'user-just-verified',
            created_at: eightDaysAgo,
            email_confirmed_at: new Date().toISOString(), // Verified in race condition!
          } as any,
        },
        error: null,
      });

      const deleteUserSpy = vi.spyOn(supabase.auth.admin, 'deleteUser').mockResolvedValue({
        data: { user: null as any },
        error: null,
      });

      const report = await RetentionService.cleanupUnverifiedAccounts({ dryRun: false });

      expect(report.eligibleCount).toBe(1);
      expect(report.deletedCount).toBe(0);
      expect(report.skippedVerifiedCount).toBe(1);
      // deleteUser must NOT have been called!
      expect(deleteUserSpy).not.toHaveBeenCalled();
    });

    it('RetentionService should recheck age before deletion and preserve a recently created account', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      vi.spyOn(supabase.auth.admin, 'listUsers').mockResolvedValue({ data: { users: [{ id: 'recent-user', created_at: eightDaysAgo, email_confirmed_at: null } as any] }, error: null });
      vi.spyOn(supabase.auth.admin, 'getUserById').mockResolvedValue({ data: { user: { id: 'recent-user', created_at: twoDaysAgo, email_confirmed_at: null } as any }, error: null });
      const remove = vi.spyOn(supabase.auth.admin, 'deleteUser');
      const report = await RetentionService.cleanupUnverifiedAccounts();
      expect(report.deletedCount).toBe(0);
      expect(remove).not.toHaveBeenCalled();
    });

    it('POST /api/v1/auth/retention-cleanup should require secret authorization or admin access', async () => {
      // Missing secret -> 401
      await request(app)
        .post('/api/v1/auth/retention-cleanup')
        .send({})
        .expect(401);

      // Valid secret -> 200
      vi.spyOn(RetentionService, 'cleanupUnverifiedAccounts').mockResolvedValue({
        scannedCount: 10,
        eligibleCount: 2,
        deletedCount: 2,
        skippedVerifiedCount: 0,
        errors: [],
        dryRun: false,
        durationMs: 50,
      });

      const previousSecret = process.env.RETENTION_SECRET;
      process.env.RETENTION_SECRET = 'test-retention-secret';
      const res = await request(app)
        .post('/api/v1/auth/retention-cleanup')
        .set('x-retention-secret', 'test-retention-secret')
        .send({})
        .expect(200);
      if (previousSecret === undefined) delete process.env.RETENTION_SECRET;
      else process.env.RETENTION_SECRET = previousSecret;

      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedCount).toBe(2);
    });
  });
});
