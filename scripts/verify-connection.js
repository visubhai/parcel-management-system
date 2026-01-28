const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    try {
        // 1. Read .env.local manually
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("❌ .env.local file not found!");
            process.exit(1);
        }

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });

        const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
        const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        if (!url || !key) {
            console.error("❌ Missing keys in .env.local");
            process.exit(1);
        }

        console.log("Found Credentials:");
        console.log("URL:", url);
        console.log("Key:", key.substring(0, 10) + "...");

        // 2. Initialize Client
        const supabase = createClient(url, key);

        // 3. Test Query (fetch branches count)
        const { count, error } = await supabase
            .from('branches')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection Failed:", error.message);
            process.exit(1);
        }

        console.log("✅ Connection Successful!");
        console.log(`Access to 'branches' table verified. Row count: ${count ?? 0}`);

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        process.exit(1);
    }
}

testConnection();
