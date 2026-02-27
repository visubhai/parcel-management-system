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

import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import AuditLog from '../models/AuditLog';

export const createBranch = catchAsync(async (req: AuthRequest, res: Response) => {
    const { name, branchCode, state, address, phone, username, password, isActive } = req.body;
    const adminUser = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create Branch
        const [newBranch] = await Branch.create([{
            name,
            branchCode,
            state: state || 'Gujarat', // Fallback if missing
            address,
            phone,
            isActive: isActive !== undefined ? isActive : true
        }], { session });

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        // 3. Create Branch Admin User
        const [newUser] = await User.create([{
            name: `${name} Admin`,
            username: username || branchCode.toLowerCase(),
            email: `${branchCode.toLowerCase()}@kisan.local`, // auto format
            password: hashedPassword,
            role: 'BRANCH',
            branchId: newBranch._id,
            branch: newBranch._id, // Sync both fields for populated tables
            isActive: true
        }], { session });

        // 4. Create Audit Log
        await AuditLog.create([{
            userId: adminUser._id,
            action: 'CREATE_BRANCH_WITH_ADMIN',
            entityType: 'Branch',
            entityId: newBranch._id.toString(),
            briefContext: `Created branch ${branchCode} and admin user`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(newBranch);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

export const updateBranch = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const body = req.body;
    const adminUser = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const branch = await Branch.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, session }
        );

        if (!branch) {
            throw new AppError('Branch not found', 404);
        }

        if (body.isActive !== undefined) {
            await User.updateMany({ branchId: id }, { isActive: body.isActive }, { session });
        }

        await AuditLog.create([{
            userId: adminUser._id,
            action: 'UPDATE_BRANCH',
            entityType: 'Branch',
            entityId: id,
            briefContext: `Updated branch ${branch.branchCode} with isActive=${body.isActive !== undefined ? body.isActive : 'unchanged'}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.json(branch);
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update Branch Error:", error);
        throw new AppError('Failed to update branch', 500);
    }
});
