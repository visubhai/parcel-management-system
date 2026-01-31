import { Request, Response } from 'express';
import Branch from '../models/Branch';
import { catchAsync } from '../middleware/errorHandler';

export const getBranches = catchAsync(async (req: Request, res: Response) => {
    const branches = await Branch.find({ isActive: true })
        .select("_id name branchCode")
        .sort({ name: 1 })
        .lean();

    return res.json(branches);
});
