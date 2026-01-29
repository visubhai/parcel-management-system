import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Branch from '../src/models/Branch';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing in .env.local');
    process.exit(1);
}

async function seed() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected.');

        // 1. Clear Data
        console.log('🧹 Clearing old data...');
        await User.deleteMany({});
        await Branch.deleteMany({});

        // 2. Create Branches
        console.log('🌱 Seeding Branches...');
        const branches = await Branch.create([
            { name: 'Main Branch', branchCode: 'B001', state: 'Gujarat' },
            { name: 'Surat Hub', branchCode: 'B002', state: 'Gujarat' },
            { name: 'Mumbai Gateway', branchCode: 'B003', state: 'Maharashtra' }
        ]);

        const mainBranch = branches[0];

        // 3. Create Users
        console.log('👤 Seeding Users...');

        // Admin
        const adminHash = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test Admin',
            email: 'test@test.com',
            username: 'admin',
            password: adminHash,
            role: 'SUPER_ADMIN',
            branch: null // Super Admin has no specific branch
        });

        // Staff (Hirabagh)
        const staffHash = await bcrypt.hash('savan8980', 10);
        await User.create({
            name: 'Hirabagh User',
            email: 'hirabagh@abcd.com',
            username: 'hirabagh',
            password: staffHash,
            role: 'STAFF',
            branch: mainBranch._id
        });

        console.log('✅ Seeding Complete!');
        console.log('-----------------------------------');
        console.log('Admin: test@test.com / password123');
        console.log('Staff: hirabagh / savan8980');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
