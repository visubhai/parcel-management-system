-- =============================================================================
-- SEED DATA - PARCEL MANAGEMENT SYSTEM
-- =============================================================================

-- 1. Insert Branches (Derived from User Image)
-- Codes extracted from brackets e.g. (HO)
-- Cities inferred from names (Default: Surat)

INSERT INTO branches (name, branch_code, city, is_active) VALUES
-- Surat
('Hirabagh (HO)', 'HO', 'Surat', true),
('Katargam (KA)', 'KA', 'Surat', true),
('Sahara Darvaja (SA)', 'SA', 'Surat', true),
('Udhana (UD)', 'UD', 'Surat', true),
('Sachin (SC)', 'SC', 'Surat', true),

-- Ahmedabad
('Amdavad (CTM)', 'CTM', 'Ahmedabad', true),
('Bapunagar (BA)', 'BA', 'Ahmedabad', true),
('Paldi (PA)', 'PA', 'Ahmedabad', true),
('Setelite (SET)', 'SET', 'Ahmedabad', true),

-- Mumbai
('Mumbai Borivali (BO)', 'BO', 'Mumbai', true),
('Mumbai Vasai (VA)', 'VA', 'Mumbai', true),
('Mumbai Andheri (AN)', 'AN', 'Mumbai', true),

-- Rajkot
('Rajkot Punitnagar (PU)', 'PU', 'Rajkot', true),
('Rajkot Limdachok (LI)', 'LI', 'Rajkot', true)
ON CONFLICT (branch_code) DO NOTHING;

-- 2. Initialize LR Sequences
-- Ensure a sequence exists for every branch
INSERT INTO lr_sequences (branch_id, last_sequence)
SELECT id, 1000 FROM branches
ON CONFLICT (branch_id) DO NOTHING;

-- 3. User Setup Instructions
-- Since Supabase Auth requires Email, we map Usernames to Emails.
-- e.g., hirabagh -> hirabagh@abcd.com

/*
    USER CREDENTIALS (from image):
    ---------------------------------------------------
    Username           | Password     | Branch Code
    -------------------|--------------|----------------
    hirabagh           | savan8980    | HO
    katargam           | savan4567    | KA
    sahara             | 1234         | SA
    amdavad-ctm        | savan6734    | CTM
    mumbai-borivali    | savan3456    | BO
    mumbai-vasai       | savan2356    | VA
    mumbai-andheri     | savan4598    | AN
    rajkot-punitnagar  | 1234         | PU
    rajkot-limdachok   | 1234         | LI
    udhana             | 1234         | UD
    sachin             | 1234         | SC
    bapunagar          | 888942       | BA
    paldi              | 994142       | PA
    setelite           | 444245       | SET
    
    SUPER ADMIN:
    savan              | 95008        | (All Access)
    ---------------------------------------------------
*/
