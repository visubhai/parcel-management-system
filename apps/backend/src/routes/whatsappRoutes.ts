
import { Router, Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp';
import QRCode from 'qrcode';

const router = Router();

router.get('/qr', async (req: Request, res: Response) => {
    try {
        if (whatsappService.isReady()) {
            return res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: green;">✅ WhatsApp Connected</h1>
                        <p>The client is ready and authenticated.</p>
                    </body>
                </html>
            `);
        }

        const status = whatsappService.getStatus();
        const qrCode = whatsappService.getQrCode();

        if (status === 'AUTHENTICATING') {
            return res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>🔐 Authenticating...</h1>
                        <p>WhatsApp is verifying your session. Please wait a few seconds...</p>
                        <p>Status: <b>${status}</b></p>
                    </body>
                </html>
            `);
        }

        if (!qrCode) {
            return res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>⏳ Initializing...</h1>
                        <p>Please wait a moment and refresh this page to see the QR code.</p>
                        <p>Status: <b>${status}</b></p>
                    </body>
                </html>
            `);
        }

        // Generate QR Code Image Data URL
        const qrImage = await QRCode.toDataURL(qrCode);

        return res.send(`
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>📱 Scan WhatsApp QR</h1>
                    <p>Open WhatsApp on your phone -> Menu -> Linked Devices -> Link a Device</p>
                    <br/>
                    <img src="${qrImage}" style="width: 300px; height: 300px; border: 1px solid #ccc;" />
                    <br/><br/>
                    <p>Status: <b>${status}</b></p>
                    <p><i>Refresh if code expires or after scanning to check status</i></p>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Error generating QR page:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/test', async (req: Request, res: Response) => {
    const { mobile, message } = req.query;
    if (!mobile || !message) {
        return res.status(400).json({ error: 'mobile and message query params are required' });
    }

    const success = await whatsappService.sendMessage(mobile as string, message as string);
    if (success) {
        res.json({ success: true, message: 'Test message sent' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send message. WhatsApp might not be ready.' });
    }
});

router.get('/logout', async (req: Request, res: Response) => {
    try {
        await whatsappService.logout();
        res.json({ success: true, message: 'Logged out and session cleared. Service is restarting...' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed', error: (error as any).message });
    }
});

router.get('/status', (req, res) => {
    res.json({
        ready: whatsappService.isReady(),
        qrAvailable: !!whatsappService.getQrCode()
    });
});

export default router;
