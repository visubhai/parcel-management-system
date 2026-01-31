const fetch = require('node-fetch'); // NOTE: Assuming node-fetch is available or using built-in fetch in newer Node

// Polyfill for Node environments without global fetch (older node)
// If you are on Node 18+, this isn't needed, but safe to have.
// We'll use http module for zero-dependency safety.
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n🧪 WhatsApp Direct Test\n");
console.log("Enter the mobile number to send a test message to (e.g., 9999988888):");

rl.question('> ', (mobile) => {
    if (!mobile) {
        console.log("❌ No number entered.");
        rl.close();
        return;
    }

    const payload = JSON.stringify({
        mobile: mobile,
        message: "🔔 This is a test message from your Parcel System!"
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    console.log(`\n📨 Sending to ${mobile}...`);

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);

        res.on('end', () => {
            console.log(`\nResponse Code: ${res.statusCode}`);
            console.log(`Response Body: ${data}`);

            if (res.statusCode === 200) {
                console.log("\n✅ SUCCESS: Message request was accepted!");
                console.log("👉 Check your phone now.");
            } else if (res.statusCode === 503) {
                console.log("\n⚠️ FAILED: Service is NOT READY yet.");
                console.log("👉 Wait for '✅ WhatsApp Manager Client is READY!' in the other terminal.");
            } else {
                console.log("\n❌ FAILED: Unexpected error.");
            }
            rl.close();
        });
    });

    req.on('error', (e) => {
        console.error(`\n❌ ERROR: Could not connect to WhatsApp Service: ${e.message}`);
        console.log("👉 Make sure 'npm run whatsapp-reset' is still running!");
        rl.close();
    });

    req.write(payload);
    req.end();
});
