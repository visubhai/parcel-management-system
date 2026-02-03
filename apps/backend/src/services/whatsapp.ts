import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Express, Request, Response } from 'express';
import QRCode from 'qrcode';
import path from 'path';
import pino from 'pino';
import fs from 'fs';

class WhatsAppService {
    private sock: any;
    private isReady: boolean = false;
    private currentQR: string | null = null;
    private authFolder: string;
    private lastOutput: string = "";

    constructor() {
        this.authFolder = path.resolve(process.cwd(), '.wa_session');
        if (!fs.existsSync(this.authFolder)) {
            fs.mkdirSync(this.authFolder, { recursive: true });
        }
        this.initializeClient();
    }

    private log(msg: string) {
        if (msg === this.lastOutput) return; // Reduce duplicate logs
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[WA-BOT ${timestamp}] ${msg}`);
        this.lastOutput = msg;
    }

    private async initializeClient() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                // EXTREME RAM OPTIMIZATIONS (Target 150-300MB)
                logger: pino({ level: 'error' }) as any,
                auth: state,
                version,
                browser: ['Savan Logistics', 'Desktop', '1.0.0'],

                // Memory efficiency flags
                syncFullHistory: false,
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                getMessage: async () => undefined,

                // Connection stability
                connectTimeoutMs: 120000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 20000,
            });

            this.sock.ev.on('connection.update', (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.currentQR = qr;
                    this.log('✨ NEW QR CODE GENERATED');
                }

                if (connection === 'close') {
                    const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
                    this.isReady = false;
                    this.log(`❌ Connection Closed (Status: ${statusCode})`);

                    if (statusCode === DisconnectReason.loggedOut) {
                        this.log('Logged out. Wiping session...');
                        fs.rmSync(this.authFolder, { recursive: true, force: true });
                    }

                    setTimeout(() => this.initializeClient(), 10000);
                } else if (connection === 'open') {
                    this.log('✅ WHATSAPP LINKED & READY');
                    this.isReady = true;
                    this.currentQR = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            // Avoid keeping many contacts/chats in memory
            this.sock.ev.on('messaging-history.set', () => { /* Ignore history sync */ });

        } catch (error: any) {
            this.log(`Critical Error: ${error.message}`);
        }
    }

    public async sendMessage(mobile: string, message: string): Promise<boolean> {
        if (!this.isReady) return false;
        try {
            let num = mobile.replace(/\D/g, '');
            if (num.length === 10) num = '91' + num;
            const jid = `${num}@s.whatsapp.net`;
            await this.sock.sendMessage(jid, { text: message });
            this.log(`📩 Message sent to ${num}`);
            return true;
        } catch (error) {
            this.log('Failed to send message');
            return false;
        }
    }

    public async initialize(app: Express) {
        app.get('/api/whatsapp/qr', async (req: Request, res: Response) => {
            if (this.isReady) return res.send('<h2 style="color:green;text-align:center;font-family:sans-serif;margin-top:50px">✅ Linked Successfully!</h2><script>setTimeout(()=>location.href="http://localhost:3000", 2000)</script>');

            if (!this.currentQR) {
                return res.send('<h2 style="text-align:center;font-family:sans-serif;margin-top:50px">Initializing... Please wait 10s</h2><script>setTimeout(()=>location.reload(), 5000)</script>');
            }

            const url = await QRCode.toDataURL(this.currentQR);
            res.send(`
                <div style="text-align:center;font-family:sans-serif;margin-top:50px">
                    <h2>Scan to Link WhatsApp</h2>
                    <div style="padding:20px; border:4px solid #f0f0f0; display:inline-block; border-radius:20px">
                        <img src="${url}" width="300"/>
                    </div>
                    <p style="color:#666">Open WhatsApp > Linked Devices > Link a Device</p>
                    <script>setTimeout(()=>location.reload(), 30000)</script>
                </div>
            `);
        });

        app.post('/api/whatsapp/direct-send', async (req: Request, res: Response): Promise<any> => {
            const { mobile, message } = req.body;
            if (!this.isReady) return res.status(503).json({ error: 'Not Linked' });
            const success = await this.sendMessage(mobile, message);
            return res.json({ success });
        });
    }
}

export const whatsappService = new WhatsAppService();
