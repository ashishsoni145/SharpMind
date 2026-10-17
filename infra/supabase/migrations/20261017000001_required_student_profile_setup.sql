-- Capture the minimum identity and academic details required before students enter the workspace.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS profile_setup_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Students who already completed the full onboarding wizard have already supplied these details.
UPDATE public.student_profiles
SET profile_setup_completed = TRUE
WHERE onboarding_completed = TRUE
  AND profile_setup_completed = FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_username_format_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format_check
      CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,24}$');
  END IF;
END;
$$;

-- Enforce username uniqueness case-insensitively across every profile.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_signup_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_username TEXT,
  p_grade_id TEXT
)
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  username TEXT,
  grade_id TEXT,
  profile_setup_completed BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF p_full_name IS NULL OR pg_catalog.char_length(pg_catalog.btrim(p_full_name)) < 2
     OR pg_catalog.char_length(pg_catalog.btrim(p_full_name)) > 100 THEN
    RAISE EXCEPTION 'Invalid full name' USING ERRCODE = '22023';
  END IF;

  IF p_username IS NULL OR p_username !~ '^[a-z0-9_]{3,24}$' THEN
    RAISE EXCEPTION 'Invalid username' USING ERRCODE = '22023';
  END IF;

  IF p_grade_id IS NULL OR p_grade_id NOT IN ('class_11', 'class_12', 'dropper') THEN
    RAISE EXCEPTION 'Invalid grade' USING ERRCODE = '22023';
  END IF;

  -- Serialize repeated completion attempts for the same authenticated profile.
  PERFORM 1
  FROM public.profiles AS p
  WHERE p.id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotent retries do not rewrite a profile after setup is complete.
  IF EXISTS (
    SELECT 1
    FROM public.student_profiles AS sp
    WHERE sp.user_id = p_user_id
      AND sp.profile_setup_completed = TRUE
  ) THEN
    RETURN QUERY
    SELECT p.id, p.full_name, p.username, sp.grade_id, sp.profile_setup_completed
    FROM public.profiles AS p
    JOIN public.student_profiles AS sp ON sp.user_id = p.id
    WHERE p.id = p_user_id;
    RETURN;
  END IF;

  UPDATE public.profiles AS p
  SET full_name = pg_catalog.btrim(p_full_name),
      username = p_username,
      updated_at = pg_catalog.now()
  WHERE p.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.student_profiles (
    user_id,
    grade_id,
    profile_setup_completed,
    updated_at
  )
  VALUES (
    p_user_id,
    p_grade_id,
    TRUE,
    pg_catalog.now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET grade_id = EXCLUDED.grade_id,
      profile_setup_completed = TRUE,
      updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT p.id, p.full_name, p.username, sp.grade_id, sp.profile_setup_completed
  FROM public.profiles AS p
  JOIN public.student_profiles AS sp ON sp.user_id = p.id
  WHERE p.id = p_user_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.complete_signup_profile(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_signup_profile(UUID, TEXT, TEXT, TEXT)
  TO service_role;
