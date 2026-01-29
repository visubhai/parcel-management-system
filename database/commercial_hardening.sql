-- =============================================================================
-- DATABASE HARDENING (COMMERCIAL GRADE)
-- =============================================================================
-- 1. Soft Deletes (Replaces hard DELETE permissions)
-- 2. Financial Ledger (Track every penny)
-- 3. Strict Constraints
-- =============================================================================

-- 1. SOFT DELETE SYSTEM
-- Add deleted_at to core tables
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Rule: Application should filter 'WHERE deleted_at IS NULL'
-- We can also revoke DELETE permission from the role 'authenticated' if we were strictly using Postgres roles, 
-- but given Supabase RLS, we will control it via Policy.

-- 2. FINANCIAL LEDGER
-- Instead of just 'amount_paid' on a parcel, we track transactions.
CREATE TABLE IF NOT EXISTS payment_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE NO ACTION, -- Never auto-delete financial records
    amount DECIMAL(10,2) NOT NULL CHECK (amount != 0),
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')), -- Credit = Income, Debit = Refund
    description TEXT,
    recorded_by UUID REFERENCES app_users(id),
    branch_id UUID REFERENCES branches(id), -- Where the money was collected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Ledger
ALTER TABLE payment_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SA_VIEW_LEDGER" ON payment_ledger FOR SELECT 
USING (get_my_role() = 'SUPER_ADMIN');

-- Admins view ledger for their branch
CREATE POLICY "ADMIN_VIEW_LEDGER" ON payment_ledger FOR SELECT
USING (branch_id = get_my_branch());

-- 3. STATUS HISTORY (Audit Trail for lifecycle)
CREATE TABLE IF NOT EXISTS parcel_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
    old_status parcel_status,
    new_status parcel_status NOT NULL,
    changed_by UUID REFERENCES app_users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE parcel_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "VIEW_STATUS_HISTORY" ON parcel_status_history FOR SELECT
USING (
    get_my_role() = 'SUPER_ADMIN' OR 
    EXISTS (
        SELECT 1 FROM parcels p 
        WHERE p.id = parcel_status_history.parcel_id 
        AND (p.from_branch_id = get_my_branch() OR p.to_branch_id = get_my_branch())
    )
);

-- Trigger to auto-log status changes
CREATE OR REPLACE FUNCTION log_parcel_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO parcel_status_history (parcel_id, old_status, new_status, changed_by)
        VALUES (NEW.id, CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_parcel_status ON parcels;
CREATE TRIGGER trigger_log_parcel_status
AFTER INSERT OR UPDATE ON parcels
FOR EACH ROW EXECUTE FUNCTION log_parcel_status_change();

-- 4. SOFT DELETE POLICY UPDATES
-- We need to ensure normal SELECTS don't show deleted items if we rely on RLS, 
-- or we rely on Frontend to filter. RLS is safer.

-- Update Parcel Policy to exclude deleted
DROP POLICY IF EXISTS "ADMIN_SELECT_PARCELS" ON parcels;
CREATE POLICY "ADMIN_SELECT_PARCELS" ON parcels FOR SELECT
USING (
    (deleted_at IS NULL) AND -- HIDE DELETED
    get_my_role() = 'ADMIN' AND (
        from_branch_id = get_my_branch() OR
        to_branch_id = get_my_branch() OR
        current_branch_id = get_my_branch()
    )
);

-- Same for Super Admin (optional, maybe SA wants to see bins)
DROP POLICY IF EXISTS "SA_ALL_PARCELS" ON parcels;
CREATE POLICY "SA_ALL_PARCELS" ON parcels FOR ALL 
USING (get_my_role() = 'SUPER_ADMIN'); -- SA sees everything, even deleted (or add deleted_at IS NULL if preferred)

