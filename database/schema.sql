-- =============================================================================
-- PARCEL MANAGEMENT SYSTEM - ENTERPRISE DATABASE SCHEMA
-- Compatible with: Supabase (PostgreSQL)
-- Version: 1.0.0 Final
-- =============================================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES (Derived from src/lib/types.ts)
-- -----------------------------------------------------------------------------

-- User Roles: Matches `Rank` or `Role` in codebase
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- Parcel Statuses: Matches `ParcelStatus` type
CREATE TYPE parcel_status AS ENUM ('BOOKED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED');

-- Payment Types: Matches `PaymentStatus` type + 'MANUAL' for flexibility
CREATE TYPE payment_type AS ENUM ('PAID', 'TO_PAY', 'MANUAL');

-- Report Types: Matches `ReportType` type
CREATE TYPE report_type AS ENUM ('DAILY', 'REVENUE', 'BRANCH_WISE', 'PAYMENT', 'SENDER_RECEIVER');

-- Item Types: Matches `ItemType` type
CREATE TYPE item_type AS ENUM ('WHITE_SACK', 'CARTON', 'MANUAL');

-- -----------------------------------------------------------------------------
-- 2. CORE TABLES
-- -----------------------------------------------------------------------------

-- 2.1 BRANCHES
-- Central source of truth for all locations.
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    branch_code TEXT NOT NULL UNIQUE, -- Critical: Used for LR generation (e.g., 'SUR')
    address TEXT,
    city TEXT NOT NULL,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 APP USERS
-- Extends Supabase Auth. Maps 1:1 with `auth.users` via `id`.
CREATE TABLE app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE, -- For backward compatibility or internal search
    role user_role NOT NULL DEFAULT 'ADMIN',
    
    -- Permissions
    branch_id UUID REFERENCES branches(id), -- Primary Branch (Null for Super Admin)
    allowed_branches UUID[], -- Array of Branch IDs this user can view/manage
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Admins must have a home branch, Super Admins don't need one
    CONSTRAINT admin_must_have_branch CHECK (
        (role = 'SUPER_ADMIN') OR (role = 'ADMIN' AND branch_id IS NOT NULL)
    )
);

-- 2.3 ADMIN REPORT PERMISSIONS
-- Extensive permission control for Reports page (matches `allowedReports` in store)
CREATE TABLE admin_report_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    report_name report_type NOT NULL,
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, report_name)
);

-- 2.4 LR SEQUENCES
-- Manages atomic auto-incrementing numbers per branch (Lock-based)
CREATE TABLE lr_sequences (
    branch_id UUID PRIMARY KEY REFERENCES branches(id) ON DELETE CASCADE,
    last_sequence INTEGER DEFAULT 1000 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 PARCELS (Main Transaction Table)
-- Combines `Booking` and `IncomingParcel` concepts
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lr_number TEXT UNIQUE NOT NULL, -- Format: {BRANCH_CODE}/{SEQUENCE}
    
    -- Logistics
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    from_branch_id UUID NOT NULL REFERENCES branches(id),
    to_branch_id UUID NOT NULL REFERENCES branches(id),
    current_branch_id UUID REFERENCES branches(id), -- Tracks current location
    status parcel_status DEFAULT 'BOOKED',
    
    -- Parties
    sender_name TEXT NOT NULL,
    sender_mobile TEXT NOT NULL,
    sender_email TEXT,
    sender_gst TEXT,
    
    receiver_name TEXT NOT NULL,
    receiver_mobile TEXT NOT NULL,
    receiver_email TEXT,
    receiver_gst TEXT,
    
    -- Financials (Matches `costs` object in Booking type)
    payment_type payment_type NOT NULL DEFAULT 'TO_PAY',
    weight_total DECIMAL(10,2) DEFAULT 0,
    freight_charge DECIMAL(10,2) DEFAULT 0,
    handling_charge DECIMAL(10,2) DEFAULT 0,
    hamali_charge DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    booked_by UUID REFERENCES app_users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 PARCEL ITEMS
-- Detailed items list within a parcel (Matches `parcels` array in Booking type)
CREATE TABLE parcel_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
    item_type item_type DEFAULT 'CARTON',
    quantity INTEGER NOT NULL DEFAULT 1,
    weight DECIMAL(10,2), -- in Kg
    rate DECIMAL(10,2), -- per unit/kg
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * rate) STORED,
    description TEXT
);

-- 2.7 AUDIT LOGS
-- Security requirement: Track every action
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by UUID DEFAULT auth.uid(),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. VIEWS
-- -----------------------------------------------------------------------------

-- View: Incoming Parcels
-- Used by `InboundTable` to show parcels arriving at a branch
CREATE OR REPLACE VIEW view_incoming_parcels AS
SELECT 
    p.id,
    p.lr_number,
    p.sender_name,
    p.receiver_name,
    b_from.name AS from_branch,
    b_to.name AS to_branch,
    p.status,
    p.payment_type AS payment_status,
    p.total_amount,
    p.to_branch_id, -- Needed for RLS filtering
    p.updated_at
FROM parcels p
JOIN branches b_from ON p.from_branch_id = b_from.id
JOIN branches b_to ON p.to_branch_id = b_to.id
WHERE p.status = 'IN_TRANSIT';

-- -----------------------------------------------------------------------------
-- 4. DATABASE FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function: Generate Next LR Number (Atomic)
CREATE OR REPLACE FUNCTION generate_lr_number(p_branch_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_branch_code TEXT;
    v_new_seq INTEGER;
    v_lr_number TEXT;
BEGIN
    SELECT branch_code INTO v_branch_code FROM branches WHERE id = p_branch_id;
    
    -- Lock row and increment
    UPDATE lr_sequences
    SET last_sequence = last_sequence + 1, updated_at = NOW()
    WHERE branch_id = p_branch_id
    RETURNING last_sequence INTO v_new_seq;
    
    v_lr_number := v_branch_code || '/' || v_new_seq;
    RETURN v_lr_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Update Timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Audit Logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 5. TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_parcels_timestamp BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_branches_timestamp BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER audit_parcels AFTER INSERT OR UPDATE OR DELETE ON parcels FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON app_users FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Helper Functions for Policies
CREATE OR REPLACE FUNCTION get_my_role() RETURNS user_role AS $$
BEGIN RETURN (SELECT role FROM app_users WHERE id = auth.uid()); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_branch() RETURNS UUID AS $$
BEGIN RETURN (SELECT branch_id FROM app_users WHERE id = auth.uid()); END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_report_access ENABLE ROW LEVEL SECURITY;

-- Policy: Branches
CREATE POLICY "Super Admin: Manage All" ON branches FOR ALL USING (get_my_role() = 'SUPER_ADMIN');
CREATE POLICY "Admin: View All" ON branches FOR SELECT USING (true);

-- Policy: Parcels
-- Super Admin sees all
CREATE POLICY "Super Admin: Manage All" ON parcels FOR ALL USING (get_my_role() = 'SUPER_ADMIN');
-- Admin sees: Origin, Destination, or Current Location matches their branch
CREATE POLICY "Admin: View Relevance" ON parcels FOR SELECT USING (
    get_my_role() = 'ADMIN' AND (
        from_branch_id = get_my_branch() OR 
        to_branch_id = get_my_branch() OR 
        current_branch_id = get_my_branch()
    )
);
-- Admin creates: Only from their own branch
CREATE POLICY "Admin: Create" ON parcels FOR INSERT WITH CHECK (
    get_my_role() = 'ADMIN' AND from_branch_id = get_my_branch()
);
-- Admin updates: Origin or Destination
CREATE POLICY "Admin: Update" ON parcels FOR UPDATE USING (
    get_my_role() = 'ADMIN' AND (from_branch_id = get_my_branch() OR to_branch_id = get_my_branch())
);

-- Policy: Admin Report Access
CREATE POLICY "Super Admin: Manage" ON admin_report_access FOR ALL USING (get_my_role() = 'SUPER_ADMIN');
CREATE POLICY "Admin: View Self" ON admin_report_access FOR SELECT USING (admin_id = auth.uid());

-- Policy: App Users
CREATE POLICY "Super Admin: Manage All" ON app_users FOR ALL USING (get_my_role() = 'SUPER_ADMIN');
CREATE POLICY "Admin: View Self" ON app_users FOR SELECT USING (id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_parcels_lr ON parcels(lr_number);
CREATE INDEX idx_parcels_dates ON parcels(booking_date);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_branches ON parcels(from_branch_id, to_branch_id);
CREATE INDEX idx_users_role ON app_users(role);
