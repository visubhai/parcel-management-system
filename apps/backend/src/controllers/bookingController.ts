import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Booking from '../models/Booking';
import Branch from '../models/Branch';
import Counter from '../models/Counter';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';
import { whatsappService } from '../services/whatsapp';
import { exportService } from '../services/exportService';
import ReportPermission from '../models/ReportPermission';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/auditLogger';

export const getBookings = catchAsync(async (req: AuthRequest, res: Response) => {
    const { fromBranch, toBranch, status, startDate, endDate, lrNumber, export: exportType, reportType = 'BOOKING_REPORT' } = req.query;
    const user = req.user;

    const query: any = {};

    // Requirement 3: Strong Branch Data Isolation
    // Branch users can only see parcels where they are the sender or receiver.
    // This is automatic and does not require extra permissions.
    if (user.role === 'BRANCH') {
        query.$or = [
            { senderBranchId: user.branchId },
            { receiverBranchId: user.branchId }
        ];
    }

    if (fromBranch) {
        const items = (fromBranch as string).split(',');
        const ids = items.filter(item => mongoose.Types.ObjectId.isValid(item));
        const names = items.filter(item => !mongoose.Types.ObjectId.isValid(item));

        const branchIds = [...ids];
        if (names.length > 0) {
            const branches = await Branch.find({ name: { $in: names } }).select('_id');
            branchIds.push(...branches.map(b => b._id.toString()));
        }

        if (branchIds.length > 0) {
            query.fromBranch = branchIds.length > 1 ? { $in: branchIds } : branchIds[0];
        } else {
            query.fromBranch = new mongoose.Types.ObjectId();
        }
    }
    if (toBranch) {
        const items = (toBranch as string).split(',');
        const ids = items.filter(item => mongoose.Types.ObjectId.isValid(item));
        const names = items.filter(item => !mongoose.Types.ObjectId.isValid(item));

        const branchIds = [...ids];
        if (names.length > 0) {
            const branches = await Branch.find({ name: { $in: names } }).select('_id');
            branchIds.push(...branches.map(b => b._id.toString()));
        }

        if (branchIds.length > 0) {
            query.toBranch = branchIds.length > 1 ? { $in: branchIds } : branchIds[0];
        } else {
            query.toBranch = new mongoose.Types.ObjectId();
        }
    }
    if (status) query.status = status;
    if (lrNumber) query.lrNumber = { $regex: lrNumber, $options: 'i' }; // Substring case-insensitive match

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            const start = new Date(startDate as string);
            start.setHours(0, 0, 0, 0);
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

    // Requirement 4: Report Export Support
    if (exportType === 'pdf') {
        return exportService.generatePDF(res, bookings, {
            branchName: user.branchName || 'All Branches',
            reportType: reportType as string,
            dateRange: `${startDate || 'Start'} - ${endDate || 'End'}`,
            generatedBy: user.name
        });
    }
    if (exportType === 'excel') {
        return exportService.generateExcel(res, bookings, {
            branchName: user.branchName || 'All Branches',
            reportType: reportType as string,
            dateRange: `${startDate || 'Start'} - ${endDate || 'End'}`,
            generatedBy: user.name
        });
    }

    // Performance: Add short-term cache for report data
    res.setHeader('Cache-Control', 'private, max-age=30'); // 30 seconds cache for user-specific data

    return res.json(bookings);
});

export const createBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const user = req.user;

    // Requirement 3: Sender Branch Lock
    if (user.role === 'BRANCH' && body.fromBranch !== user.branchId.toString()) {
        throw new AppError("Sender branch must be your logged-in branch.", 403);
    }

    const fromBranch = await Branch.findById(body.fromBranch);
    if (!fromBranch) {
        throw new AppError("Invalid Source Branch", 400);
    }

    const counter = await Counter.findOneAndUpdate(
        { branchId: fromBranch._id, entity: 'Booking', field: 'lrNumber' },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
    );

    if (!counter) throw new AppError("Failed to generate counter", 500);

    const sequenceStr = counter.count.toString().padStart(4, '0');
    const lrNumber = `${fromBranch.branchCode}/${sequenceStr}`;

    // Enterprise logic: Set senderBranchId, receiverBranchId, and initial status
    const newBooking = await Booking.create({
        ...body,
        lrNumber,
        senderBranchId: body.fromBranch,
        receiverBranchId: body.toBranch,
        status: 'INCOMING' // Requirement 2: Initial status
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
            } catch (e) { /* ignore in background */ }

            const remarksStr = body.remarks ? `\n📝 *Remarks:* ${body.remarks}` : '';
            const message = `📦 *BOOKING CONFIRMATION*\n*SAVAN LOGISTICS*\n\n📄 *LR No:* ${lrNumber}\n📍 *Route:* ${fromBranchName} ➡️ ${toBranchName}\n📦 *Package:* ${body.parcels.map((p: any) => `${p.quantity} ${p.itemType}`).join(', ')}\n💰 *Total:* ₹${body.costs.total.toFixed(2)}\n📅 *Date:* ${dateStr}${remarksStr}\n\n_Thank you for shipping with us!_`;

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
});

export const updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, deliveredRemark } = req.body;
    const user = req.user;

    const updateData: any = { status };

    // Requirement 2: Manual Delivery Logic
    if (status === 'DELIVERED') {
        if (!deliveredRemark) {
            throw new AppError("Remarks are required for delivery collection.", 400);
        }
        updateData.deliveredRemark = deliveredRemark;
        updateData.deliveredAt = new Date();
        updateData.deliveredBy = user._id;
    }

    const booking = await Booking.findByIdAndUpdate(
        id,
        updateData,
        { new: false } // return the document BEFORE update
    );

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    await logAudit({
        userId: user._id,
        action: 'STATUS_CHANGE',
        entityType: 'Booking',
        entityId: id,
        oldValue: { status: booking.status },
        newValue: { status, deliveredRemark },
        req
    });

    return res.json({ message: "Status updated", booking });
});

export const updateBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body = req.body;
    const user = req.user;

    const oldBooking = await Booking.findById(id);
    if (!oldBooking) throw new AppError("Booking not found", 404);

    // track history if remarks or deliveredRemark changed
    const editHistory = [...(oldBooking.editHistory || [])];
    if (body.remarks !== undefined && body.remarks !== oldBooking.remarks) {
        editHistory.push({
            oldRemark: oldBooking.remarks,
            newRemark: body.remarks,
            editedBy: user._id,
            editedAt: new Date()
        });
    }

    if (body.deliveredRemark !== undefined && body.deliveredRemark !== oldBooking.deliveredRemark) {
        editHistory.push({
            oldRemark: oldBooking.deliveredRemark,
            newRemark: body.deliveredRemark,
            editedBy: user._id,
            editedAt: new Date()
        });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { ...body, editHistory },
        { new: true }
    );

    await logAudit({
        userId: user._id,
        action: 'UPDATE_BOOKING',
        entityType: 'Booking',
        entityId: id,
        oldValue: { remarks: oldBooking.remarks },
        newValue: { remarks: body.remarks },
        req
    });

    return res.json({
        message: "Booking updated successfully",
        booking: updatedBooking
    });
});
