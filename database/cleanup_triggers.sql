-- =============================================================================
-- CRITICAL CLEANUP SCRIPT
-- Run this if you are getting "Database error" during login or user creation.
-- =============================================================================

-- 1. Drop the triggers we might have created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 3. (Optional) Check what triggers exist
SELECT event_object_table, trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
