import { Response } from 'express';
import Branch from '../models/Branch';
import { catchAsync } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

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
