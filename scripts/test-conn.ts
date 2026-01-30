import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

async function test() {
    console.log('Testing connection to:', process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI as string, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('SUCCESS: Connected to MongoDB');
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('Collections:', collections?.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err);
        process.exit(1);
    }
}

test();
