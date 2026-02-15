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
        enum: ['SUPER_ADMIN', 'BRANCH'],
        default: 'BRANCH',
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: function (this: any) { return this.role === 'BRANCH'; }
    },
    branch: { // Keep for backward compatibility/populated data if needed
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    allowedBranches: [{
        type: String, // Store branch names/codes for flexibility
    }],
    allowedReports: [{
        type: String,
        enum: ["DAILY_REPORT", "DELIVERY_REPORT", "LEDGER_REPORT", "SUMMARY_REPORT", "BOOKING_REPORT"]
    }],
}, { timestamps: true });

// Prevent recompilation of model in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
