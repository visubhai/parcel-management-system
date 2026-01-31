import { Client, LocalAuth } from 'whatsapp-web.js';
import { Express, Request, Response } from 'express';
import QRCode from 'qrcode';
import path from 'path';

class WhatsAppService {
    private client: Client;
    private isReady: boolean = false;
    private currentQR: string | null = null;
    private sessionPath: string;

    constructor() {
        this.sessionPath = path.resolve(__dirname, '../../../../.wwebjs_auth');

        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: this.sessionPath }),
            authTimeoutMs: 60000,
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

        this.initializeClient();
    }

    private initializeClient() {
        this.client.on('qr', (qr) => {
            console.log('⚡ QR Code generated! Please scan it.');
            this.currentQR = qr;
        });

        this.client.on('ready', () => {
            console.log('\n✅ WhatsApp Manager Client is READY!');
            this.isReady = true;
            this.currentQR = null;
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
            this.isReady = false;
        });

        this.client.on('disconnected', (reason) => {
            console.log('❌ Client was disconnected:', reason);
            this.isReady = false;
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
        // Web Interface for QR Code
        app.get('/whatsapp', async (req: Request, res: Response) => {
            if (this.isReady) {
                return res.send(`
                    <html>
                        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                            <h1 style="color: green;">✅ Service Is Ready</h1>
                            <p>WhatsApp is connected and running.</p>
                        </body>
                    </html>
                `);
            }

            if (!this.currentQR) {
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
                const url = await QRCode.toDataURL(this.currentQR);
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

        try {
            await this.client.initialize();
        } catch (err) {
            console.error('Failed to initialize WhatsApp client:', err);
        }
    }
}

export const whatsappService = new WhatsAppService();
