import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { whatsappService } from './services/whatsapp';
import { initCronJobs } from './services/cronService';
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

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

import { apiRateLimiter } from './middleware/rateLimiter';

// Global API Rate Limiter
app.use('/api', apiRateLimiter);

// Logging Middleware
app.use(requestLogger);

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

// Error Handling Middleware (Must be last)
app.use(errorHandler);

// Initialize Services & Start Server
// Initialize Services & Start Server
if (process.env.NODE_ENV !== 'test') {
    (async () => {
        try {
            await connectDB();
            console.log('✅ Database connected');

            // Initialize WhatsApp Service
            whatsappService.initialize(app);

            // Initialize Background Schedulers
            initCronJobs();

            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } catch (err) {
            console.error('❌ Database connection failed:', err);
            process.exit(1);
        }
    })();
}

export default app;
