-- =============================================================================
-- HARD RESET AUTH
-- DANGER: This removes all users to fix the "Database Error".
-- =============================================================================

-- 1. Truncate (Clear) the tables
TRUNCATE TABLE public.app_users CASCADE;
TRUNCATE TABLE auth.users CASCADE;

-- 2. Verify they are empty
SELECT count(*) as auth_users_count FROM auth.users;
SELECT count(*) as app_users_count FROM public.app_users;
