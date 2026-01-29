-- =============================================================================
-- 01_FULL_SYSTEM_SETUP.sql
-- PURPOSE: ONE-CLICK SETUP FOR ENTIRE SYSTEM (SCHEMA + DATA)
-- INCLUDES: Tables, RLS, Functions, Hardening, Branches, Admins, Super Admin
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. ENUMS & TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN');
CREATE TYPE parcel_status AS ENUM ('BOOKED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_type AS ENUM ('PAID', 'TO_PAY', 'MANUAL');
CREATE TYPE report_type AS ENUM ('DAILY', 'REVENUE', 'BRANCH_WISE', 'PAYMENT', 'SENDER_RECEIVER');
CREATE TYPE item_type AS ENUM ('WHITE_SACK', 'CARTON', 'MANUAL');

-- -----------------------------------------------------------------------------
-- 3. TABLES
-- -----------------------------------------------------------------------------

-- 3.1 BRANCHES
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    branch_code TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT NOT NULL,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft Delete support
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 APP USERS
CREATE TABLE app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, -- Cached email
    username TEXT UNIQUE, -- Simple username login support
    password_hint TEXT, -- Stored for admin reference (Note: Real auth uses Supabase)
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'ADMIN',
    
    branch_id UUID REFERENCES branches(id),
    allowed_branches UUID[], -- For multi-branch access
    
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT admin_requires_branch CHECK (
        (role = 'SUPER_ADMIN') OR (role = 'ADMIN' AND branch_id IS NOT NULL)
    ),
    CONSTRAINT super_admin_no_branch CHECK (
        (role != 'SUPER_ADMIN') OR (branch_id IS NULL)
    )
);

-- 3.3 PARCELS
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lr_number TEXT UNIQUE NOT NULL,
    
    from_branch_id UUID NOT NULL REFERENCES branches(id),
    to_branch_id UUID NOT NULL REFERENCES branches(id),
    current_branch_id UUID NOT NULL REFERENCES branches(id),
    status parcel_status NOT NULL DEFAULT 'BOOKED',
    
    sender_name TEXT NOT NULL,
    sender_mobile TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_mobile TEXT NOT NULL,
    
    payment_type payment_type NOT NULL DEFAULT 'TO_PAY',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    
    booked_by UUID NOT NULL REFERENCES app_users(id),
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 PARCEL ITEMS
CREATE TABLE parcel_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
    item_type item_type DEFAULT 'CARTON',
    quantity INTEGER NOT NULL DEFAULT 1,
    weight DECIMAL(10,2),
    rate DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * rate) STORED,
    description TEXT
);

-- 3.5 LR SEQUENCES
CREATE TABLE lr_sequences (
    branch_id UUID PRIMARY KEY REFERENCES branches(id) ON DELETE CASCADE,
    last_sequence INTEGER DEFAULT 1000 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 PAYMENT LEDGER (Commercial Hardening)
CREATE TABLE payment_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE NO ACTION,
    amount DECIMAL(10,2) NOT NULL CHECK (amount != 0),
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    description TEXT,
    recorded_by UUID REFERENCES app_users(id),
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 STATUS HISTORY
CREATE TABLE parcel_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
    old_status parcel_status,
    new_status parcel_status NOT NULL,
    changed_by UUID REFERENCES app_users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- Timestamp Updater
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- LR Generator
CREATE OR REPLACE FUNCTION generate_lr_number(p_branch_id UUID) RETURNS TEXT AS $$
DECLARE
    v_branch_code TEXT;
    v_new_seq INTEGER;
BEGIN
    SELECT branch_code INTO v_branch_code FROM branches WHERE id = p_branch_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid Branch ID'; END IF;
    
    INSERT INTO lr_sequences (branch_id, last_sequence) VALUES (p_branch_id, 1001)
    ON CONFLICT (branch_id) DO UPDATE SET last_sequence = lr_sequences.last_sequence + 1, updated_at = NOW()
    RETURNING last_sequence INTO v_new_seq;
    
    RETURN v_branch_code || '/' || v_new_seq;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit Logger
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, 
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
            CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
            auth.uid());
    RETURN NULL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
CREATE TRIGGER update_parcels_ts BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER audit_parcels AFTER INSERT OR UPDATE OR DELETE ON parcels FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON app_users FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- -----------------------------------------------------------------------------
-- 5. RLS POLICIES (Simplified for Context)
-- -----------------------------------------------------------------------------
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

-- Helper
CREATE OR REPLACE FUNCTION get_my_role() RETURNS user_role AS $$ 
    SELECT role FROM app_users WHERE id = auth.uid() LIMIT 1; 
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_branch() RETURNS UUID AS $$ 
    SELECT branch_id FROM app_users WHERE id = auth.uid() LIMIT 1; 
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policies
CREATE POLICY "SA_ALL" ON parcels FOR ALL USING (get_my_role() = 'SUPER_ADMIN');
CREATE POLICY "ADMIN_VIEW" ON parcels FOR SELECT USING (
    get_my_role() = 'ADMIN' AND (from_branch_id = get_my_branch() OR to_branch_id = get_my_branch() OR current_branch_id = get_my_branch())
);
CREATE POLICY "ADMIN_INSERT" ON parcels FOR INSERT WITH CHECK (
    get_my_role() = 'ADMIN' AND from_branch_id = get_my_branch()
);
-- (Add other policies as needed, keeping it concise for this file)

-- -----------------------------------------------------------------------------
-- 6. DATA SEEDING (BRANCHES & USERS)
-- -----------------------------------------------------------------------------

-- 6.1 Branches
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

-- 6.2 Users (Helper Function)
CREATE OR REPLACE FUNCTION create_branch_user_final(
    p_username text, p_password text, p_branch_code text, p_role text DEFAULT 'ADMIN'
) RETURNS void AS $$
DECLARE
    v_user_id uuid;
    v_email text;
    v_branch_id uuid;
BEGIN
    v_email := lower(p_username) || '@abcd.com';
    
    IF p_branch_code IS NOT NULL THEN
        SELECT id INTO v_branch_id FROM public.branches WHERE branch_code = p_branch_code;
    END IF;

    -- Create in Auth
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    IF v_user_id IS NULL THEN
        v_user_id := uuid_generate_v4();
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
        VALUES (v_user_id, 'authenticated', 'authenticated', v_email, crypt(p_password, gen_salt('bf')), now(), json_build_object('username', p_username));
    ELSE
        UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf')) WHERE id = v_user_id;
    END IF;

    -- Create Profile
    INSERT INTO public.app_users (id, full_name, username, role, branch_id, email, password_hint)
    VALUES (v_user_id, initcap(p_username), p_username, p_role::user_role, v_branch_id, v_email, p_password)
    ON CONFLICT (id) DO UPDATE SET 
        role = EXCLUDED.role, 
        branch_id = EXCLUDED.branch_id,
        password_hint = EXCLUDED.password_hint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 Create Users
SELECT create_branch_user_final('hirabagh', 'savan8980', 'HO');
SELECT create_branch_user_final('katargam', 'savan4567', 'KA');
SELECT create_branch_user_final('sahara', '1234', 'SA');
SELECT create_branch_user_final('amdavad-ctm', 'savan6734', 'CTM');
SELECT create_branch_user_final('mumbai-borivali', 'savan3456', 'BO');
SELECT create_branch_user_final('mumbai-vasai', 'savan2356', 'VA');
SELECT create_branch_user_final('mumbai-andheri', 'savan4598', 'AN');
SELECT create_branch_user_final('rajkot-punitnagar', '1234', 'PU');
SELECT create_branch_user_final('rajkot-limdachok', '1234', 'LI');
SELECT create_branch_user_final('udhana', '1234', 'UD');
SELECT create_branch_user_final('sachin', '1234', 'SC');
SELECT create_branch_user_final('bapunagar', '888942', 'BA');
SELECT create_branch_user_final('paldi', '994142', 'PA');
SELECT create_branch_user_final('setelite', '444245', 'SET');

-- Super Admin
SELECT create_branch_user_final('savan', '95008', NULL, 'SUPER_ADMIN');

-- Cleanup Helper
DROP FUNCTION create_branch_user_final;

COMMIT;

DO $$ BEGIN RAISE NOTICE 'FULL SYSTEM SETUP COMPLETED SUCCESSFULLY.'; END $$;
