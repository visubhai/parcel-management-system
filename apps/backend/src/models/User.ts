import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false, // Don't return by default
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
        default: 'STAFF',
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Prevent recompilation of model in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
