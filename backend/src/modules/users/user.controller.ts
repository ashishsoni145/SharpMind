import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess } from '../../lib/api-response';
import { UnauthorizedError } from '../../lib/errors';

export class UserController {
  public static async checkUsernameAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const username = String(req.body.username).trim().toLowerCase();
      if (!/^[a-z0-9_]{3,24}$/.test(username)) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Username must be 3–24 letters, numbers, or underscores.' },
        });
        return;
      }
      sendSuccess(res, { available: await UserService.isUsernameAvailable(username, req.user.id) });
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await UserService.getProfile(req.user.id);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  public static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await UserService.updateProfile(req.user.id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  public static async getStudentProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const studentProfile = await UserService.getStudentProfile(req.user.id);
      sendSuccess(res, studentProfile);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStudentProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await UserService.updateStudentProfile(req.user.id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  public static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await UserService.getProfile(id);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }
}
