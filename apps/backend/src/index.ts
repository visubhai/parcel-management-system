import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import branchRoutes from './routes/branchRoutes';
import bookingRoutes from './routes/bookingRoutes';
import ledgerRoutes from './routes/ledgerRoutes';
import userRoutes from './routes/userRoutes';
import superAdminRoutes from './routes/superAdminRoutes';

import { requestLogger } from './services/loggerService';
import { errorHandler } from './middleware/errorHandler';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Proxy (Required for Rate Limiting behind Load Balancers like Koyeb/Heroku)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://savan-travels-transport-byvisu.vercel.app',
            process.env.FRONTEND_URL || ''
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || origin.endsWith('.ngrok-free.app')) {
            return callback(null, true);
        }

        // Optional: Log blocked origins for debugging
        // console.log('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

import { apiRateLimiter } from './middleware/rateLimiter';

// Global API Rate Limiter
app.use('/api', apiRateLimiter);

// Logging Middleware
app.use(requestLogger);

import whatsappRoutes from './routes/whatsappRoutes';

// Routes
app.get('/', (req, res) => {
    res.send('Parcel Management System API');
});

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/whatsapp', whatsappRoutes);



// Error Handling Middleware (Must be last)
app.use(errorHandler);

// Initialize Services & Start Server
// Initialize Services & Start Server
// In Vercel, we export the app for serverless function usage.
// We only start the server explicitly if NOT in Vercel.
// Initialize Services & Start Server
// Docker/VPS: VERCEL is undefined -> Full Mode (WhatsApp + Cron)
// Vercel: VERCEL is defined -> Serverless Mode (No background services)
if (!process.env.VERCEL) {
    (async () => {
        try {
            await connectDB();
            console.log('✅ Database connected');

            // Initialize Background Schedulers
            const { initCronJobs } = await import('./services/cronService');
            initCronJobs();

            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } catch (err) {
            console.error('❌ Database connection failed:', err);
            process.exit(1);
        }
    })();
} else {
    // Serverless Optimizations
    connectDB().then(() => console.log('✅ Database connected (Serverless)')).catch(err => console.error('❌ DB Connection Error:', err));
}

export default app;
