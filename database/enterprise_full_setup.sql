-- =============================================================================
-- PARCEL MANAGEMENT SYSTEM - ENTERPRISE PRODUCTION SCHEMA
-- =============================================================================
-- STRICT SECURITY | RBAC | AUDIT LOGGING | RLS ENFORCED
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. CLEANUP & EXTENSIONS
-- -----------------------------------------------------------------------------
-- Safely drop existing objects to ensure a clean slate without destroying the whole schema
DROP TABLE IF EXISTS login_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_report_permissions CASCADE;
DROP TABLE IF EXISTS lr_sequences CASCADE;
DROP TABLE IF EXISTS parcels CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS parcel_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;

-- Drop Functions
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS generate_lr_number CASCADE;
DROP FUNCTION IF EXISTS log_audit_event CASCADE;
DROP FUNCTION IF EXISTS get_my_role CASCADE;
DROP FUNCTION IF EXISTS get_my_branch CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & TYPES
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN');
CREATE TYPE parcel_status AS ENUM ('BOOKED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_type AS ENUM ('PAID', 'TO_PAY', 'MANUAL');
CREATE TYPE report_type AS ENUM ('DAILY', 'REVENUE', 'BRANCH_WISE', 'PAYMENT', 'SENDER_RECEIVER');

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- 2.1 BRANCHES
-- Immutable branch codes require Super Admin intervention to change
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    branch_code TEXT NOT NULL UNIQUE, -- used for LR generation (e.g., 'SUR')
    address TEXT,
    city TEXT NOT NULL,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 APP USERS (RBAC Core)
-- Links 1:1 with auth.users
CREATE TABLE app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL, -- Cached for performance, helpful for reporting
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'ADMIN',
    
    -- Branch Association:
    -- SUPER_ADMIN: branch_id is NULL (Global Access)
    -- ADMIN: branch_id is MANDATORY (Restricted Access)
    branch_id UUID REFERENCES branches(id),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT admin_requires_branch CHECK (
        (role = 'SUPER_ADMIN') OR (role = 'ADMIN' AND branch_id IS NOT NULL)
    ),
    CONSTRAINT super_admin_no_branch CHECK (
        (role != 'SUPER_ADMIN') OR (branch_id IS NULL)
    )
);

-- 2.3 PARCELS (Core Transaction Data)
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lr_number TEXT UNIQUE NOT NULL, -- Format: {BRANCH}/{SEQ}
    
    -- Logistics
    from_branch_id UUID NOT NULL REFERENCES branches(id),
    to_branch_id UUID NOT NULL REFERENCES branches(id),
    current_branch_id UUID NOT NULL REFERENCES branches(id),
    status parcel_status NOT NULL DEFAULT 'BOOKED',
    
    -- Customer Info
    sender_name TEXT NOT NULL,
    sender_mobile TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_mobile TEXT NOT NULL,
    
    -- Financials
    payment_type payment_type NOT NULL DEFAULT 'TO_PAY',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    
    -- Metadata
    booked_by UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 LR SEQUENCES (Atomic Locking)
CREATE TABLE lr_sequences (
    branch_id UUID PRIMARY KEY REFERENCES branches(id) ON DELETE CASCADE,
    last_sequence INTEGER DEFAULT 1000 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 REPORT PERMISSIONS (Granular Access)
CREATE TABLE admin_report_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    is_allowed BOOLEAN DEFAULT true,
    granted_by UUID REFERENCES app_users(id), -- Audit who granted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, report_type)
);

-- 2.6 AUDIT LOGS (Security Compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by UUID DEFAULT auth.uid(),
    ip_address TEXT, -- Capturable via headers in some setups, or sent via app
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 LOGIN LOGS
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'FAILED_LOGIN'
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_parcels_lr ON parcels(lr_number);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_branches ON parcels(from_branch_id, to_branch_id, current_branch_id);
CREATE INDEX idx_parcels_date ON parcels(created_at);
CREATE INDEX idx_audit_time ON audit_logs(created_at DESC);
CREATE INDEX idx_users_role ON app_users(role);

-- -----------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------------------

-- 4.1 Update Timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Generate LR Number (Atomic)
CREATE OR REPLACE FUNCTION generate_lr_number(p_branch_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_branch_code TEXT;
    v_new_seq INTEGER;
BEGIN
    SELECT branch_code INTO v_branch_code FROM branches WHERE id = p_branch_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid Branch ID'; END IF;

    -- Lock & Increment
    INSERT INTO lr_sequences (branch_id, last_sequence) 
    VALUES (p_branch_id, 1001)
    ON CONFLICT (branch_id) DO UPDATE 
    SET last_sequence = lr_sequences.last_sequence + 1, updated_at = NOW()
    RETURNING last_sequence INTO v_new_seq;
    
    RETURN v_branch_code || '/' || v_new_seq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 Audit Logging Trigger
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, performed_by)
    VALUES (
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        TG_OP, 
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
        auth.uid()
    );
    RETURN NULL; -- After trigger, return is ignored or NEW for Before
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
CREATE TRIGGER update_parcels_ts BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_branches_ts BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_ts BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER audit_parcels AFTER INSERT OR UPDATE OR DELETE ON parcels FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_branches AFTER INSERT OR UPDATE OR DELETE ON branches FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON app_users FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_perms AFTER INSERT OR UPDATE OR DELETE ON admin_report_permissions FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
-- "Deny All" by default is implicit once RLS is enabled.
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_report_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER: Get Current User Role & Branch --
-- NOTE: We use SECURITY DEFINER to allow these functions to read app_users even if RLS blocks logic
CREATE OR REPLACE FUNCTION get_my_role() 
RETURNS user_role AS $$ 
    SELECT role FROM app_users WHERE id = auth.uid() LIMIT 1; 
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_branch() 
RETURNS UUID AS $$ 
    SELECT branch_id FROM app_users WHERE id = auth.uid() LIMIT 1; 
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5.1 BRANCHES
-- Super Admin: Full Control
CREATE POLICY "SA_ALL_BRANCHES" ON branches FOR ALL 
USING (get_my_role() = 'SUPER_ADMIN');

-- Admin: Read Only (Allows viewing branch names for potential destinations)
CREATE POLICY "ADMIN_VIEW_BRANCHES" ON branches FOR SELECT 
USING (get_my_role() = 'ADMIN');

-- 5.2 APP USERS
-- Super Admin: Manage All
CREATE POLICY "SA_MANAGE_USERS" ON app_users FOR ALL 
USING (get_my_role() = 'SUPER_ADMIN');

-- Admin: View Self Only
CREATE POLICY "ADMIN_VIEW_SELF" ON app_users FOR SELECT 
USING (id = auth.uid());

-- 5.3 PARCELS (The Critical Part)
-- Super Admin: Full Access
CREATE POLICY "SA_ALL_PARCELS" ON parcels FOR ALL 
USING (get_my_role() = 'SUPER_ADMIN');

-- Admin Select: Related Branches Only
CREATE POLICY "ADMIN_SELECT_PARCELS" ON parcels FOR SELECT
USING (
    get_my_role() = 'ADMIN' AND (
        from_branch_id = get_my_branch() OR
        to_branch_id = get_my_branch() OR
        current_branch_id = get_my_branch()
    )
);

-- Admin Insert: Only from Own Branch
CREATE POLICY "ADMIN_INSERT_PARCELS" ON parcels FOR INSERT
WITH CHECK (
    get_my_role() = 'ADMIN' AND
    from_branch_id = get_my_branch()
);

-- Admin Update: Only if involved
CREATE POLICY "ADMIN_UPDATE_PARCELS" ON parcels FOR UPDATE
USING (
    get_my_role() = 'ADMIN' AND (
        from_branch_id = get_my_branch() OR
        to_branch_id = get_my_branch() OR
        current_branch_id = get_my_branch()
    )
);

-- Admin Delete: FORBIDDEN
-- No policy for DELETE means admins cannot delete parcels.

-- 5.4 REPORT PERMISSIONS
CREATE POLICY "SA_MANAGE_PERMS" ON admin_report_permissions FOR ALL
USING (get_my_role() = 'SUPER_ADMIN');

CREATE POLICY "ADMIN_VIEW_PERMS" ON admin_report_permissions FOR SELECT
USING (admin_id = auth.uid());

-- 5.5 AUDIT LOGS
CREATE POLICY "SA_VIEW_LOGS" ON audit_logs FOR SELECT
USING (get_my_role() = 'SUPER_ADMIN');

-- Admin: No access to logs
