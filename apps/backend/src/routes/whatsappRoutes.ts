
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

        const qrCode = whatsappService.getQrCode();
        if (!qrCode) {
            return res.send(`
                <html>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>⏳ Initializing...</h1>
                        <p>Please wait a moment and refresh this page to see the QR code.</p>
                        <script>setTimeout(() => window.location.reload(), 3000);</script>
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
                    <p><i>Refresh if code expires</i></p>
                    <script>setTimeout(() => window.location.reload(), 15000);</script>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Error generating QR page:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/status', (req, res) => {
    res.json({
        ready: whatsappService.isReady(),
        qrAvailable: !!whatsappService.getQrCode()
    });
});

export default router;
