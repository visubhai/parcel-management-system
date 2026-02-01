import { Client, LocalAuth } from 'whatsapp-web.js';
import { Express, Request, Response } from 'express';
import QRCode from 'qrcode';
import path from 'path';

class WhatsAppService {
    private client: Client;
    private isReady: boolean = false;
    private currentQR: string | null = null;
    private sessionPath: string;
    private logs: string[] = [];

    constructor() {
        this.log('Initializing WhatsApp Service...');
        this.sessionPath = path.resolve(__dirname, '../../../../.wwebjs_auth');

        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: this.sessionPath }),
            authTimeoutMs: 60000,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    '--disable-extensions',
                    '--disable-component-extensions-with-background-pages',
                    '--disable-default-apps',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--autoplay-policy=user-gesture-required',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-notifications',
                    '--disable-background-networking',
                    '--disable-breakpad',
                    '--disable-component-update',
                    '--disable-domain-reliability',
                    '--disable-sync',
                    '--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints',
                    '--disk-cache-size=0',
                    '--disable-application-cache',
                    '--disable-offline-load-stale-cache',
                    '--disable-gpu-shader-disk-cache'
                ]
            }
        });

        this.initializeClient();
    }

    private log(msg: string) {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] ${msg}`;
        console.log(logMsg);
        this.logs.unshift(logMsg); // Add to beginning
        if (this.logs.length > 20) this.logs.pop(); // Keep last 20
    }

    private initializeClient() {
        this.client.on('qr', (qr) => {
            this.log('⚡ QR Code generated!');
            this.currentQR = qr;
        });

        this.client.on('ready', () => {
            this.log('✅ WhatsApp Manager Client is READY!');
            this.isReady = true;
            this.currentQR = null;
        });

        this.client.on('auth_failure', (msg) => {
            this.log(`❌ Authentication failed: ${msg}`);
            this.isReady = false;
        });

        this.client.on('disconnected', (reason) => {
            this.log(`❌ Client was disconnected: ${reason}`);
            this.isReady = false;
        });

        this.client.initialize().then(() => {
            this.log('Client initialized started...');
        }).catch(err => {
            this.log(`FATAL: Client initialization failed: ${err.message}`);
        });
    }

    public async sendMessage(mobile: string, message: string): Promise<boolean> {
        if (!this.isReady) {
            console.warn('WhatsApp client not ready');
            return false;
        }
        try {
            let sanitizedNumber = mobile.replace(/\D/g, '');
            if (sanitizedNumber.length === 10) {
                sanitizedNumber = '91' + sanitizedNumber;
            }
            const chatId = `${sanitizedNumber}@c.us`;
            await this.client.sendMessage(chatId, message);
            console.log(`[SENT] Message sent to ${mobile}`);
            return true;
        } catch (error) {
            console.error(`[ERROR] Failed to send to ${mobile}:`, error);
            return false;
        }
    }

    public async initialize(app: Express) {
        // Web Interface for QR Code with Logs
        app.get('/whatsapp', async (req: Request, res: Response) => {
            const logsHtml = this.logs.map(l => `<div style="font-size: 12px; color: #555; margin-bottom: 5px; font-family: monospace;">${l}</div>`).join('');

            if (this.isReady) {
                return res.send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 20px;">
                            <h1 style="color: green;">✅ Service Is Ready</h1>
                            <p>WhatsApp is connected and running.</p>
                            <div style="margin-top: 20px; text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                                <h3>Logs:</h3>
                                ${logsHtml}
                            </div>
                        </body>
                    </html>
                `);
            }

            if (!this.currentQR) {
                return res.send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 20px;">
                            <h1>⏳ Waiting for QR Code...</h1>
                            <p>Please wait for the service to generate a code.</p>
                            <script>setTimeout(() => location.reload(), 3000);</script>
                            <div style="margin-top: 20px; text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                                <h3>Debug Logs:</h3>
                                ${logsHtml}
                            </div>
                        </body>
                    </html>
                `);
            }

            try {
                const url = await QRCode.toDataURL(this.currentQR);
                res.send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 20px;">
                            <h1>📱 Scan with WhatsApp</h1>
                            <p>Open WhatsApp on your phone -> Linked Devices -> Link a Device</p>
                            <img src="${url}" style="width: 300px; height: 300px; border: 1px solid #ccc; padding: 10px; border-radius: 10px;" />
                            <br><br>
                            <p>Page auto-refreshes...</p>
                            <script>setTimeout(() => location.reload(), 5000);</script>
                            <div style="margin-top: 20px; text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                                <h3>Debug Logs:</h3>
                                ${logsHtml}
                            </div>
                        </body>
                    </html>
                `);
            } catch (err) {
                res.status(500).send('Error generating QR code');
            }
        });

        // API Endpoint for Application Trigger
        app.post('/api/whatsapp/send', async (req: Request, res: Response): Promise<any> => {
            console.log('📥 Received /send request:', JSON.stringify(req.body));

            if (!this.isReady) {
                return res.status(503).json({ error: 'WhatsApp client not ready yet.' });
            }

            const { mobile, message } = req.body;

            if (!mobile || !message) {
                return res.status(400).json({ error: 'Missing mobile or message' });
            }

            try {
                let sanitizedNumber = mobile.replace(/\D/g, '');
                if (sanitizedNumber.length === 10) {
                    sanitizedNumber = '91' + sanitizedNumber;
                }

                const chatId = `${sanitizedNumber}@c.us`;

                await this.client.sendMessage(chatId, message);
                console.log(`[SENT] Message sent to ${mobile}`);

                return res.json({ success: true, status: 'Message sent' });
            } catch (error: any) {
                console.error(`[ERROR] Failed to send to ${mobile}:`, error);
                return res.status(500).json({ error: 'Failed to send message', details: error.message });
            }
        });
    }
}

export const whatsappService = new WhatsAppService();
