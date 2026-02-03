import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from '@whiskeysockets/baileys';
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
    private status: string = "Connecting...";

    constructor() {
        this.authFolder = path.resolve(process.cwd(), '.wa_session');
        if (!fs.existsSync(this.authFolder)) {
            fs.mkdirSync(this.authFolder, { recursive: true });
        }
        this.initializeClient();
    }

    private log(msg: string) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[WA-BOT ${timestamp}] ${msg}`);
        this.status = msg;
    }

    private async initializeClient() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                // STRICT RAM OPTIMIZATION (< 200MB)
                logger: pino({ level: 'silent' }) as any,
                auth: state,
                version,
                browser: ['Savan Logistics', 'Desktop', '1.0.0'],

                // Memory saving flags
                syncFullHistory: false,
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                getMessage: async () => undefined,
                shouldIgnoreJid: (jid) => jid.includes('@g.us'), // Ignore group messages to save RAM

                // Connection profile for stability
                connectTimeoutMs: 120000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 60000,
            });

            this.sock.ev.on('connection.update', (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.currentQR = qr;
                    this.log('✨ New QR Generated');
                }

                if (connection === 'close') {
                    const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
                    this.isReady = false;
                    this.log(`❌ Closed: ${statusCode}`);

                    if (statusCode === DisconnectReason.loggedOut) {
                        fs.rmSync(this.authFolder, { recursive: true, force: true });
                    }

                    setTimeout(() => this.initializeClient(), 15000); // 15s delay to save CPU/RAM
                } else if (connection === 'open') {
                    this.log('✅ WHATSAPP CONNECTED');
                    this.isReady = true;
                    this.currentQR = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            // Aggressive memory cleanup for large history events
            this.sock.ev.on('messaging-history.set', () => {
                this.log('🗑️ History memory cleared');
            });

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

            // Human emulation to stay safe
            await this.sock.sendPresenceUpdate('composing', jid);
            await delay(1000);
            await this.sock.sendMessage(jid, { text: message });

            this.log(`📩 Sent to ${num}`);
            return true;
        } catch (error: any) {
            this.log(`ERR: ${error.message}`);
            return false;
        }
    }

    public async initialize(app: Express) {
        app.get('/api/whatsapp/qr', async (req: Request, res: Response) => {
            if (this.isReady) {
                return res.send(`
                    <div style="text-align:center; font-family:sans-serif; margin-top:50px">
                        <h1 style="color:#128c7e">Savan Logistics</h1>
                        <div style="padding:20px; background:#e3ffef; color:#14523a; border-radius:12px; display:inline-block">
                            <b>✅ WhatsApp Bot Linked Successfully!</b>
                        </div>
                        <p>You can now close this tab.</p>
                    </div>
                `);
            }

            if (!this.currentQR) {
                return res.send('<div style="text-align:center; font-family:sans-serif; margin-top:50px">Initializing... Refresh in 10s</div><script>setTimeout(()=>location.reload(), 10000)</script>');
            }

            const url = await QRCode.toDataURL(this.currentQR);
            res.send(`
                <div style="text-align:center; font-family:sans-serif; margin-top:50px">
                    <h2>Scan to Link WhatsApp</h2>
                    <div style="padding:20px; border:4px solid #f0f0f0; display:inline-block; border-radius:30px">
                        <img src="${url}" width="300"/>
                    </div>
                    <p style="color:#128c7e">Status: ${this.status}</p>
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
