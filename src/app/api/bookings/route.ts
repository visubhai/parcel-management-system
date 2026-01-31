import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/db';
import Booking from '@/backend/models/Booking';
import Branch from '@/backend/models/Branch';
import Transaction from '@/backend/models/Transaction';
import Counter from '@/backend/models/Counter';

// GET: Fetch Bookings
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const fromBranch = searchParams.get('fromBranch');
        const toBranch = searchParams.get('toBranch');
        const status = searchParams.get('status');

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: any = {};
        if (fromBranch) query.fromBranch = fromBranch;
        if (toBranch) query.toBranch = toBranch;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                // To handle timezone offsets (e.g. user is in IST but server is UTC), 
                // we broaden the start date by 1 day if it's just a YYYY-MM-DD string.
                const start = new Date(startDate);
                start.setDate(start.getDate() - 1);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

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

        // 1. Generate Sequential LR Number
        const fromBranch = await Branch.findById(body.fromBranch);
        if (!fromBranch) {
            return NextResponse.json({ error: "Invalid Source Branch" }, { status: 400 });
        }

        // Atomically increment the counter for this branch
        const counter = await Counter.findOneAndUpdate(
            { branchId: fromBranch._id, entity: 'Booking', field: 'lrNumber' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        // Format: {BranchCode}/{PaddedSequence} (e.g., HR/0001)
        const sequenceStr = counter.count.toString().padStart(4, '0');
        const lrNumber = `${fromBranch.branchCode}/${sequenceStr}`;

        const newBooking = await Booking.create({
            ...body,
            lrNumber
        });

        // 2. Create Ledger Transaction if "Paid"
        if (body.paymentType === 'Paid') {
            await Transaction.create({
                branchId: body.fromBranch,
                type: 'CREDIT',
                amount: body.costs.total,
                description: `Booking Revenue: ${lrNumber}`,
                referenceId: newBooking._id.toString()
            });
        }

        // 3. Fire-and-Forget WhatsApp Notification (Background)
        (async () => {
            try {
                // Construct Message
                const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

                // Get branch name safely (populate didn't happen on newBooking, but we have fromBranch object)
                const fromBranchName = fromBranch.name;
                // We only have toBranch ID, need to populate or just show "Dest" if not fetched. 
                // Actually, front-end sends IDs. We might need to fetch toBranch name if not available.
                // For speed, let's try to fetch it or just use ID/Code if name unavailable.
                // However, we don't want to slow down this main thread? 
                // Wait, this async block IS detached from the response return. We can fetch here!

                let toBranchName = "Destination";
                try {
                    const toBranchObj = await Branch.findById(body.toBranch);
                    if (toBranchObj) toBranchName = toBranchObj.name;
                } catch (e) { console.error("Error fetching toBranch for WA", e); }

                const message = `📦 *BOOKING CONFIRMATION*\n*SAVAN LOGISTICS*\n\n📄 *LR No:* ${lrNumber}\n📍 *Route:* ${fromBranchName} ➡️ ${toBranchName}\n📦 *Package:* ${body.parcels.map((p: any) => `${p.quantity} ${p.itemType}`).join(', ')}\n💰 *Total:* ₹${body.costs.total.toFixed(2)}\n📅 *Date:* ${dateStr}\n\n_Thank you for shipping with us!_`;

                // Send to Sender
                if (body.sender?.mobile) {
                    await fetch('http://localhost:3001/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mobile: body.sender.mobile,
                            message: message
                        })
                    }).catch(err => console.error("WA Trigger Error (Sender):", err.message));
                }

            } catch (bgError) {
                console.error("Background Notification Error:", bgError);
            }
        })();

        return NextResponse.json({
            message: "Booking created successfully",
            booking: newBooking
        }, { status: 201 });

    } catch (error: any) {
        console.error("DEBUG: POST /api/bookings error:", error);

        // Handle Mongoose CastError (e.g. invalid ObjectId)
        if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId failed')) {
            return NextResponse.json({
                error: "Invalid data format (Branch ID or User ID is malformed)",
                details: error.message
            }, { status: 400 });
        }

        return NextResponse.json({
            error: error.message || "Failed to create booking"
        }, { status: 500 });
    }
}
