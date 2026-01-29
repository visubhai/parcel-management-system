-- =============================================================================
-- SEED CREDENTIALS (FINAL ROBUST VERSION)
-- =============================================================================

DO $$ BEGIN RAISE NOTICE 'Starting Seed Credentials Script (vFinal)...'; END $$;

-- 1. Ensure Extensions Exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Cleanup ANY potential conflict triggers from old setups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. FIX SCHEMA (If columns are missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='app_users' AND column_name='username') THEN
        RAISE NOTICE 'Adding missing username column to app_users table...';
        ALTER TABLE public.app_users ADD COLUMN username TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='app_users' AND column_name='allowed_branches') THEN
        RAISE NOTICE 'Adding missing allowed_branches column to app_users table...';
        ALTER TABLE public.app_users ADD COLUMN allowed_branches UUID[];
    END IF;
END $$;

-- 4. Clean up function if exists (to ensure fresh logic)
DROP FUNCTION IF EXISTS create_branch_user_safe;

-- 5. Define Helper Function
CREATE OR REPLACE FUNCTION create_branch_user_safe(
    p_username text, 
    p_password text, 
    p_branch_code text, 
    p_role text DEFAULT 'ADMIN'
) RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_branch_id uuid;
BEGIN
    v_email := lower(p_username) || '@abcd.com';
    RAISE NOTICE 'Processing User: % (%)', p_username, v_email;
    
    -- Get Branch ID
    IF p_branch_code IS NOT NULL THEN
        SELECT id INTO v_branch_id FROM public.branches WHERE branch_code = p_branch_code;
        IF v_branch_id IS NULL THEN
            RAISE EXCEPTION 'Error: Branch code % not found. Cannot create ADMIN user without valid branch.', p_branch_code;
        END IF;
    END IF;

    -- Check if user exists in AUTH
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    -- If not exists in AUTH, create
    IF v_user_id IS NULL THEN
        v_user_id := uuid_generate_v4();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', 
            v_user_id, 
            'authenticated', 
            'authenticated', 
            v_email, 
            crypt(p_password, gen_salt('bf')), 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            json_build_object('username', p_username), 
            now(), 
            now()
        );
    ELSE
        -- Update password if exists
        UPDATE auth.users 
        SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
        WHERE id = v_user_id;
    END IF;

    -- Upsert Profile in APP_USERS
    -- Note: We include 'email' and 'username' which might be new columns
    INSERT INTO public.app_users (
        id, 
        full_name, 
        username, 
        role, 
        branch_id, 
        allowed_branches, 
        email
    )
    VALUES (
        v_user_id, 
        initcap(p_username), 
        p_username, 
        p_role::user_role, 
        v_branch_id,
        CASE WHEN v_branch_id IS NOT NULL THEN ARRAY[v_branch_id] ELSE NULL END,
        v_email
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        branch_id = EXCLUDED.branch_id,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email; -- Ensure email is synced
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Ensure Branches Exist (Dependency for Admins)
INSERT INTO public.branches (name, branch_code, city, is_active) VALUES
('Hirabagh (HO)', 'HO', 'Surat', true),
('Katargam (KA)', 'KA', 'Surat', true),
('Sahara Darvaja (SA)', 'SA', 'Surat', true),
('Udhana (UD)', 'UD', 'Surat', true),
('Sachin (SC)', 'SC', 'Surat', true),
('Amdavad (CTM)', 'CTM', 'Ahmedabad', true),
('Bapunagar (BA)', 'BA', 'Ahmedabad', true),
('Paldi (PA)', 'PA', 'Ahmedabad', true),
('Setelite (SET)', 'SET', 'Ahmedabad', true),
('Mumbai Borivali (BO)', 'BO', 'Mumbai', true),
('Mumbai Vasai (VA)', 'VA', 'Mumbai', true),
('Mumbai Andheri (AN)', 'AN', 'Mumbai', true),
('Rajkot Punitnagar (PU)', 'PU', 'Rajkot', true),
('Rajkot Limdachok (LI)', 'LI', 'Rajkot', true)
ON CONFLICT (branch_code) DO NOTHING;


-- 7. Execute Seeding
-- We wrap in individual blocks or just run straight.
SELECT create_branch_user_safe('hirabagh', 'savan8980', 'HO');
SELECT create_branch_user_safe('katargam', 'savan4567', 'KA');
SELECT create_branch_user_safe('sahara', '1234', 'SA');
SELECT create_branch_user_safe('amdavad-ctm', 'savan6734', 'CTM');
SELECT create_branch_user_safe('mumbai-borivali', 'savan3456', 'BO');
SELECT create_branch_user_safe('mumbai-vasai', 'savan2356', 'VA');
SELECT create_branch_user_safe('mumbai-andheri', 'savan4598', 'AN');
SELECT create_branch_user_safe('rajkot-punitnagar', '1234', 'PU');
SELECT create_branch_user_safe('rajkot-limdachok', '1234', 'LI');
SELECT create_branch_user_safe('udhana', '1234', 'UD');
SELECT create_branch_user_safe('sachin', '1234', 'SC');
SELECT create_branch_user_safe('bapunagar', '888942', 'BA');
SELECT create_branch_user_safe('paldi', '994142', 'PA');
SELECT create_branch_user_safe('setelite', '444245', 'SET');

-- Super Admin
SELECT create_branch_user_safe('savan', '95008', NULL, 'SUPER_ADMIN');

-- 8. Cleanup Function
DROP FUNCTION create_branch_user_safe;

DO $$ BEGIN RAISE NOTICE 'Done. All users seeded successfully.'; END $$;
