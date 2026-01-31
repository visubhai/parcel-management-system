const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const QRCode = require('qrcode');

// Configuration
const PORT = 3001;
const SESSION_PATH = './.wwebjs_auth';

// Initialize Express App
const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
    authTimeoutMs: 60000, // 60 seconds to auth
    qrMaxRetries: 0, // Forever
    puppeteer: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-features=site-per-process'
        ]
    }
});

let isReady = false;
let currentQR = null;

// 1. WhatsApp Event Listeners
client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

client.on('qr', (qr) => {
    console.log('⚡ QR Code generated! Please scan it.');
    currentQR = qr;
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Syncing: ' + percent + '%', message || '');
    currentQR = null; // Clear QR once loading starts
});

client.on('authenticated', () => {
    console.log('🔑 Authenticated! Loading client...');
    currentQR = null;
});

client.on('ready', () => {
    console.log('\n✅ WhatsApp Manager Client is READY!');
    console.log('   Session restored/saved. You can now receive background requests.');
    isReady = true;
    currentQR = null;
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    isReady = false;
});

client.on('disconnected', (reason) => {
    console.log('❌ Client was disconnected:', reason);
    isReady = false;
});

// 2. Web Interface for QR Code
app.get('/', async (req, res) => {
    if (isReady) {
        return res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: green;">✅ Service Is Ready</h1>
                    <p>WhatsApp is connected and running.</p>
                </body>
            </html>
        `);
    }

    if (!currentQR) {
        return res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>⏳ Waiting for QR Code...</h1>
                    <p>Please wait for the service to generate a code.</p>
                    <script>setTimeout(() => location.reload(), 2000);</script>
                </body>
            </html>
        `);
    }

    try {
        const url = await QRCode.toDataURL(currentQR);
        res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>📱 Scan with WhatsApp</h1>
                    <p>Open WhatsApp on your phone -> Linked Devices -> Link a Device</p>
                    <img src="${url}" style="width: 300px; height: 300px; border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
                    <br><br>
                    <p>Page auto-refreshes...</p>
                    <script>setTimeout(() => location.reload(), 5000);</script>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});

// 3. API Endpoint for Application Trigger
app.post('/send', async (req, res) => {
    console.log('📥 Received /send request:', JSON.stringify(req.body));

    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client not ready yet.' });
    }

    const { mobile, message } = req.body;

    if (!mobile || !message) {
        console.error('❌ Missing fields:', { mobile, message });
        return res.status(400).json({ error: 'Missing mobile or message' });
    }

    try {
        let sanitizedNumber = mobile.replace(/\D/g, '');
        if (sanitizedNumber.length === 10) {
            sanitizedNumber = '91' + sanitizedNumber;
        }

        const chatId = `${sanitizedNumber}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`[SENT] Message sent to ${mobile}`);

        return res.json({ success: true, status: 'Message sent' });
    } catch (error) {
        console.error(`[ERROR] Failed to send to ${mobile}:`, error);
        return res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

// 4. Start Services
async function start() {
    console.log('🚀 Starting WhatsApp Service...');

    app.listen(PORT, () => {
        console.log(`\n=============================================================`);
        console.log(`🌐 WEB QR CODE AVAILABLE AT: http://localhost:${PORT}`);
        console.log(`=============================================================\n`);
    });

    try {
        await client.initialize();
    } catch (err) {
        console.error('Failed to initialize client:', err);
    }
}

start();
