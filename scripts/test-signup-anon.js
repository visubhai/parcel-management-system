const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test_user_${Date.now()}@test.com`;
    console.log("Testing Signup for:", email);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123'
    });

    if (error) {
        console.error("SIGNUP FAILED:", error);
    } else {
        console.log("SIGNUP SUCCESS:", data.user.id);
    }
}

testSignup();
