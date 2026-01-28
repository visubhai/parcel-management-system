-- =============================================================================
-- FORCE CLEANUP SCRIPT (AGRESSIVE)
-- =============================================================================

-- 1. Drop the specific trigger (CASCADE to kill dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- 2. Drop the function (CASCADE)
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- 3. Just in case it was created in 'auth' schema incorrectly
DROP TRIGGER IF EXISTS on_auth_user_created ON public.app_users CASCADE;
