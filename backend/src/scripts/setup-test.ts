import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Branch from '../models/Branch';
import User from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function setup() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('✅ Connected.');

        console.log('🌱 Creating test branches...');
        const branchA = await Branch.create({ name: 'Branch A', branchCode: 'BRA', state: 'Gujarat' });
        const branchB = await Branch.create({ name: 'Branch B', branchCode: 'BRB', state: 'Maharashtra' });

        console.log('🌱 Creating branch operator...');
        const passHash = await bcrypt.hash('operator123', 10);
        await User.create({
            name: 'Operator B',
            email: 'operatorb@system.com',
            username: 'operatorb',
            password: passHash,
            role: 'BRANCH',
            branchId: branchB._id
        });

        console.log('\n✅ Setup Complete!');
        console.log('1. Log in as: admin / admin123 (Select any branch)');
        console.log('2. Log in as: operatorb / operator123 (Select Branch B)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup Failed:', error);
        process.exit(1);
    }
}

setup();
