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

    // Requirement Update: Multi-branch visibility for specific branches in Reports
    if (user.role === 'BRANCH') {
        const userBranch = await Branch.findById(user.branchId);
        const branchName = userBranch?.name?.toLowerCase();

        if (branchName === 'hirabagh') {
            // Global Access: No query restriction
        } else if (branchName === 'bapunagar') {
            // Special Case: Bapunagar sees 4 specific branches
            const allowedNames = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];
            const allowedBranches = await Branch.find({
                name: { $in: allowedNames.map(n => new RegExp(`^${n}$`, 'i')) }
            }).select('_id');
            const allowedIds = allowedBranches.map(b => b._id);

            query.$or = [
                { senderBranchId: { $in: allowedIds } },
                { receiverBranchId: { $in: allowedIds } }
            ];
        } else {
            // Standard Case: Only own branch
            query.$or = [
                { senderBranchId: user.branchId },
                { receiverBranchId: user.branchId }
            ];
        }
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

    if (!fromBranch.isActive) {
        throw new AppError("Source branch is currently inactive. Booking is not allowed.", 403);
    }

    const toBranch = await Branch.findById(body.toBranch);
    if (!toBranch) {
        throw new AppError("Invalid Destination Branch", 400);
    }

    if (!toBranch.isActive) {
        throw new AppError("Destination branch is currently inactive. Booking is not allowed.", 403);
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
        status: 'PENDING' // Requirement: must go to pending initially
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

    // Background SMS Notification
    (async () => {
        try {
            const fromBranchName = fromBranch.name;
            let toBranchName = "Destination";
            try {
                const toBranchObj = await Branch.findById(body.toBranch);
                if (toBranchObj) toBranchName = toBranchObj.name;
            } catch (e) { /* ignore */ }

            // Custom Template matching Printed Builty
            // Template:
            // Savan Transport
            // Dear <Receiver>, Parcel booked. LR: <LR>. From <From> to <To>. Pay: <Type>. Amount: Rs <Total>. Thank you.
            const message = `Savan Transport\n\nDear ${body.receiver.name},\nParcel booked.\nLR: ${lrNumber}\nFrom ${fromBranchName} to ${toBranchName}\nPay: ${body.paymentType}\nAmount: Rs ${body.costs.total}\n\nThank you.`;

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
    const { status, deliveredRemark, collectedBy, collectedByMobile } = req.body;
    // Debug: Ensure collectedBy fields are present in body
    const user = req.user;

    const updateData: any = { status };

    // Requirement 2: Manual Delivery Logic
    if (status === 'DELIVERED') {
        if (!deliveredRemark) {
            throw new AppError("Remarks are required for delivery collection.", 400);
        }
        updateData.deliveredRemark = deliveredRemark;
        if (collectedBy) updateData.collectedBy = collectedBy;
        if (collectedByMobile) updateData.collectedByMobile = collectedByMobile;
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
        newValue: { status, deliveredRemark, collectedBy, collectedByMobile },
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

    // Requirement: Price and Parcel details must remain same after booking.
    delete body.costs;
    delete body.parcels;
    delete body.paymentType;
    delete body.lrNumber;
    delete body.fromBranch;
    delete body.toBranch;

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

    // Robustness: If status changes to DELIVERED via Edit Modal, ensure timestamps are set
    if (body.status === 'DELIVERED' && oldBooking.status !== 'DELIVERED') {
        if (!body.deliveredAt) body.deliveredAt = new Date();
        if (!body.deliveredBy) body.deliveredBy = user._id;
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
        oldValue: {
            remarks: oldBooking.remarks,
            deliveredRemark: oldBooking.deliveredRemark,
            collectedBy: oldBooking.collectedBy,
            collectedByMobile: oldBooking.collectedByMobile
        },
        newValue: {
            remarks: body.remarks,
            deliveredRemark: body.deliveredRemark,
            collectedBy: body.collectedBy,
            collectedByMobile: body.collectedByMobile
        },
        req
    });

    return res.json({
        message: "Booking updated successfully",
        booking: updatedBooking
    });
});

export const getNextLR = catchAsync(async (req: AuthRequest, res: Response) => {
    const { branchId } = req.query;

    if (!branchId) {
        throw new AppError("Branch ID is required", 400);
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
        throw new AppError("Branch not found", 404);
    }

    const counter = await Counter.findOne({
        branchId: branch._id,
        entity: 'Booking',
        field: 'lrNumber'
    });

    const currentCount = counter ? counter.count : 0;
    const nextCount = currentCount + 1;
    const sequenceStr = nextCount.toString().padStart(4, '0');
    const nextLR = `${branch.branchCode}/${sequenceStr}`;

    return res.json({ nextLR });
});


