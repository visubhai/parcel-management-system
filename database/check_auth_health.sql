-- =============================================================================
-- AUTH HEALTH CHECK
-- =============================================================================

-- 1. Can we read from auth.users?
SELECT count(*) as total_users FROM auth.users;

-- 2. Can we read one user?
SELECT id, email FROM auth.users LIMIT 5;
