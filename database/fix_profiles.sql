-- =============================================================================
-- FIX PROFILES SCRIPT
-- Syncs 'auth.users' with 'public.app_users'
-- =============================================================================

DO $$
DECLARE
    r RECORD;
    v_username TEXT;
    v_branch_code TEXT;
    v_branch_id UUID;
    v_role TEXT;
BEGIN
    FOR r IN SELECT * FROM auth.users LOOP
        -- Extract username from email (e.g., 'hirabagh@abcd.com' -> 'hirabagh')
        v_username := split_part(r.email, '@', 1);
        
        -- Determine Config based on Username
        v_branch_code := CASE 
            WHEN v_username = 'hirabagh' THEN 'HO'
            WHEN v_username = 'katargam' THEN 'KA'
            WHEN v_username = 'sahara' THEN 'SA'
            WHEN v_username = 'udhana' THEN 'UD'
            WHEN v_username = 'sachin' THEN 'SC'
            WHEN v_username = 'amdavad-ctm' THEN 'CTM'
            WHEN v_username = 'bapunagar' THEN 'BA'
            WHEN v_username = 'paldi' THEN 'PA'
            WHEN v_username = 'setelite' THEN 'SET'
            WHEN v_username = 'mumbai-borivali' THEN 'BO'
            WHEN v_username = 'mumbai-vasai' THEN 'VA'
            WHEN v_username = 'mumbai-andheri' THEN 'AN'
            WHEN v_username = 'rajkot-punitnagar' THEN 'PU'
            WHEN v_username = 'rajkot-limdachok' THEN 'LI'
            ELSE NULL
        END;

        v_role := CASE 
            WHEN v_username = 'savan' THEN 'SUPER_ADMIN'
            ELSE 'ADMIN' 
        END;

        -- Get Branch ID
        v_branch_id := NULL;
        IF v_branch_code IS NOT NULL THEN
            SELECT id INTO v_branch_id FROM public.branches WHERE branch_code = v_branch_code;
        END IF;

        -- UPSERT into app_users
        INSERT INTO public.app_users (id, full_name, username, role, branch_id, allowed_branches, is_active)
        VALUES (
            r.id,
            initcap(replace(v_username, '-', ' ')), -- e.g. "Amdavad Ctm"
            v_username,
            v_role::user_role,
            v_branch_id,
            CASE WHEN v_branch_id IS NOT NULL THEN ARRAY[v_branch_id] ELSE NULL END,
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            branch_id = EXCLUDED.branch_id,
            allowed_branches = EXCLUDED.allowed_branches,
            username = EXCLUDED.username;
            
        RAISE NOTICE 'Fixed Profile for: %', v_username;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
