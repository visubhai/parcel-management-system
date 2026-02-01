import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { catchAsync, AppError } from '../middleware/errorHandler';

export const login = catchAsync(async (req: Request, res: Response) => {
    const { username, password, branchId } = req.body;

    // Support login by Email OR Username
    const user = await User.findOne({
        $or: [
            { email: username },
            { username: username },
        ]
    }).select('+password +role +branch').populate('branch');

    if (!user) {
        throw new AppError('Invalid credentials or user not found', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new AppError('Invalid credentials or password', 401);
    }

    // Branch Validation
    if (branchId) {
        const userBranchId = user.branch?._id || user.branchId;
        if (userBranchId && userBranchId.toString() !== branchId) {
            throw new AppError(`Access denied. You belong to ${user.branch?.name || 'another branch'}`, 403);
        }
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user._id, role: user.role, branchId: user.branch?._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    // Return user data and token
    return res.json({
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branch?._id?.toString() || null,
            branchName: user.branch?.name || 'Global',
        }
    });
});
