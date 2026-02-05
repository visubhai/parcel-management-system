
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

class WhatsappService {
    private client: Client;
    private ready: boolean = false;
    private qrCode: string | null = null;
    private status: string = 'Starting...';

    constructor() {
        console.log('🔄 Initializing WhatsApp Service...');
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process'
                ],
                headless: true
            }
        });

        if (process.env.WHATSAPP_ENABLED === 'true') {
            this.initialize();
        } else {
            console.log('⏸️ WhatsApp Service is PAUSED (WHATSAPP_ENABLED is not true)');
            this.status = 'PAUSED';
        }
    }

    private initialize() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            this.status = 'QR_READY';
            console.log('📱 QR Code Generated! Scan this to login:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ ✅ ✅ WhatsApp Client is FULLY Ready!');
            this.ready = true;
            this.qrCode = null;
            this.status = 'CONNECTED';
        });

        this.client.on('authenticated', () => {
            console.log('🔐 WhatsApp Authenticated Successfully! Preparing session...');
            this.status = 'AUTHENTICATING';
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ WhatsApp Authentication Failed:', msg);
            this.status = 'AUTH_FAILURE';
        });

        this.client.on('disconnected', (reason) => {
            console.log('⚠️ WhatsApp Disconnected:', reason);
            this.ready = false;
            this.status = 'DISCONNECTED';
        });

        // Start the client
        this.client.initialize().catch(err => {
            console.error('❌ Failed to initialize WhatsApp client:', err);
            this.status = 'ERROR';
        });
    }

    public async sendMessage(to: string, message: string): Promise<boolean> {
        if (!this.ready) {
            console.warn('⚠️ WhatsApp is not ready. Message queued or dropped.');
            return false;
        }

        try {
            // Format phone number (append @c.us if not present)
            // Remove '+' and any non-numeric chars
            const sanitizedNumber = to.replace(/\D/g, '');
            // Append country code if missing (Assuming 91 for India as default if length is 10)
            const finalNumber = sanitizedNumber.length === 10 ? `91${sanitizedNumber}` : sanitizedNumber;
            const chatId = `${finalNumber}@c.us`;

            await this.client.sendMessage(chatId, message);
            console.log(`✅ WhatsApp sent to ${finalNumber}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send WhatsApp message to ${to}:`, error);
            return false;
        }
    }

    public async logout(): Promise<void> {
        console.log('🔄 Logging out and clearing session...');
        try {
            this.status = 'LOGGING_OUT';
            if (this.client) {
                await this.client.destroy();
            }

            const authPath = path.join(process.cwd(), '.wwebjs_auth');
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log('🗑️ Auth folder cleared.');
            }

            this.ready = false;
            this.qrCode = null;

            // Re-initialize
            this.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: 'client-one',
                    dataPath: './.wwebjs_auth'
                }),
                puppeteer: {
                    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process'
                    ],
                    headless: true
                }
            });
            this.initialize();
        } catch (error) {
            console.error('❌ Logout failed:', error);
            throw error;
        }
    }

    public isReady(): boolean {
        return this.ready;
    }

    public getQrCode(): string | null {
        return this.qrCode;
    }

    public getStatus(): string {
        return this.status;
    }
}

export const whatsappService = new WhatsappService();
