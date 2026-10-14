-- =============================================================================
-- Migration: 20261014000002_otp_rate_limiting.sql
-- Description: Atomic database-backed OTP rate-limiting mechanism and audit log.
-- Enforces a maximum of 3 OTP sends per normalized email address in any rolling 60-minute window.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.otp_send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Fast lookup index for rolling window counts
CREATE INDEX IF NOT EXISTS idx_otp_send_logs_email_window 
  ON public.otp_send_logs (email, requested_at DESC);

-- Index for retention cleanup
CREATE INDEX IF NOT EXISTS idx_otp_send_logs_retention 
  ON public.otp_send_logs (requested_at);

-- Row Level Security: Only backend service-role key has access
ALTER TABLE public.otp_send_logs ENABLE ROW LEVEL SECURITY;

-- Atomic verification and rate limiting procedure using transaction-level advisory locks
CREATE OR REPLACE FUNCTION public.check_and_record_otp_send(
  p_email TEXT,
  p_max_attempts INT DEFAULT 3,
  p_window_seconds INT DEFAULT 3600,
  p_cooldown_seconds INT DEFAULT 60,
  p_ip TEXT DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  attempts INT,
  retry_after_seconds INT,
  message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_email TEXT;
  v_window_start TIMESTAMPTZ;
  v_count INT;
  v_latest TIMESTAMPTZ;
  v_oldest TIMESTAMPTZ;
  v_elapsed_since_latest INT;
  v_remaining_cooldown INT;
  v_remaining_window INT;
BEGIN
  v_normalized_email := lower(trim(p_email));
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Acquire transaction-scoped advisory lock for the target email
  -- This guarantees race-free atomic rate-limit checks across multiple backend instances
  PERFORM pg_advisory_xact_lock(hashtext(v_normalized_email));

  -- Get stats within rolling window
  SELECT 
    COUNT(*), 
    MAX(requested_at), 
    MIN(requested_at)
  INTO 
    v_count, 
    v_latest, 
    v_oldest
  FROM public.otp_send_logs
  WHERE email = v_normalized_email
    AND requested_at > v_window_start;

  -- Check cooldown from the most recent request
  IF v_latest IS NOT NULL THEN
    v_elapsed_since_latest := EXTRACT(EPOCH FROM (now() - v_latest))::INT;
    IF v_elapsed_since_latest < p_cooldown_seconds THEN
      v_remaining_cooldown := p_cooldown_seconds - v_elapsed_since_latest;
      RETURN QUERY SELECT 
        FALSE, 
        v_count, 
        v_remaining_cooldown, 
        'Please wait ' || v_remaining_cooldown || ' seconds before requesting another code.';
      RETURN;
    END IF;
  END IF;

  -- Check rolling window capacity
  IF v_count >= p_max_attempts THEN
    v_remaining_window := GREATEST(1, p_window_seconds - EXTRACT(EPOCH FROM (now() - v_oldest))::INT);
    RETURN QUERY SELECT 
      FALSE, 
      v_count, 
      v_remaining_window, 
      'Rate limit exceeded. Maximum ' || p_max_attempts || ' verification codes per hour.';
    RETURN;
  END IF;

  -- Record the allowed attempt atomically
  INSERT INTO public.otp_send_logs (email, ip_address, requested_at)
  VALUES (v_normalized_email, p_ip, now());

  RETURN QUERY SELECT 
    TRUE, 
    v_count + 1, 
    0, 
    'Verification code request allowed.';
  RETURN;
END;
$$;

-- Maintenance procedure to clean up stale rate-limit logs older than retention period
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_logs(p_retention_days INT DEFAULT 7)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM public.otp_send_logs
  WHERE requested_at < (now() - (p_retention_days || ' days')::INTERVAL);
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;
