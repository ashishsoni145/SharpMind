import { supabase } from '../../db/client';
import { logger } from '../../lib/logger';

export interface RetentionCleanupOptions {
  maxAgeDays?: number; // Default: 7
  batchSize?: number; // Default: 50
  dryRun?: boolean;
}

export interface RetentionCleanupReport {
  scannedCount: number;
  eligibleCount: number;
  deletedCount: number;
  skippedVerifiedCount: number;
  errors: string[];
  dryRun: boolean;
  durationMs: number;
}

export class RetentionService {
  public static readonly DEFAULT_RETENTION_DAYS = 7;
  public static readonly DEFAULT_BATCH_SIZE = 50;

  /**
   * Identifies and cleans up accounts that remain unverified after 7 days.
   * Uses authoritative Supabase Auth metadata and the Admin API `deleteUser`.
   * Never deletes verified accounts.
   */
  public static async cleanupUnverifiedAccounts(
    options: RetentionCleanupOptions = {}
  ): Promise<RetentionCleanupReport> {
    const startTime = Date.now();
    const maxAgeDays = options.maxAgeDays ?? this.DEFAULT_RETENTION_DAYS;
    const batchSize = options.batchSize ?? this.DEFAULT_BATCH_SIZE;
    const dryRun = Boolean(options.dryRun);

    const cutoffMs = startTime - maxAgeDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(cutoffMs);

    logger.info(
      { cutoffDate: cutoffDate.toISOString(), maxAgeDays, dryRun, batchSize },
      '[RetentionService] Initiating 7-day unverified account retention cleanup'
    );

    const report: RetentionCleanupReport = {
      scannedCount: 0,
      eligibleCount: 0,
      deletedCount: 0,
      skippedVerifiedCount: 0,
      errors: [],
      dryRun,
      durationMs: 0,
    };

    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        const { data, error } = await supabase.auth.admin.listUsers({
          page,
          perPage: batchSize,
        });

        if (error) {
          logger.error({ error }, '[RetentionService] Failed to list users from Supabase Auth admin API');
          report.errors.push(`Failed to list users page ${page}: ${error.message}`);
          break;
        }

        const users = data?.users || [];
        if (users.length === 0) {
          hasMore = false;
          break;
        }

        report.scannedCount += users.length;

        for (const candidate of users) {
          // Check 1: Must be completely unverified according to authoritative Supabase Auth state
          const isVerified = Boolean(candidate.email_confirmed_at);
          if (isVerified) {
            continue; // Never touch verified users
          }

          // Check 2: Account creation date must be older than 7 days
          const createdAtMs = new Date(candidate.created_at).getTime();
          if (createdAtMs > cutoffMs) {
            continue; // Account is still within the 7-day verification grace window
          }

          report.eligibleCount += 1;

          if (dryRun) {
            logger.info(
              { userId: candidate.id, createdAt: candidate.created_at },
              '[RetentionService] [DryRun] Eligible unverified account identified for deletion'
            );
            report.deletedCount += 1;
            continue;
          }

          // Step 3: Immediate pre-deletion authoritative re-check to avoid race conditions
          // (e.g. user verified in the few seconds between listUsers and deleteUser)
          try {
            const { data: freshData, error: freshErr } = await supabase.auth.admin.getUserById(candidate.id);
            if (freshErr || !freshData?.user) {
              logger.warn(
                { userId: candidate.id, error: freshErr?.message },
                '[RetentionService] User no longer exists before deletion; skipping.'
              );
              continue;
            }

            if (freshData.user.email_confirmed_at) {
              logger.warn(
                { userId: candidate.id, emailConfirmedAt: freshData.user.email_confirmed_at },
                '[RetentionService] RACE CONDITION PREVENTED: Account was verified just before deletion! Preserving user.'
              );
              report.skippedVerifiedCount += 1;
              continue;
            }

            // Step 4: Admin API supported user deletion (cascades cleanly through Postgres foreign keys)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(candidate.id);
            if (deleteError) {
              logger.error(
                { userId: candidate.id, error: deleteError.message },
                '[RetentionService] Failed to delete unverified user'
              );
              report.errors.push(`User ${candidate.id}: ${deleteError.message}`);
            } else {
              logger.info(
                { userId: candidate.id, createdAt: candidate.created_at },
                '[RetentionService] Successfully purged expired unverified account'
              );
              report.deletedCount += 1;
            }
          } catch (delEx: any) {
            logger.error({ userId: candidate.id, delEx }, '[RetentionService] Exception while deleting user');
            report.errors.push(`User ${candidate.id}: ${delEx?.message || 'Unknown error'}`);
          }
        }

        if (users.length < batchSize) {
          hasMore = false;
        } else {
          page += 1;
        }
      }
    } catch (loopEx: any) {
      logger.error({ loopEx }, '[RetentionService] Unhandled exception during retention loop');
      report.errors.push(`Retention loop failure: ${loopEx?.message || 'Unknown error'}`);
    }

    report.durationMs = Date.now() - startTime;
    logger.info(report, '[RetentionService] Retention cleanup run completed');
    return report;
  }
}
