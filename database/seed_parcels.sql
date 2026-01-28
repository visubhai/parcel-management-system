-- =============================================================================
-- SEED MOCK DATA FOR PARCELS (FIXED)
-- Run this in the Supabase SQL Editor to populate your database with test data.
-- =============================================================================

DO $$
DECLARE
    v_mumbai_id UUID;
    v_pune_id UUID;
    v_ahmedabad_id UUID;
    v_surat_id UUID;
    v_branches UUID[];
    
    v_from_id UUID;
    v_to_id UUID;
    
    v_i INTEGER;
    v_status parcel_status;
    v_payment payment_type;
    v_total_amt DECIMAL;
    v_paid_amt DECIMAL;
    v_lr TEXT;
    v_parcel_id UUID; -- To store the new parcel ID
BEGIN
    -- 1. Get Branch IDs
    SELECT id INTO v_mumbai_id FROM branches WHERE name ILIKE '%Mumbai%' LIMIT 1;
    SELECT id INTO v_pune_id FROM branches WHERE name ILIKE '%Pune%' LIMIT 1;
    SELECT id INTO v_ahmedabad_id FROM branches WHERE name ILIKE '%Ahmedabad%' LIMIT 1;
    SELECT id INTO v_surat_id FROM branches WHERE name ILIKE '%Surat%' LIMIT 1;

    -- Array of all branch IDs
    v_branches := ARRAY[v_mumbai_id, v_pune_id, v_ahmedabad_id, v_surat_id];
    v_branches := array_remove(v_branches, NULL);

    IF array_length(v_branches, 1) < 2 THEN
        RAISE NOTICE 'Not enough branches found to generate inter-branch parcels.';
        RETURN;
    END IF;

    -- 2. Ensure LR Sequences exist
    INSERT INTO lr_sequences (branch_id, last_sequence)
    SELECT id, 1000 FROM branches
    WHERE id NOT IN (SELECT branch_id FROM lr_sequences);

    -- 3. Generate 50 Mock Parcels
    FOR v_i IN 1..50 LOOP
        -- Random Origin/Dest
        LOOP
            v_from_id := v_branches[1 + floor(random() * array_length(v_branches, 1))::int];
            v_to_id := v_branches[1 + floor(random() * array_length(v_branches, 1))::int];
            EXIT WHEN v_from_id != v_to_id;
        END LOOP;

        -- Random Status
        IF random() < 0.4 THEN v_status := 'BOOKED';
        ELSIF random() < 0.7 THEN v_status := 'IN_TRANSIT';
        ELSIF random() < 0.9 THEN v_status := 'DELIVERED';
        ELSE v_status := 'CANCELLED';
        END IF;

        -- Random Payment
        IF random() < 0.6 THEN 
            v_payment := 'TO_PAY';
            v_total_amt := (floor(random() * 50) + 10) * 10;
            v_paid_amt := 0;
        ELSE 
            v_payment := 'PAID';
            v_total_amt := (floor(random() * 50) + 10) * 10;
            v_paid_amt := v_total_amt;
        END IF;

        -- Generate LR
        v_lr := generate_lr_number(v_from_id);

        -- Insert Parcel
        INSERT INTO parcels (
            lr_number,
            booking_date,
            from_branch_id,
            to_branch_id,
            current_branch_id,
            status,
            sender_name,
            sender_mobile,
            receiver_name,
            receiver_mobile,
            payment_type,
            weight_total,
            total_amount,
            amount_paid
        ) VALUES (
            v_lr,
            NOW() - (floor(random() * 10) || ' days')::INTERVAL,
            v_from_id,
            v_to_id,
            CASE WHEN v_status = 'DELIVERED' THEN v_to_id ELSE v_from_id END, -- Simplify current location
            v_status,
            'Sender ' || floor(random() * 1000),
            '98765' || floor(random() * 100000),
            'Receiver ' || floor(random() * 1000),
            '91234' || floor(random() * 100000),
            v_payment,
            floor(random() * 50) + 1,
            v_total_amt,
            v_paid_amt
        ) RETURNING id INTO v_parcel_id;

        -- Insert Parcel Item (1-3 random items)
        INSERT INTO parcel_items (parcel_id, item_type, quantity, weight, description)
        VALUES (
            v_parcel_id,
            'CARTON',
            floor(random() * 5) + 1,
            floor(random() * 20) + 1,
            'Mock Item Description'
        );

    END LOOP;

    RAISE NOTICE 'Successfully generated 50 mock parcels with items.';
END $$;
