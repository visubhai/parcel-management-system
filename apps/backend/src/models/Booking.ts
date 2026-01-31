import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    lrNumber: string;
    fromBranch: mongoose.Types.ObjectId;
    toBranch: mongoose.Types.ObjectId;
    senderBranchId: mongoose.Types.ObjectId; // Strict isolation
    receiverBranchId: mongoose.Types.ObjectId;
    sender: {
        name: string;
        mobile: string;
        email?: string;
    };
    receiver: {
        name: string;
        mobile: string;
        email?: string;
    };
    parcels: Array<{
        quantity: number;
        itemType: string;
        weight: number;
        rate: number;
    }>;
    costs: {
        freight: number;
        handling: number;
        hamali: number;
        total: number;
    };
    paymentType: 'Paid' | 'To Pay';
    remarks?: string;
    deliveredRemark?: string;
    deliveredAt?: Date;
    deliveredBy?: mongoose.Types.ObjectId;
    status: 'INCOMING' | 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'Booked' | 'In Transit' | 'Arrived';
    editHistory: Array<{
        oldRemark?: string;
        newRemark: string;
        editedBy: mongoose.Types.ObjectId;
        editedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
    lrNumber: { type: String, required: true, unique: true },
    fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    toBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    senderBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    receiverBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    sender: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String }
    },
    receiver: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String }
    },
    parcels: [{
        quantity: { type: Number, required: true },
        itemType: { type: String, required: true },
        weight: { type: Number, required: true },
        rate: { type: Number, required: true }
    }],
    costs: {
        freight: { type: Number, required: true },
        handling: { type: Number, required: true },
        hamali: { type: Number, required: true },
        total: { type: Number, required: true }
    },
    paymentType: { type: String, enum: ['Paid', 'To Pay'], required: true },
    remarks: { type: String, required: false },
    deliveredRemark: { type: String, required: false },
    deliveredAt: { type: Date },
    deliveredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['INCOMING', 'PENDING', 'DELIVERED', 'CANCELLED', 'Booked', 'In Transit', 'Arrived'],
        default: 'INCOMING'
    },
    editHistory: [{
        oldRemark: String,
        newRemark: { type: String, required: true },
        editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        editedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
