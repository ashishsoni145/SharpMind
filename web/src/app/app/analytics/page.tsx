'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api-client';
import { AcademicHealthScore, DailyDebrief, WeeklyReview } from '@sharpmind/types';
import styles from './AnalyticsPage.module.css';

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [healthScore, setHealthScore] = useState<AcademicHealthScore | null>(null);
  const [dailyDebrief, setDailyDebrief] = useState<DailyDebrief | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [scoreData, debriefData, reviewData] = await Promise.all([
        apiClient.analytics.getHealthScore().catch(() => null),
        apiClient.analytics.getDailyDebrief().catch(() => null),
        apiClient.analytics.getWeeklyReview().catch(() => null),
      ]);
      setHealthScore(scoreData);
      setDailyDebrief(debriefData);
      setWeeklyReview(reviewData);
    } catch (err: any) {
      console.error('Failed to load academic analytics:', err);
      showToast('Could not sync with academic intelligence engine. Please check backend connectivity.', 'error', {
        label: 'Retry', onClick: () => void loadAnalytics(),
      });
      setHealthScore(null);
      setDailyDebrief(null);
      setWeeklyReview(null);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const overallScore = healthScore?.overallScore ?? 0;
  const gaugeAngle = `${Math.round((overallScore / 100) * 360)}deg`;

  return (
    <WorkspaceShell>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Icon name="analytics" size="xs" />
            Academic Intelligence Engine
          </div>
          <h1 className={styles.title}>Academic Health & Telemetry</h1>
          <p className={styles.subtitle}>
            Explainable 7-dimension performance telemetry synthesized strictly from verified test results,
            spaced repetition retention, and focus sessions. Zero artificial guesswork.
          </p>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Evaluating 7-dimension telemetry data...
          </div>
        ) : !healthScore ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-text-secondary)',
          }}>
            <span style={{ fontSize: '2.5rem' }}>📊</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '0.75rem' }}>
              Academic Health Score Uncalibrated
            </h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem auto', lineHeight: 1.6 }}>
              SharpMind refuses to fabricate scores. An authentic academic health index requires observed evidence from your study sessions, mock tests, and revision retries.
            </p>
            <Link
              href="/app/tests"
              style={{
                display: 'inline-block',
                padding: '0.625rem 1.25rem',
                background: '#6F6F6F',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Begin Observed Evidence Session &rarr;
            </Link>
          </div>
        ) : (
          <>
            {/* Overall Health Score Card */}
            <div className={styles.overallScoreCard}>
              <div className={styles.scoreLeft}>
                <span className={styles.scoreLabel}>Composite Academic Health Index</span>
                <div className={styles.gradeLabel}>{healthScore.gradeLabel}</div>
                <p className={styles.scoreDescription}>
                  Calculated deterministically using syllabus coverage (15%), conceptual mastery (20%),
                  revision cadence (15%), exam readiness (20%), time pacing (10%), problem accuracy (10%),
                  and habit consistency (10%).
                </p>
              </div>

              <div
                className={styles.scoreGauge}
                style={{ '--health-angle': gaugeAngle } as React.CSSProperties}
              >
                <div className={styles.gaugeInner}>
                  <span className={styles.gaugeNumber}>{healthScore.overallScore}</span>
                  <span className={styles.gaugeMax}>/ 100</span>
                </div>
              </div>
            </div>

            {/* 7 Dimensions Grid */}
            {healthScore.dimensions && healthScore.dimensions.length > 0 && (
              <div className={styles.dimensionsSection}>
                <h2 className={styles.sectionHeading}>Seven Core Health Dimensions</h2>
                <div className={styles.dimensionsGrid}>
                  {healthScore.dimensions.map((dim) => {
                    const badgeClass =
                      dim.status === 'healthy'
                        ? styles.healthy
                        : dim.status === 'attention'
                        ? styles.attention
                        : dim.status === 'critical'
                        ? styles.critical
                        : styles.uncalibrated;

                    const barColor =
                      dim.status === 'healthy'
                        ? '#ffffff'
                        : dim.status === 'attention'
                        ? '#A6A6A6'
                        : dim.status === 'critical'
                        ? '#686868'
                        : '#727272';

                    return (
                      <div key={dim.id} className={styles.dimensionCard}>
                        <div className={styles.dimensionHeader}>
                          <span className={styles.dimensionTitle}>{dim.label}</span>
                          <span className={`${styles.dimensionBadge} ${badgeClass}`}>
                            {dim.status}
                          </span>
                        </div>

                        <div className={styles.scoreBarTrack}>
                          <div
                            className={styles.scoreBarFill}
                            style={{
                              width: `${dim.score}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>

                        <p className={styles.dimensionExplanation}>{dim.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Daily Debrief & Weekly Strategic Review */}
        <div className={styles.reviewsSplit}>
          {/* Daily Debrief Card */}
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <h3 className={styles.reviewTitle}>
                <Icon name="sparkles" size="sm" />
                Daily AI Debrief
              </h3>
              {dailyDebrief && (
                <span style={{ fontSize: '0.8rem', color: '#A1A1A1' }}>{dailyDebrief.reviewDate}</span>
              )}
            </div>

            {dailyDebrief ? (
              <>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A1A1A1', textTransform: 'uppercase' }}>
                    Today&apos;s Grounded Highlights
                  </span>
                  <ul className={styles.bulletList} style={{ marginTop: '0.5rem' }}>
                    {dailyDebrief.highlights.map((h, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <span className={styles.bulletIcon}><Icon name="check" size="xs" /></span>
                        <span>{h}</span>
                      </li>
                    ))}
                    {dailyDebrief.celebratedWins.map((w, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <span className={styles.bulletIcon}><Icon name="flame" size="xs" /></span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {dailyDebrief.actionableNextSteps && dailyDebrief.actionableNextSteps.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A6A6A6', textTransform: 'uppercase' }}>
                      Actionable Next Steps
                    </span>
                    <ul className={styles.bulletList} style={{ marginTop: '0.5rem' }}>
                      {dailyDebrief.actionableNextSteps.map((s, i) => (
                        <li key={i} className={styles.bulletItem}>
                          <span className={styles.bulletIcon}><Icon name="arrowRight" size="xs" /></span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                No debrief generated yet for today. Completing focus sessions, revision recall cards, or tests will generate your evening debrief.
              </p>
            )}
          </div>

          {/* Weekly Strategic Review Card */}
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <h3 className={styles.reviewTitle}>
                <Icon name="award" size="sm" />
                Weekly Strategic Review
              </h3>
              {weeklyReview && (
                <span style={{ fontSize: '0.8rem', color: '#A1A1A1' }}>
                  {weeklyReview.weekStartDate} to {weeklyReview.weekEndDate}
                </span>
              )}
            </div>

            {weeklyReview ? (
              <>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#A1A1A1', textTransform: 'uppercase' }}>
                      Weekly Study Hours
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
                      {weeklyReview.totalStudyHours.toFixed(1)}h
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#A1A1A1', textTransform: 'uppercase' }}>
                      Topic Velocity
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#A5A5A5' }}>
                      {weeklyReview.weeklyVelocity} topics
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A1A1A1', textTransform: 'uppercase' }}>
                    Strategic Recommendations
                  </span>
                  <ul className={styles.bulletList} style={{ marginTop: '0.5rem' }}>
                    {weeklyReview.strategicRecommendations.map((r, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <span className={styles.bulletIcon}><Icon name="target" size="xs" /></span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Weekly strategic review is compiled at the conclusion of each study cycle to track velocity and balance across subjects.
              </p>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
