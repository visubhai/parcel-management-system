
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

class WhatsappService {
    private client: Client;
    private ready: boolean = false;
    private qrCode: string | null = null;

    constructor() {
        console.log('🔄 Initializing WhatsApp Service...');
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'client-one',
                dataPath: './.wwebjs_auth'
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true
            }
        });

        this.initialize();
    }

    private initialize() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            console.log('📱 QR Code Generated! Scan this to login:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp Client is Ready!');
            this.ready = true;
            this.qrCode = null;
        });

        this.client.on('authenticated', () => {
            console.log('🔐 WhatsApp Authenticated');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ WhatsApp Authentication Failed:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('⚠️ WhatsApp Disconnected:', reason);
            this.ready = false;
        });

        // Start the client
        this.client.initialize().catch(err => {
            console.error('❌ Failed to initialize WhatsApp client:', err);
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

    public isReady(): boolean {
        return this.ready;
    }

    public getQrCode(): string | null {
        return this.qrCode;
    }
}

export const whatsappService = new WhatsappService();
