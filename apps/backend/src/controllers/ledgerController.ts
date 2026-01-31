import { Request, Response } from 'express';
import Transaction from '../models/Transaction';

export const addTransaction = async (req: Request, res: Response): Promise<any> => {
    try {
        const body = req.body;
        if (!body.branchId || !body.amount || !body.type || !body.description) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newTransaction = await Transaction.create(body);

        return res.status(201).json({
            message: "Transaction added successfully",
            transaction: newTransaction
        });

    } catch (error) {
        console.error("Error adding transaction:", error);
        return res.status(500).json({ error: "Failed to add transaction" });
    }
};

export const getTransactions = async (req: Request, res: Response): Promise<any> => {
    try {
        const { branchId, date } = req.query;

        if (!branchId) {
            return res.status(400).json({ error: "Branch ID required" });
        }

        const query: any = { branchId };

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

    } catch (error) {
        console.error("Error fetching ledger:", error);
        return res.status(500).json({ error: "Failed to fetch ledger" });
    }
};
