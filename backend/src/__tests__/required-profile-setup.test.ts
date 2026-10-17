import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock('../db/client', () => ({
  supabase: { rpc: rpcMock },
}));

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: unknown, _res: unknown, next: () => void) => {
    Object.assign(req, {
      user: {
        id: 'authenticated-student-id',
        email: 'student@example.com',
        role: 'student',
        fullName: 'Student',
        isEmailVerified: true,
      },
    });
    next();
  },
  optionalAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { createApp } from '../app';

describe('required signup profile setup', () => {
  const app = createApp();

  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('persists the authenticated user profile and selected class', async () => {
    rpcMock.mockResolvedValue({
      data: [{
        profile_id: 'authenticated-student-id',
        full_name: 'Aarav Sharma',
        username: 'aarav_sharma',
        grade_id: 'class_11',
        profile_setup_completed: true,
      }],
      error: null,
    });

    const response = await request(app)
      .post('/api/v1/onboarding/complete-profile')
      .send({
        userId: 'attacker-selected-id',
        fullName: 'Aarav Sharma',
        username: 'Aarav_Sharma',
        gradeId: 'class_11',
      })
      .expect(200);

    expect(response.body.data.profileSetupCompleted).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith('complete_signup_profile', {
      p_user_id: 'authenticated-student-id',
      p_full_name: 'Aarav Sharma',
      p_username: 'aarav_sharma',
      p_grade_id: 'class_11',
    });
  });

  it('returns a clear conflict when another profile owns the username', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique index' },
    });

    const response = await request(app)
      .post('/api/v1/onboarding/complete-profile')
      .send({ fullName: 'Aarav Sharma', username: 'aarav_sharma', gradeId: 'class_12' })
      .expect(409);

    expect(response.body.error.message).toContain('username is already taken');
  });

  it('rejects usernames and class values outside the persisted profile contract', async () => {
    await request(app)
      .post('/api/v1/onboarding/complete-profile')
      .send({ fullName: 'Aarav Sharma', username: 'Bad-Name', gradeId: 'class_10' })
      .expect(422);

    expect(rpcMock).not.toHaveBeenCalled();
  });
});
