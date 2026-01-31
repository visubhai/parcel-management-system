import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    branchId: mongoose.Types.ObjectId;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    referenceId?: string; // e.g. Booking ID or LR Number
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
