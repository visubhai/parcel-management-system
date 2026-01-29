-- =============================================================================
-- 00_DESTROY_ALL.sql
-- PURPOSE: COMPLETELY WIPE THE DATABASE (TABLES, TYPES, EXTENSIONS, FUNCTIONS)
-- WARNING: DATA LOSS IS PERMANENT
-- =============================================================================

BEGIN;

-- 1. DROP TABLES (Cascade to remove dependents)
DROP TABLE IF EXISTS parcel_status_history CASCADE;
DROP TABLE IF EXISTS payment_ledger CASCADE;
DROP TABLE IF EXISTS login_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS parcel_items CASCADE;
DROP TABLE IF EXISTS parcels CASCADE;
DROP TABLE IF EXISTS admin_report_permissions CASCADE;
DROP TABLE IF EXISTS admin_report_access CASCADE; -- Legacy table name match
DROP TABLE IF EXISTS lr_sequences CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- 2. DROP CUSTOM TYPES
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS parcel_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS item_type CASCADE;

-- 3. DROP FUNCTIONS & TRIGGERS
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS generate_lr_number CASCADE;
DROP FUNCTION IF EXISTS log_audit_event CASCADE;
DROP FUNCTION IF EXISTS get_my_role CASCADE;
DROP FUNCTION IF EXISTS get_my_branch CASCADE;
DROP FUNCTION IF EXISTS log_parcel_status_change CASCADE;
DROP FUNCTION IF EXISTS create_branch_user_safe CASCADE;
DROP FUNCTION IF EXISTS create_system_user CASCADE;

-- 4. CLEANUP AUTH TRIGGERS (Supabase Specific)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

COMMIT;

DO $$ BEGIN RAISE NOTICE 'DATABASE DESTROYED SUCCESSFULLY. READY FOR FRESH SETUP.'; END $$;
