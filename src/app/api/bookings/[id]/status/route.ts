import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/db';
import Booking from '@/backend/models/Booking';
import Transaction from '@/backend/models/Transaction';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+
) {
    try {
        await connectDB();
        const { id } = await context.params;
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        const existingBooking = await Booking.findById(id);
        if (!existingBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const oldStatus = existingBooking.status;

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        // -- Ledger Sync Logic --

        // 1. Delivered + To Pay = Credit to destination branch
        if (status === 'Delivered' && oldStatus !== 'Delivered' && updatedBooking.paymentType === 'To Pay') {
            await Transaction.create({
                branchId: updatedBooking.toBranch,
                type: 'CREDIT',
                amount: updatedBooking.costs.total,
                description: `Delivery Collection (To Pay): ${updatedBooking.lrNumber}`,
                referenceId: updatedBooking._id.toString()
            });
        }

        // 2. Cancelled + Paid = Debit (Reversal) from source branch
        if (status === 'Cancelled' && oldStatus !== 'Cancelled' && updatedBooking.paymentType === 'Paid') {
            await Transaction.create({
                branchId: updatedBooking.fromBranch,
                type: 'DEBIT',
                amount: updatedBooking.costs.total,
                description: `Booking Reversal (Cancelled): ${updatedBooking.lrNumber}`,
                referenceId: updatedBooking._id.toString()
            });
        }

        return NextResponse.json({
            message: "Status updated successfully",
            booking: updatedBooking
        });

    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
    }
}
