import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!MONGODB_URI) {
            throw new Error('Please define the MONGODB_URI or MONGO_URI environment variable inside .env');
        }

        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;
