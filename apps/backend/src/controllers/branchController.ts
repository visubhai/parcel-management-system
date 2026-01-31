import { Request, Response } from 'express';
import Branch from '../models/Branch';

export const getBranches = async (req: Request, res: Response): Promise<any> => {
    try {
        const branches = await Branch.find({ isActive: true })
            .select("_id name branchCode")
            .sort({ name: 1 })
            .lean();

        return res.json(branches);
    } catch (error) {
        console.error("Error fetching branches:", error);
        return res.status(500).json({
            error: "Failed to fetch branches",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
};
