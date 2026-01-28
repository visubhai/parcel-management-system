-- =============================================================================
-- RESET AND SEED (SPECIFIC BRANCHES)
-- 1. Clears all existing parcels/items.
-- 2. Resets LR sequences.
-- 3. Generates new mock data for the specific requested branches.
-- =============================================================================

-- 1. RESET DATA
TRUNCATE TABLE parcel_items, parcels CASCADE;

-- Optional: Reset LR sequences to 1000 if you want fresh numbers
UPDATE lr_sequences SET last_sequence = 1000;


-- 2. SEED NEW DATA
DO $$
DECLARE
    -- The list of specific branch search terms provided by the user
    target_names TEXT[] := ARRAY[
        'hirabagh',
        'katargam',
        'sahara',
        'amdavad-ctm',
        'mumbai-borivali',
        'mumbai-vasai',
        'mumbai-andheri',
        'rajkot-punitnagar',
        'rajkot-limdachok',
        'udhana',
        'sachin',
        'bapunagar',
        'paldi',
        'setelite'
    ];
    
    v_branch_ids UUID[] := ARRAY[]::UUID[];
    v_temp_id UUID;
    v_name TEXT;
    
    v_from_id UUID;
    v_to_id UUID;
    v_parcel_id UUID;
    
    v_i INTEGER;
    v_status parcel_status;
    v_payment payment_type;
    v_total_amt DECIMAL;
    v_paid_amt DECIMAL;
    v_lr TEXT;
BEGIN
    -- A. Gather Branch IDs
    FOREACH v_name IN ARRAY target_names
    LOOP
        -- Search for branch ID matching the name
        -- Using ILIKE with wildcards to match "Hirabagh (HO)" with "hirabagh"
        SELECT id INTO v_temp_id FROM branches WHERE name ILIKE '%' || v_name || '%' LIMIT 1;
        
        IF v_temp_id IS NOT NULL THEN
            v_branch_ids := array_append(v_branch_ids, v_temp_id);
            RAISE NOTICE 'Found Branch: % -> %', v_name, v_temp_id;
        ELSE
            RAISE NOTICE 'Warning: specific branch not found for "%"', v_name;
        END IF;
    END LOOP;

    -- Safety Check
    IF array_length(v_branch_ids, 1) < 2 THEN
        RAISE EXCEPTION 'Not enough branches found (Found %). Need at least 2 to generate data.', array_length(v_branch_ids, 1);
    END IF;

    -- B. Generate 100 Mock Parcels
    FOR v_i IN 1..100 LOOP
        
        -- Pick Random Origin & Dest from our specific list
        LOOP
            v_from_id := v_branch_ids[1 + floor(random() * array_length(v_branch_ids, 1))::int];
            v_to_id := v_branch_ids[1 + floor(random() * array_length(v_branch_ids, 1))::int];
            EXIT WHEN v_from_id != v_to_id;
        END LOOP;

        -- Random Status Mix
        IF random() < 0.4 THEN v_status := 'BOOKED';
        ELSIF random() < 0.7 THEN v_status := 'IN_TRANSIT';
        ELSIF random() < 0.9 THEN v_status := 'DELIVERED';
        ELSE v_status := 'CANCELLED';
        END IF;

        -- Random Payment Mix
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
            amount_paid,
            created_at
        ) VALUES (
            v_lr,
            NOW() - (floor(random() * 14) || ' days')::INTERVAL, -- Past 2 weeks
            v_from_id,
            v_to_id,
            CASE WHEN v_status = 'DELIVERED' THEN v_to_id ELSE v_from_id END,
            v_status,
            'Customer ' || floor(random() * 1000),
            '98' || floor(random() * 10000000),
            'Receiver ' || floor(random() * 1000),
            '99' || floor(random() * 10000000),
            v_payment,
            floor(random() * 45) + 5,
            v_total_amt,
            v_paid_amt,
            NOW() - (floor(random() * 14) || ' days')::INTERVAL
        ) RETURNING id INTO v_parcel_id;

        -- Insert Items (1-3 cartons)
        INSERT INTO parcel_items (parcel_id, item_type, quantity, weight, rate, description)
        VALUES (
            v_parcel_id,
            'CARTON',
            floor(random() * 3) + 1,
            floor(random() * 15) + 5,
            120,
            'Textile Goods'
        );

    END LOOP;

    RAISE NOTICE 'Successfully generated 100 parcels for selected branches.';
END $$;
