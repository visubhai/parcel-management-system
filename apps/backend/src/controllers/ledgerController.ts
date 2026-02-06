import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';
import Branch from '../models/Branch';
import mongoose from 'mongoose';
import { catchAsync, AppError } from '../middleware/errorHandler';

export const addTransaction = catchAsync(async (req: AuthRequest, res: Response) => {
    const body = req.body;
    const user = req.user;

    // Restriction: Branch users can only add transactions for their own branch
    if (user.role === 'BRANCH' && body.branchId !== user.branchId.toString()) {
        throw new AppError("You can only record transactions for your own branch.", 403);
    }

    const newTransaction = await Transaction.create(body);

    return res.status(201).json({
        message: "Transaction added successfully",
        transaction: newTransaction
    });
});

export const getTransactions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { branchId, date } = req.query;
    const user = req.user;

    const userBranch = await Branch.findById(user.branchId);
    const branchName = userBranch?.name?.toLowerCase();

    // Determine Allowed Branch IDs for filter validation
    let allowedBranchIds: string[] = [];
    if (user.role === 'BRANCH') {
        if (branchName === 'hirabagh') {
            // All branches allowed
        } else if (branchName === 'bapunagar') {
            const allowedNames = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];
            const branches = await Branch.find({
                name: { $in: allowedNames.map(n => new RegExp(`^${n}$`, 'i')) }
            }).select('_id');
            allowedBranchIds = branches.map(b => b._id.toString());
        } else {
            allowedBranchIds = [user.branchId.toString()];
        }
    }

    let targetBranchId = branchId as string;

    // Enforce Restriction
    if (user.role === 'BRANCH' && branchName !== 'hirabagh') {
        if (!targetBranchId || !allowedBranchIds.includes(targetBranchId)) {
            // If invalid or missing, default to their primary branch
            targetBranchId = user.branchId.toString();
        }
    }

    if (!targetBranchId && user.role === 'BRANCH' && branchName !== 'hirabagh') {
        throw new AppError("Branch ID required", 400);
    }

    const query: any = {};
    if (targetBranchId) query.branchId = targetBranchId;

    if (date) {
        const startOfDay = new Date(date as string);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date as string);
        endOfDay.setHours(23, 59, 59, 999);

        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    const totalRevenue = transactions
        .filter(t => t.type === 'CREDIT')
        .reduce((sum, t) => sum + t.amount, 0);

    return res.json({
        transactions,
        stats: {
            total_revenue: totalRevenue,
            count: transactions.length
        }
    });
});
