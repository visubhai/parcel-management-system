import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/backend/models/User';
import Branch from '../src/backend/models/Branch';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing in .env.local');
    process.exit(1);
}

const seedData = [
    { branch: 'mumbai-borivali', pass: 'savan3456', state: 'Maharashtra' },
    { branch: 'amdavad-ctm', pass: 'savan6734', state: 'Gujarat' },
    { branch: 'mumbai-andheri', pass: 'savan4598', state: 'Maharashtra' },
    { branch: 'setelite', pass: '444245', state: 'Gujarat' },
    { branch: 'mumbai-vasai', pass: 'savan2356', state: 'Maharashtra' },
    { branch: 'udhana', pass: '1234', state: 'Gujarat' },
    { branch: 'bapunagar', pass: '888942', state: 'Gujarat' },
    { branch: 'hirabagh', pass: 'savan8980', state: 'Gujarat' },
    { branch: 'rajkot-punitnagar', pass: '1234', state: 'Gujarat' },
    { branch: 'sahara', pass: '1234', state: 'Gujarat' },
    { branch: 'paldi', pass: '994142', state: 'Gujarat' },
    { branch: 'rajkot-limdachok', pass: '1234', state: 'Gujarat' },
    { branch: 'katargam', pass: 'savan4567', state: 'Gujarat' },
    { branch: 'sachin', pass: '1234', state: 'Gujarat' },
    { branch: 'savan', pass: '95008', state: 'Gujarat' }
];

async function seed() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected.');

        // 1. Clear Data
        console.log('🧹 Clearing old data...');
        await User.deleteMany({});
        await Branch.deleteMany({});

        // 2. Create Branches and Users
        console.log('🌱 Seeding Branches and Users...');

        // Admin
        const adminHash = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Super Admin',
            email: 'admin@system.com',
            username: 'admin',
            password: adminHash,
            role: 'SUPER_ADMIN',
            branch: null
        });

        for (const item of seedData) {
            // Create Branch
            // slug as branchCode for simplicity
            const branch = await Branch.create({
                name: item.branch, // Name as shown in image
                branchCode: item.branch,
                state: item.state
            });

            // Create User linked to Branch
            const passHash = await bcrypt.hash(item.pass.toString(), 10);
            await User.create({
                name: item.branch, // User name same as branch
                email: `${item.branch}@system.com`,
                username: item.branch, // USE BRANCH NAME AS USERNAME
                password: passHash,
                role: 'STAFF',
                branch: branch._id
            });
            console.log(`Created: ${item.branch} / ${item.pass}`);
        }

        console.log('✅ Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
