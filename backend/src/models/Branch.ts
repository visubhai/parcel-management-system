import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a branch name'],
    },
    branchCode: {
        type: String,
        required: [true, 'Please provide a branch code'],
        unique: true,
    },
    state: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
