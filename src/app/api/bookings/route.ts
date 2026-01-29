import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/db';
import Booking from '@/backend/models/Booking';
import Branch from '@/backend/models/Branch';

// GET: Fetch Bookings
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const fromBranch = searchParams.get('fromBranch');
        const toBranch = searchParams.get('toBranch');
        const status = searchParams.get('status');

        const query: any = {};
        if (fromBranch) query.fromBranch = fromBranch;
        if (toBranch) query.toBranch = toBranch;
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('fromBranch', 'name branchCode')
            .populate('toBranch', 'name branchCode')
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

// POST: Create New Booking
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // 1. Generate LR Number
        // Simple logic: timestamp + random. For production, maybe a counter.
        // Format: LR-{BranchCode}-{Random4}
        const fromBranch = await Branch.findById(body.fromBranch);
        if (!fromBranch) {
            return NextResponse.json({ error: "Invalid Source Branch" }, { status: 400 });
        }

        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const lrNumber = `LR${fromBranch.branchCode}${dateStr}${randomNum}`;

        const newBooking = await Booking.create({
            ...body,
            lrNumber
        });

        return NextResponse.json({
            message: "Booking created successfully",
            booking: newBooking
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
    }
}
