import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import styles from './SecuritySettingsForm.module.css';

interface SecuritySettingsFormProps {
  lastPasswordChange: string;
  onChangePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  lastPasswordChange,
  onChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Criteria validation
  const hasLength = newPassword.length >= 8;
  const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const allCriteriaMet = hasLength && hasUpperLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allCriteriaMet) {
      showToast('Please satisfy all password complexity criteria before updating.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onChangePassword(currentPassword, newPassword);
      if (res.success) {
        showToast(res.message, 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('An unexpected error occurred while updating password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Change Password Form */}
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>
            <Icon name="lock" size="sm" />
            Password & Cryptographic Credentials
          </h2>
          <p className={styles.subtitle}>
            Last updated: <strong>{lastPasswordChange}</strong>. Update your credentials to protect your study plans and academic diagnostics.
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="sec-current-pass" className={styles.label}>
            Current Password
          </label>
          <input
            id="sec-current-pass"
            type="password"
            className={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="sec-new-pass" className={styles.label}>
            New Password
          </label>
          <input
            id="sec-new-pass"
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Live Criteria Checklist */}
        <div className={styles.criteriaList}>
          <span className={`${styles.criteriaItem} ${hasLength ? styles.criteriaMet : ''}`}>
            <Icon name={hasLength ? 'check' : 'lock'} size="xs" /> At least 8 characters
          </span>
          <span className={`${styles.criteriaItem} ${hasUpperLower ? styles.criteriaMet : ''}`}>
            <Icon name={hasUpperLower ? 'check' : 'lock'} size="xs" /> Uppercase & lowercase letters
          </span>
          <span className={`${styles.criteriaItem} ${hasNumber ? styles.criteriaMet : ''}`}>
            <Icon name={hasNumber ? 'check' : 'lock'} size="xs" /> At least one number
          </span>
          <span className={`${styles.criteriaItem} ${hasSpecial ? styles.criteriaMet : ''}`}>
            <Icon name={hasSpecial ? 'check' : 'lock'} size="xs" /> Special character (!@#$%^&*)
          </span>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="sec-confirm-pass" className={styles.label}>
            Confirm New Password
          </label>
          <input
            id="sec-confirm-pass"
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.actionsRow}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          >
            <Icon name="lock" size="xs" />
            {isSubmitting ? 'Updating Credentials...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Active Sessions Card */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>
            <Icon name="award" size="sm" />
            Active Session Security Telemetry
          </h2>
          <p className={styles.subtitle}>
            Devices currently authorized to access your student account.
          </p>
        </div>

        <div className={styles.sessionsList}>
          <div className={styles.sessionItem}>
            <div className={styles.sessionInfo}>
              <span className={styles.sessionName}>Desktop Web Shell (Current Session)</span>
              <span className={styles.sessionDetail}>Windows • Chrome Browser • Active Now</span>
            </div>
            <span className={styles.activeBadge}>
              <Icon name="check" size="xs" /> Active Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
