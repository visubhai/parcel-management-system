import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';
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

    let targetBranchId = branchId;

    // Restriction: Branch users can ONLY see their own branch data
    if (user.role === 'BRANCH') {
        targetBranchId = user.branchId.toString();
    }

    if (!targetBranchId) {
        throw new AppError("Branch ID required", 400);
    }

    const query: any = { branchId: targetBranchId };

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
