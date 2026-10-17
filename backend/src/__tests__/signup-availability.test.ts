import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { fromMock, queryMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  queryMock: {
    select: vi.fn(),
    ilike: vi.fn(),
    neq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  },
}));

vi.mock('../db/client', () => ({ supabase: { from: fromMock } }));

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: unknown, _res: unknown, next: () => void) => {
    Object.assign(req, { user: { id: 'current-user-id', role: 'student' } });
    next();
  },
  optionalAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { createApp } from '../app';
import { createVerificationPageUrl } from '../../../web/src/lib/auth/verification-route';

describe('signup availability checks', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of Object.values(queryMock)) method.mockReturnValue(queryMock);
    fromMock.mockReturnValue(queryMock);
  });

  it('opens OTP entry directly after Supabase signup so Continue does not resend the already-sent code', () => {
    const url = createVerificationPageUrl('Student@Example.com', true);
    const parsed = new URL(url, 'https://app.sharpmind.live');
    expect(parsed.pathname).toBe('/verify-email');
    expect(parsed.searchParams.get('email')).toBe('student@example.com');
    expect(parsed.searchParams.get('step')).toBe('otp');
  });

  it('keeps local demo signup on the manual Continue flow', () => {
    const parsed = new URL(createVerificationPageUrl('Student@Example.com', false), 'https://app.sharpmind.live');
    expect(parsed.searchParams.get('step')).toBeNull();
  });

  it('reports an existing normalized email without returning account details', async () => {
    queryMock.maybeSingle.mockResolvedValue({ data: { id: 'must-not-leak' }, error: null });

    const response = await request(app)
      .post('/api/v1/auth/email-availability')
      .send({ email: ' User_Name%+tag@Example.com ' })
      .expect(200);

    expect(response.body).toEqual({ success: true, data: { available: false } });
    expect(fromMock).toHaveBeenCalledWith('profiles');
    expect(queryMock.ilike).toHaveBeenCalledWith('email', 'user\\_name\\%+tag@example.com');
  });

  it('rejects invalid email before querying the database', async () => {
    const response = await request(app)
      .post('/api/v1/auth/email-availability')
      .send({ email: 'not-an-email' })
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('checks username availability case-insensitively and excludes the authenticated user', async () => {
    queryMock.maybeSingle.mockResolvedValue({ data: null, error: null });

    const response = await request(app)
      .post('/api/v1/users/username-availability')
      .set('Authorization', 'Bearer test-session')
      .send({ username: 'New_User' })
      .expect(200);

    expect(response.body).toEqual({ success: true, data: { available: true } });
    expect(queryMock.ilike).toHaveBeenCalledWith('username', 'new\\_user');
    expect(queryMock.neq).toHaveBeenCalledWith('id', 'current-user-id');
  });

  it('returns a retryable server error when email availability cannot be checked', async () => {
    queryMock.maybeSingle.mockResolvedValue({ data: null, error: { code: 'XX000' } });

    const response = await request(app)
      .post('/api/v1/auth/email-availability')
      .send({ email: 'student@example.com' })
      .expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/could not check this email/i);
  });
});
