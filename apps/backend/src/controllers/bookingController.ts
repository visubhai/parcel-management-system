import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Branch from '../models/Branch';
import Counter from '../models/Counter';
import Transaction from '../models/Transaction';
import { whatsappService } from '../services/whatsapp';

export const getBookings = async (req: Request, res: Response): Promise<any> => {
    try {
        const { fromBranch, toBranch, status, startDate, endDate } = req.query;

        const query: any = {};
        if (fromBranch) query.fromBranch = fromBranch;
        if (toBranch) query.toBranch = toBranch;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                const start = new Date(startDate as string);
                start.setDate(start.getDate() - 1);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const bookings = await Booking.find(query)
            .populate('fromBranch', 'name branchCode')
            .populate('toBranch', 'name branchCode')
            .sort({ createdAt: -1 });

        return res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

export const createBooking = async (req: Request, res: Response): Promise<any> => {
    try {
        const body = req.body;

        const fromBranch = await Branch.findById(body.fromBranch);
        if (!fromBranch) {
            return res.status(400).json({ error: "Invalid Source Branch" });
        }

        const counter = await Counter.findOneAndUpdate(
            { branchId: fromBranch._id, entity: 'Booking', field: 'lrNumber' },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        if (!counter) throw new Error("Failed to generate counter");

        const sequenceStr = counter.count.toString().padStart(4, '0');
        const lrNumber = `${fromBranch.branchCode}/${sequenceStr}`;

        const newBooking = await Booking.create({
            ...body,
            lrNumber
        });

        if (body.paymentType === 'Paid') {
            await Transaction.create({
                branchId: body.fromBranch,
                type: 'CREDIT',
                amount: body.costs.total,
                description: `Booking Revenue: ${lrNumber}`,
                referenceId: newBooking._id.toString()
            });
        }

        // Background WhatsApp Notification
        (async () => {
            try {
                const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
                const fromBranchName = fromBranch.name;

                let toBranchName = "Destination";
                try {
                    const toBranchObj = await Branch.findById(body.toBranch);
                    if (toBranchObj) toBranchName = toBranchObj.name;
                } catch (e) { console.error("Error fetching toBranch for WA", e); }

                const message = `📦 *BOOKING CONFIRMATION*\n*SAVAN LOGISTICS*\n\n📄 *LR No:* ${lrNumber}\n📍 *Route:* ${fromBranchName} ➡️ ${toBranchName}\n📦 *Package:* ${body.parcels.map((p: any) => `${p.quantity} ${p.itemType}`).join(', ')}\n💰 *Total:* ₹${body.costs.total.toFixed(2)}\n📅 *Date:* ${dateStr}\n\n_Thank you for shipping with us!_`;

                if (body.sender?.mobile) {
                    await whatsappService.sendMessage(body.sender.mobile, message);
                }

            } catch (bgError) {
                console.error("Background Notification Error:", bgError);
            }
        })();

        return res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (error: any) {
        console.error("Error creating booking:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: "Invalid data format" });
        }
        return res.status(500).json({ error: error.message || "Failed to create booking" });
    }
};

export const updateStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        return res.json({ message: "Status updated", booking });
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ error: "Failed to update status" });
    }
};
