import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import ReportPermission from '../models/ReportPermission';
import Booking from '../models/Booking'; // For hardDeleteBooking
import Transaction from '../models/Transaction'; // For hardDeleteBooking
import AuditLog from '../models/AuditLog';
import Counter from '../models/Counter';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/auditLogger';

export const getCounters = catchAsync(async (req: AuthRequest, res: Response) => {
    const counters = await Counter.find().populate('branchId', 'name branchCode');
    return res.json(counters);
});

export const updateCounter = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { count } = req.body;
    const user = req.user;

    const updated = await Counter.findByIdAndUpdate(
        id,
        { count },
        { new: true }
    ).populate('branchId', 'name branchCode');

    if (!updated) {
        throw new AppError('Counter not found', 404);
    }

    await logAudit({
        userId: user._id,
        action: 'UPDATE_COUNTER',
        entityType: 'Counter',
        entityId: id,
        newValue: { count },
        req
    });

    return res.json(updated);
});

export const getBranchPermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { branchId } = req.params;
    const permissions = await ReportPermission.findOne({ branchId });

    if (!permissions) {
        return res.json({ branchId, allowedReports: [] });
    }

    return res.json(permissions);
});

export const updateBranchPermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { branchId } = req.params;
    const { allowedReports } = req.body;
    const user = req.user;

    const updated = await ReportPermission.findOneAndUpdate(
        { branchId },
        {
            allowedReports,
            createdBy: user._id,
            updatedAt: new Date()
        },
        { upsert: true, new: true }
    );

    return res.json({ message: 'Permissions updated successfully', data: updated });
});

export const createBranchPermissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { branchId, allowedReports } = req.body;
    const user = req.user;

    try {
        const newPermission = await ReportPermission.create({
            branchId,
            allowedReports,
            createdBy: user._id
        });

        return res.status(201).json({ message: 'Permissions created successfully', data: newPermission });
    } catch (error: any) {
        if (error.code === 11000) {
            throw new AppError('Permissions already exist for this branch. Use PUT to update.', 400);
        }
        throw error;
    }
});

export const getAuditLogs = catchAsync(async (req: AuthRequest, res: Response) => {
    const { limit = 50, page = 1, entityType, action } = req.query;

    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
        .populate('userId', 'name username role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await AuditLog.countDocuments(query);

    // Performance: Short term cache for audit logs
    res.setHeader('Cache-Control', 'private, max-age=60');

    return res.json({
        total,
        page: Number(page),
        limit: Number(limit),
        data: logs
    });
});

export const hardDeleteBooking = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    const booking = await Booking.findById(id);
    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    // Hard delete
    await Booking.findByIdAndDelete(id);

    // Also delete associated transaction if it exists
    await Transaction.deleteMany({ referenceId: id });

    await logAudit({
        userId: user._id,
        action: 'DELETE_BOOKING',
        entityType: 'Booking',
        entityId: id,
        oldValue: booking,
        newValue: null,
        req
    });

    return res.json({ message: "Booking permanently deleted" });
});
