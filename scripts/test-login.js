const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("Testing Login for: hirabagh@abcd.com");

    // 1. Try Login
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'hirabagh@abcd.com',
        password: 'savan8980'
    });

    if (error) {
        console.error("LOGIN FAILED:", error);
    } else {
        console.log("LOGIN SUCCESS:", data.user.email);
        console.log("User ID:", data.user.id);
    }
}

testLogin();
