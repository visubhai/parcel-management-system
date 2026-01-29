-- =============================================================================
-- ENTERPRISE SEED DATA (v3 compatible)
-- =============================================================================
-- 1. Populates Branches
-- 2. Populates Parcels (linked to the first found Admin user)
-- =============================================================================

-- 1. SEED BRANCHES
-- We use ON CONFLICT DO NOTHING to avoid duplicates if re-run
INSERT INTO branches (name, branch_code, city, is_active) VALUES
    ('Hirabagh (HO)', 'HIRA', 'Surat', true),
    ('Katargam', 'KAT', 'Surat', true),
    ('Sahara', 'SAH', 'Surat', true),
    ('Udhana', 'UDH', 'Surat', true),
    ('Sachin', 'SAC', 'Surat', true),
    ('Amdavad (CTM)', 'AMD', 'Ahmedabad', true),
    ('Bapunagar', 'BAP', 'Ahmedabad', true),
    ('Paldi', 'PAL', 'Ahmedabad', true),
    ('Satellite', 'SAT', 'Ahmedabad', true),
    ('Mumbai (Borivali)', 'MUM-BOR', 'Mumbai', true),
    ('Mumbai (Vasai)', 'MUM-VAS', 'Mumbai', true),
    ('Mumbai (Andheri)', 'MUM-AND', 'Mumbai', true),
    ('Rajkot (Punitnagar)', 'RAJ-PUN', 'Rajkot', true),
    ('Rajkot (Limdachok)', 'RAJ-LIM', 'Rajkot', true)
ON CONFLICT (branch_code) DO NOTHING;

-- 2. GENERATE PARCELS
DO $$
DECLARE
    v_admin_id UUID;
    v_branch_ids UUID[];
    v_from_id UUID;
    v_to_id UUID;
    v_status parcel_status;
    v_payment payment_type;
    v_total_amt DECIMAL;
    v_lr TEXT;
    v_i INTEGER;
BEGIN
    -- Get a valid user to "book" these parcels (Required by FK)
    SELECT id INTO v_admin_id FROM app_users LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'No Admin User found in app_users. Please create your Super Admin first.';
    END IF;

    -- Get all branch IDs
    SELECT array_agg(id) INTO v_branch_ids FROM branches;

    -- Generate 50 Mock Parcels
    FOR v_i IN 1..50 LOOP
        -- Random From/To
        v_from_id := v_branch_ids[1 + floor(random() * array_length(v_branch_ids, 1))::int];
        v_to_id := v_branch_ids[1 + floor(random() * array_length(v_branch_ids, 1))::int];
        
        -- Prevent same branch booking
        IF v_from_id = v_to_id THEN
            CONTINUE;
        END IF;

        -- Random Status
        IF random() < 0.3 THEN v_status := 'BOOKED';
        ELSIF random() < 0.6 THEN v_status := 'IN_TRANSIT';
        ELSIF random() < 0.8 THEN v_status := 'ARRIVED';
        ELSE v_status := 'DELIVERED';
        END IF;

        -- Random Payment
        IF random() < 0.5 THEN v_payment := 'PAID';
        ELSE v_payment := 'TO_PAY';
        END IF;

        v_total_amt := (floor(random() * 50) + 10) * 10;

        -- Generate LR (using the function we defined)
        v_lr := generate_lr_number(v_from_id);

        INSERT INTO parcels (
            lr_number,
            from_branch_id,
            to_branch_id,
            current_branch_id,
            status,
            sender_name,
            sender_mobile,
            receiver_name,
            receiver_mobile,
            payment_type,
            total_amount,
            amount_paid,
            booked_by,
            created_at
        ) VALUES (
            v_lr,
            v_from_id,
            v_to_id,
            CASE WHEN v_status = 'DELIVERED' THEN v_to_id ELSE v_from_id END,
            v_status,
            'Sender ' || floor(random() * 100),
            '98765' || floor(random() * 100000)::text,
            'Receiver ' || floor(random() * 100),
            '91234' || floor(random() * 100000)::text,
            v_payment,
            v_total_amt,
            CASE WHEN v_payment = 'PAID' THEN v_total_amt ELSE 0 END,
            v_admin_id,
            NOW() - (floor(random() * 10) || ' days')::INTERVAL
        );
    END LOOP;
    
    RAISE NOTICE 'Seeding Complete: Created 50 Parcels.';
END $$;
