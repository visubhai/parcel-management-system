import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/db';
import Booking from '@/backend/models/Booking';

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

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
