-- =============================================================================
-- Migration: 20261014000001_remove_focus_tests_mistakes_revision_readiness.sql
-- Description: Drop unused tables associated with Focus Mode, Tests & Diagnostics,
-- Mistake Notebook, Spaced Revision, and Exam Readiness.
-- =============================================================================

-- 1. Drop focus mode tracking sessions
DROP TABLE IF EXISTS public.study_sessions CASCADE;

-- 2. Drop mistake notebook tables
DROP TABLE IF EXISTS public.mistakes CASCADE;

-- 3. Drop exam readiness snapshots
DROP TABLE IF EXISTS public.exam_readiness_snapshots CASCADE;

-- 4. Drop spaced revision items
DROP TABLE IF EXISTS public.spaced_repetition_items CASCADE;
DROP TABLE IF EXISTS public.revision_items CASCADE;

-- 5. Drop assessment engine & test diagnostics
DROP TABLE IF EXISTS public.assessment_submissions CASCADE;
DROP TABLE IF EXISTS public.question_attempts CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
