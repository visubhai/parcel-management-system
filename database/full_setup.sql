-- =============================================================================
-- FULL SYSTEM SETUP - BRANCHES & USERS (FINAL FIX)
-- =============================================================================

-- 0. CLEANUP & PREP
-- We must drop the previous auto-create trigger because it conflicts with our bulk insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Insert Branches
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

-- 2. Create Users Function (Robust)
CREATE OR REPLACE FUNCTION create_system_user(
    p_username text, 
    p_password text, 
    p_branch_code text, 
    p_role text
) RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_branch_id uuid;
BEGIN
    v_email := lower(p_username) || '@abcd.com';
    
    -- Get Branch ID
    IF p_branch_code IS NOT NULL THEN
        SELECT id INTO v_branch_id FROM public.branches WHERE branch_code = p_branch_code;
    END IF;

    -- Check if user exists
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    -- If not exists, create
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
    END IF;

    -- Insert/Update public.app_users (Profile)
    INSERT INTO public.app_users (id, full_name, username, role, branch_id, allowed_branches)
    VALUES (
        v_user_id, 
        initcap(p_username), 
        p_username, 
        p_role::user_role, 
        v_branch_id,
        CASE WHEN v_branch_id IS NOT NULL THEN ARRAY[v_branch_id] ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        branch_id = EXCLUDED.branch_id;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Run User Creations
SELECT create_system_user('hirabagh', 'savan8980', 'HO', 'ADMIN');
SELECT create_system_user('katargam', 'savan4567', 'KA', 'ADMIN');
SELECT create_system_user('sahara', '1234', 'SA', 'ADMIN');
SELECT create_system_user('udhana', '1234', 'UD', 'ADMIN');
SELECT create_system_user('sachin', '1234', 'SC', 'ADMIN');

SELECT create_system_user('amdavad-ctm', 'savan6734', 'CTM', 'ADMIN');
SELECT create_system_user('bapunagar', '888942', 'BA', 'ADMIN');
SELECT create_system_user('paldi', '994142', 'PA', 'ADMIN');
SELECT create_system_user('setelite', '444245', 'SET', 'ADMIN');

SELECT create_system_user('mumbai-borivali', 'savan3456', 'BO', 'ADMIN');
SELECT create_system_user('mumbai-vasai', 'savan2356', 'VA', 'ADMIN');
SELECT create_system_user('mumbai-andheri', 'savan4598', 'AN', 'ADMIN');

SELECT create_system_user('rajkot-punitnagar', '1234', 'PU', 'ADMIN');
SELECT create_system_user('rajkot-limdachok', '1234', 'LI', 'ADMIN');

-- Super Admin
SELECT create_system_user('savan', '95008', NULL, 'SUPER_ADMIN');

-- 4. Clean up Helper
DROP FUNCTION create_system_user;
