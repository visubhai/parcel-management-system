import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import ReportPermission from '../models/ReportPermission';
import AuditLog from '../models/AuditLog';
import { catchAsync, AppError } from '../middleware/errorHandler';

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
