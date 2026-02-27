import mongoose, { Document, Schema } from 'mongoose';

export interface IBranch extends Document {
    name: string;
    branchCode: string;
    state: string; // Keeping for backward compatibility
    address?: string;
    phone?: string;
    isActive: boolean;
}

const BranchSchema = new Schema<IBranch>({
    name: {
        type: String,
        required: [true, 'Please provide a branch name'],
        trim: true,
        maxlength: 100
    },
    branchCode: {
        type: String,
        required: [true, 'Please provide a branch code'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: 20
    },
    state: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        trim: true,
        maxlength: 500
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

BranchSchema.index({ isActive: 1 });

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
