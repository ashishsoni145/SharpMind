-- Restrict access to OTP request logs and harden the SECURITY DEFINER routines.
-- Kept separate from 20261014000002 so already-applied migration history remains immutable.

REVOKE ALL ON TABLE public.otp_send_logs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.otp_send_logs TO service_role;

ALTER FUNCTION public.check_and_record_otp_send(TEXT, INT, INT, INT, TEXT)
  SET search_path = pg_catalog, public;
REVOKE ALL ON FUNCTION public.check_and_record_otp_send(TEXT, INT, INT, INT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_otp_send(TEXT, INT, INT, INT, TEXT)
  TO service_role;

ALTER FUNCTION public.cleanup_expired_otp_logs(INT)
  SET search_path = pg_catalog, public;
REVOKE ALL ON FUNCTION public.cleanup_expired_otp_logs(INT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otp_logs(INT)
  TO service_role;
