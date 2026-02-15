import { Response } from 'express';
import Branch from '../models/Branch';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAudit } from '../utils/auditLogger';

export const getBranches = catchAsync(async (req: AuthRequest, res: Response) => {
    const { scope } = req.query;
    const user = req.user;

    const query: any = { isActive: true };

    // If scope is reports, filter based on permissions
    if (scope === 'reports' && user && user.role === 'BRANCH') {
        const userBranch = await Branch.findById(user.branchId);
        const branchName = userBranch?.name?.toLowerCase();

        if (branchName === 'hirabagh') {
            // See all
        } else if (branchName === 'bapunagar') {
            const allowedNames = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];
            query.name = { $in: allowedNames.map(n => new RegExp(`^${n}$`, 'i')) };
        } else {
            query._id = user.branchId;
        }
    }

    const branches = await Branch.find(query)
        .select("_id name branchCode")
        .sort({ name: 1 })
        .lean();

    return res.json(branches);
});

export const createBranch = catchAsync(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const user = req.user;

    const newBranch = await Branch.create({
        ...body,
        isActive: body.isActive !== undefined ? body.isActive : true
    });

    await logAudit({
        userId: user._id,
        action: 'CREATE_BRANCH',
        entityType: 'Branch',
        entityId: newBranch._id.toString(),
        newValue: body,
        req
    });

    return res.status(201).json(newBranch);
});

export const updateBranch = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body = req.body;
    const user = req.user;

    const branch = await Branch.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true }
    );

    if (!branch) {
        throw new AppError('Branch not found', 404);
    }

    await logAudit({
        userId: user._id,
        action: 'UPDATE_BRANCH',
        entityType: 'Branch',
        entityId: id,
        newValue: body,
        req
    });

    return res.json(branch);
});
