import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
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
    private logs: string[] = [];

    constructor() {
        this.log('Initializing WhatsApp Service (Baileys)...');
        this.authFolder = path.resolve(__dirname, '../../../../.baileys_auth');

        // Ensure auth folder exists
        if (!fs.existsSync(this.authFolder)) {
            fs.mkdirSync(this.authFolder, { recursive: true });
        }

        this.initializeClient();
    }

    private log(msg: string) {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] ${msg}`;
        console.log(logMsg);
        this.logs.unshift(logMsg);
        if (this.logs.length > 50) this.logs.pop();
    }

    private async initializeClient() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);

            this.sock = makeWASocket({
                logger: pino({ level: 'info' }) as any, // Info level to see handshake progress
                printQRInTerminal: false,
                auth: state,
                connectTimeoutMs: 60000,
            });

            this.sock.ev.on('connection.update', async (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.log('⚡ QR Code generated! Scan now.');
                    this.currentQR = qr;
                }

                if (connection === 'close') {
                    const error = lastDisconnect?.error as any;
                    const statusCode = error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                    this.log(`❌ Connection closed. Status: ${statusCode}. Error: ${error?.message}. Reconnecting: ${shouldReconnect}`);

                    // Log full error for diagnosing (only visible in Render console)
                    console.log('DEBUG_ERROR:', JSON.stringify(error, null, 2));

                    this.isReady = false;

                    if (shouldReconnect) {
                        // Exponential backoff or standard delay
                        setTimeout(() => this.initializeClient(), 5000);
                    } else {
                        this.log('❌ Logged out. Please use the Reset button.');
                    }
                } else if (connection === 'open') {
                    this.log('✅ WhatsApp connected successfully!');
                    this.isReady = true;
                    this.currentQR = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

        } catch (error: any) {
            this.log(`FATAL: Failed to initialize Baileys: ${error.message}`);
        }
    }

    public async sendMessage(mobile: string, message: string): Promise<boolean> {
        if (!this.isReady || !this.sock) {
            console.warn('WhatsApp socket not ready');
            return false;
        }
        try {
            let sanitizedNumber = mobile.replace(/\D/g, '');
            if (sanitizedNumber.length === 10) {
                sanitizedNumber = '91' + sanitizedNumber;
            }
            const jid = `${sanitizedNumber}@s.whatsapp.net`; // Baileys uses @s.whatsapp.net

            await this.sock.sendMessage(jid, { text: message });
            this.log(`[SENT] Message sent to ${mobile}`);
            return true;
        } catch (error: any) {
            console.error(`[ERROR] Failed to send to ${mobile}:`, error);
            this.log(`[ERROR] Send failed: ${error.message}`);
            return false;
        }
    }

    public async initialize(app: Express) {
        // Reset Endpoint
        app.get('/whatsapp/reset', async (req: Request, res: Response) => {
            try {
                if (fs.existsSync(this.authFolder)) {
                    fs.rmSync(this.authFolder, { recursive: true, force: true });
                }
                this.isReady = false;
                this.currentQR = null;
                this.log('🗑️ Session reset. Restarting...');
                this.initializeClient();
                res.send('<script>window.location.href = "/whatsapp";</script>');
            } catch (error: any) {
                res.status(500).send(`Failed to reset: ${error.message}`);
            }
        });

        // Web Interface used for QR Code & Logs
        app.get('/whatsapp', async (req: Request, res: Response) => {
            const logsHtml = this.logs.map(l => `<div style="font-size: 11px; color: #444; margin-bottom: 2px; font-family: monospace; border-bottom: 1px solid #eee;">${l}</div>`).join('');

            let statusHtml = '';
            if (this.isReady) {
                statusHtml = `<h1 style="color: green;">✅ Connected</h1><p>Ready to send messages.</p>`;
            } else if (this.currentQR) {
                try {
                    const url = await QRCode.toDataURL(this.currentQR);
                    statusHtml = `
                        <h1>📱 Scan QR Code</h1>
                        <p>Open WhatsApp -> Linked Devices -> Link</p>
                        <img src="${url}" style="width: 300px; height: 300px; border: 1px solid #ddd; padding: 10px; border-radius: 8px;" />
                        <p>Searching for phone...</p>
                        <script>setTimeout(() => location.reload(), 3000);</script>
                    `;
                } catch (e) {
                    statusHtml = `<p style="color:red">Error generating QR: ${e}</p>`;
                }
            } else {
                statusHtml = `
                    <h1>⏳ Initializing...</h1>
                    <p>Please wait...</p>
                    <script>setTimeout(() => location.reload(), 2000);</script>
                `;
            }

            res.send(`
                <html>
                    <body style="font-family: system-ui, sans-serif; text-align: center; padding: 20px; max-width: 600px; margin: 0 auto;">
                        ${statusHtml}
                        <div style="margin-top: 20px;">
                            <a href="/whatsapp/reset" style="background: #ff4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">🗑️ Reset Session</a>
                        </div>
                        <div style="margin-top: 30px; text-align: left; background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                            <h3 style="margin-top: 0;">System Logs</h3>
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${logsHtml}
                            </div>
                        </div>
                    </body>
                </html>
            `);
        });

        // API Endpoint for Application Trigger
        app.post('/api/whatsapp/send', async (req: Request, res: Response): Promise<any> => {
            if (!this.isReady) return res.status(503).json({ error: 'WhatsApp not ready' });
            const { mobile, message } = req.body;
            if (!mobile || !message) return res.status(400).json({ error: 'Missing mobile/message' });

            const success = await this.sendMessage(mobile, message);
            if (success) return res.json({ success: true });
            return res.status(500).json({ error: 'Failed to send' });
        });
    }
}

export const whatsappService = new WhatsAppService();
