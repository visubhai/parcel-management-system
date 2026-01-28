const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the key provided by the user
const supabaseServiceKey = 'sb_secret_y6R8XwzZ1XhEiVEKlUFKuQ_Z7iBOVA6';

if (!supabaseServiceKey || !supabaseUrl) {
    console.error("Missing SUPABASE_URL or SERVICE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const USERS = [
    { username: 'hirabagh', password: 'savan8980', branch: 'HO', role: 'ADMIN' },
    { username: 'katargam', password: 'savan4567', branch: 'KA', role: 'ADMIN' },
    { username: 'sahara', password: '1234', branch: 'SA', role: 'ADMIN' },
    { username: 'udhana', password: '1234', branch: 'UD', role: 'ADMIN' },
    { username: 'sachin', password: '1234', branch: 'SC', role: 'ADMIN' },
    { username: 'amdavad-ctm', password: 'savan6734', branch: 'CTM', role: 'ADMIN' },
    { username: 'bapunagar', password: '888942', branch: 'BA', role: 'ADMIN' },
    { username: 'paldi', password: '994142', branch: 'PA', role: 'ADMIN' },
    { username: 'setelite', password: '444245', branch: 'SET', role: 'ADMIN' },
    { username: 'mumbai-borivali', password: 'savan3456', branch: 'BO', role: 'ADMIN' },
    { username: 'mumbai-vasai', password: 'savan2356', branch: 'VA', role: 'ADMIN' },
    { username: 'mumbai-andheri', password: 'savan4598', branch: 'AN', role: 'ADMIN' },
    { username: 'rajkot-punitnagar', password: '1234', branch: 'PU', role: 'ADMIN' },
    { username: 'rajkot-limdachok', password: '1234', branch: 'LI', role: 'ADMIN' },
    { username: 'savan', password: '95008', branch: null, role: 'SUPER_ADMIN' }
];

async function seedUsers() {
    console.log("Starting User Seed process...");

    // 1. Fetch Branches for ID mapping
    const { data: branches, error: branchError } = await supabase.from('branches').select('id, branch_code');
    if (branchError) {
        console.error("Failed to fetch branches:", branchError);
        return;
    }

    const branchMap = {};
    branches.forEach(b => branchMap[b.branch_code] = b.id);
    console.log(`Loaded ${branches.length} branches.`);

    // 2. Process Users
    for (const u of USERS) {
        const email = `${u.username}@abcd.com`;
        let userId;

        // A. Create Auth User
        const { data: createdData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: u.password,
            email_confirm: true,
            user_metadata: { username: u.username }
        });

        if (createError) {
            // Check if user already exists
            if (createError.message.includes('already registered')) {
                const { data: listData } = await supabase.auth.admin.listUsers();
                const existing = listData.users.find(x => x.email === email);
                if (existing) userId = existing.id;
            } else {
                console.error(`Failed to create ${u.username}:`, createError.message);
                continue;
            }
        } else {
            userId = createdData.user.id;
            console.log(`Created Auth User: ${u.username}`);
        }

        if (!userId) {
            console.error(`Could not resolve ID for ${u.username}`);
            continue;
        }

        // B. Update/Create Profile
        const branchId = u.branch ? branchMap[u.branch] : null;

        const { error: profileError } = await supabase.from('app_users').upsert({
            id: userId,
            full_name: u.username.charAt(0).toUpperCase() + u.username.slice(1),
            username: u.username,
            role: u.role,
            branch_id: branchId,
            allowed_branches: branchId ? [branchId] : null,
            is_active: true
        });

        if (profileError) {
            console.error(`Failed to update profile for ${u.username}:`, profileError.message);
        } else {
            console.log(`Updated Profile: ${u.username}`);
        }
    }
    console.log("Seeding Complete.");
}

seedUsers();
