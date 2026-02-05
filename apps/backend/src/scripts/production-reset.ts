import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Branch from '../models/Branch';
import Booking from '../models/Booking';
import Transaction from '../models/Transaction';
import Counter from '../models/Counter';
import ReportPermission from '../models/ReportPermission';
import AuditLog from '../models/AuditLog';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing in .env');
    process.exit(1);
}

async function cleanup() {
    try {
        console.log('🔄 Connecting to MongoDB (Backend Context)...');
        await mongoose.connect(MONGODB_URI!, { serverSelectionTimeoutMS: 30000 });
        console.log('✅ Connected.');

        const models = [User, Branch, Booking, Transaction, Counter, ReportPermission, AuditLog];

        for (const model of models) {
            console.log(`   - Clearing ${model.modelName}...`);
            // Try to force connection or use native driver if mongoose is buffering
            if (mongoose.connection.readyState !== 1) {
                console.warn('⚠️ Connection not ready, waiting...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            await (model as any).deleteMany({});
        }

        console.log('✅ All data cleared.');

        console.log('🌱 Creating Initial Super Admin...');
        const adminHash = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'System Administrator',
            email: 'admin@savanlogistics.com',
            username: 'admin',
            password: adminHash,
            role: 'SUPER_ADMIN',
            isActive: true
        });

        console.log('\n✨ Database Reset Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup Failed:', error);
        process.exit(1);
    }
}

cleanup();
