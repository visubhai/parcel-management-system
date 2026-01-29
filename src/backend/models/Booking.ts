import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    lrNumber: string;
    fromBranch: mongoose.Types.ObjectId;
    toBranch: mongoose.Types.ObjectId;
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
    status: 'Booked' | 'In Transit' | 'Arrived' | 'Delivered' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
    lrNumber: { type: String, required: true, unique: true },
    fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    toBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
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
    status: {
        type: String,
        enum: ['Booked', 'In Transit', 'Arrived', 'Delivered', 'Cancelled'],
        default: 'Booked'
    }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
