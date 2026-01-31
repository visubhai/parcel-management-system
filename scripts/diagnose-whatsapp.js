const http = require('http');

const payload = JSON.stringify({
    mobile: '919999999999', // Dummy number for connection test
    message: 'Test message from diagnostic script'
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

console.log('🔍 Diagnosing WhatsApp Service...');
console.log('1. Attempting to connect to http://localhost:3001/send...');

const req = http.request(options, (res) => {
    console.log(`✅ Connection Successful! Status Code: ${res.statusCode}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('   Response Body:', data);
        if (res.statusCode === 503) {
            console.log('\n⚠️ Service is running but WhatsApp Client is NOT READY.');
            console.log('   Action: Check the terminal running "npm run whatsapp" and scan the QR code.');
        } else if (res.statusCode === 200) {
            console.log('\n✅ Service is READY and responding correctly.');
        } else {
            console.log('\n⚠️ Unexpected response from service.');
        }
    });
});

req.on('error', (error) => {
    console.error('\n❌ Connection Failed:', error.message);
    console.log('\nPossible Causes:');
    console.log('1. The service is not running. Did you run "npm run whatsapp"?');
    console.log('2. The service crashed.');
    console.log('3. Port 3001 is blocked or in use.');
});

req.write(payload);
req.end();
