const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or ANAL_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_PARCELS = [
    {
        sender: "Ramesh Bhai", receiver: "Suresh Store", phone: "9876543210",
        weight: 15, items: 3, amount: 450, type: "TO_PAY", status: "BOOKED", destination: "KA"
    },
    {
        sender: "Textile Market", receiver: "Fashion Hub", phone: "9898989898",
        weight: 50, items: 10, amount: 1200, type: "PAID", status: "IN_TRANSIT", destination: "SA"
    },
    {
        sender: "Diamond Traders", receiver: "Jewel Corp", phone: "9988776655",
        weight: 2, items: 1, amount: 5000, type: "MANUAL", status: "ARRIVED", destination: "BO"
    },
    {
        sender: "Alpha Traders", receiver: "Beta Shops", phone: "9876512345",
        weight: 5, items: 2, amount: 150, type: "TO_PAY", status: "BOOKED", destination: "UD"
    },
    {
        sender: "Gamma Logistics", receiver: "Delta Retail", phone: "8877665544",
        weight: 100, items: 20, amount: 2500, type: "PAID", status: "DELIVERED", destination: "SC"
    }
];

async function seedParcels() {
    console.log("Starting Parcel Seeding...");

    // 1. Login as 'hirabagh' (HO)
    console.log("Logging in as 'hirabagh'...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'hirabagh@abcd.com',
        password: 'savan8980'
    });

    if (authError) {
        console.error("Login failed:", authError.message);
        return;
    }

    console.log("Logged in:", authData.user.email);
    const userId = authData.user.id;

    // 2. Get Branches
    const { data: branches } = await supabase.from('branches').select('id, branch_code');
    const branchMap = {};
    branches.forEach(b => branchMap[b.branch_code] = b.id);

    const hoBranchId = branchMap['HO'];

    if (!hoBranchId) {
        console.error("Could not find HO branch");
        return;
    }

    // 3. Create Parcels
    for (let i = 0; i < MOCK_PARCELS.length; i++) {
        const p = MOCK_PARCELS[i];
        const destId = branchMap[p.destination];

        if (!destId) {
            console.log(`Skipping ${p.destination}: Branch not found`);
            continue;
        }

        // Generate LR Number manually to be safe or use RPC
        const lrNumber = `HO/${Date.now()}-${i}`;

        const { data, error } = await supabase.from('parcels').insert({
            lr_number: lrNumber,
            from_branch_id: hoBranchId,
            to_branch_id: destId,
            current_branch_id: hoBranchId, // Initially at HO
            sender_name: p.sender,
            sender_mobile: p.phone,
            receiver_name: p.receiver,
            receiver_mobile: p.phone,
            weight_total: p.weight,
            total_amount: p.amount,
            payment_type: p.type,
            status: p.status,
            booked_by: userId
        }).select();

        if (error) {
            console.error(`Failed to insert parcel ${i + 1}:`, error.message);
        } else {
            console.log(`Inserted Parcel: ${data[0].lr_number} -> ${p.destination}`);
        }
    }

    console.log("Seeding Complete.");
}

seedParcels();
