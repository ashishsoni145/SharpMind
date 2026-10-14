import type { SettingsAdapter } from './settings-adapter.interface';
import type {
  UserSettings,
  AcademicSettings,
  UserPreferences,
  NotificationSettings,
} from '@/lib/types/settings';
import { hashPassword, verifyPassword } from '../auth/local-auth-adapter';

const SETTINGS_STORAGE_KEY = 'sharpmind_user_settings_v1';

export class LocalSettingsAdapter implements SettingsAdapter {
  public readonly name = 'LocalSettingsAdapter';

  private getAllSettings(): Record<string, UserSettings> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveAllSettings(map: Record<string, UserSettings>) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Ignore
    }
  }

  private buildDefaultSettings(userId: string): UserSettings {
    return {
      id: userId,
      name: '',
      username: '',
      email: '',
      role: 'student',
      academicProfile: {
        board: '',
        grade: '',
        stream: '',
        targetExams: [],
        targetYear: '',
        dailyAvailableHours: 3.0,
        preferredStudyTime: 'evening',
        schoolOrCoaching: '',
      },
      subscription: {
        tier: 'free',
        status: 'active',
        planName: 'SharpMind Baseline (Free)',
        features: [
          'Full Classroom Syllabus Access',
          'NCERT Digital Library with Inbuilt Reader',
          'Socratic AI Tutor (Baseline Reasoning)',
          'Interactive 3D Simulation Void',
          'Baseline Diagnostic Assessments',
        ],
      },
      preferences: {
        theme: 'dark',
        reducedMotion: false,
        fontSize: 'default',
        soundEffects: true,
      },
      notifications: {
        dailyStudyReminder: true,
        reminderTime: '18:00',
        revisionAlerts: true,
        testSeriesAnnouncements: true,
        weeklyReportEmail: true,
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toLocaleDateString(),
        activeSessionsCount: 1,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  public async getSettings(userId: string): Promise<UserSettings> {
    const map = this.getAllSettings();
    if (!map[userId]) {
      const defaults = this.buildDefaultSettings(userId);
      map[userId] = defaults;
      this.saveAllSettings(map);
      return defaults;
    }
    return map[userId];
  }

  public async updateProfile(
    userId: string,
    data: Partial<Pick<UserSettings, 'name' | 'username' | 'avatarUrl'>>
  ): Promise<UserSettings> {
    const current = await this.getSettings(userId);
    const updated: UserSettings = {
      ...current,
      name: data.name ?? current.name,
      username: data.username ?? current.username,
      avatarUrl: data.avatarUrl ?? current.avatarUrl,
      updatedAt: new Date().toISOString(),
    };
    const map = this.getAllSettings();
    map[userId] = updated;
    this.saveAllSettings(map);
    return updated;
  }

  public async updateAcademicProfile(
    userId: string,
    data: Partial<AcademicSettings>
  ): Promise<UserSettings> {
    const current = await this.getSettings(userId);
    const updated: UserSettings = {
      ...current,
      academicProfile: {
        ...current.academicProfile,
        ...data,
      },
      updatedAt: new Date().toISOString(),
    };
    const map = this.getAllSettings();
    map[userId] = updated;
    this.saveAllSettings(map);
    return updated;
  }

  public async updatePreferences(
    userId: string,
    data: Partial<UserPreferences>
  ): Promise<UserSettings> {
    const current = await this.getSettings(userId);
    const updated: UserSettings = {
      ...current,
      preferences: {
        ...current.preferences,
        ...data,
      },
      updatedAt: new Date().toISOString(),
    };
    const map = this.getAllSettings();
    map[userId] = updated;
    this.saveAllSettings(map);
    return updated;
  }

  public async updateNotifications(
    userId: string,
    data: Partial<NotificationSettings>
  ): Promise<UserSettings> {
    const current = await this.getSettings(userId);
    const updated: UserSettings = {
      ...current,
      notifications: {
        ...current.notifications,
        ...data,
      },
      updatedAt: new Date().toISOString(),
    };
    const map = this.getAllSettings();
    map[userId] = updated;
    this.saveAllSettings(map);
    return updated;
  }

  public async changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    if (!oldPass || !oldPass.trim()) {
      return { success: false, message: 'Please enter your current password.' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    if (typeof window === 'undefined') {
      return { success: false, message: 'Password change is not supported in this environment.' };
    }

    try {
      const storedUsersRaw = localStorage.getItem('sharpmind_auth_users');
      if (!storedUsersRaw) {
        return { success: false, message: 'User account store not found. Unable to update credentials.' };
      }

      const users = JSON.parse(storedUsersRaw);
      if (!Array.isArray(users)) {
        return { success: false, message: 'Invalid user account records. Unable to update credentials.' };
      }

      const found = users.find((u: any) => u.id === userId || (u.email && u.email.toLowerCase() === userId.toLowerCase()));
      if (!found) {
        return { success: false, message: 'User account not found. Unable to update credentials.' };
      }

      // Verify current password against stored credentials
      if (found.passwordHash && !verifyPassword(oldPass, found.passwordHash)) {
        return { success: false, message: 'Current password is incorrect. Please verify and try again.' };
      }

      // Store hashed password, never containing newPass verbatim
      found.passwordHash = hashPassword(newPass);
      found.updatedAt = new Date().toISOString();

      // Persist credential update
      localStorage.setItem('sharpmind_auth_users', JSON.stringify(users));

      // Update lastPasswordChange ONLY after user credential persistence succeeds
      const current = await this.getSettings(userId);
      current.security.lastPasswordChange = new Date().toLocaleDateString();
      const map = this.getAllSettings();
      map[userId] = current;
      this.saveAllSettings(map);

      return { success: true, message: 'Password updated successfully.' };
    } catch {
      return { success: false, message: 'Failed to persist updated credentials. Please try again.' };
    }
  }
}
