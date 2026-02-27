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
    }).select('+password +role +branch +branchId').populate('branch').populate('branchId');

    if (!user) {
        throw new AppError('Invalid credentials or user not found', 401);
    }

    // Check if user account is active
    if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact the administrator.', 403);
    }

    const activeBranch: any = user.branch || user.branchId;

    // For branch users, check if their branch is active
    if (user.role === 'BRANCH' && activeBranch && !activeBranch.isActive) {
        throw new AppError('Your branch is currently inactive. Please contact the administrator.', 403);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new AppError('Invalid credentials or password', 401);
    }

    // Branch Validation
    if (branchId) {
        const userBranchIdStr = activeBranch?._id?.toString() || user.branchId?.toString();
        if (userBranchIdStr && userBranchIdStr !== branchId) {
            throw new AppError(`Access denied. You belong to ${activeBranch?.name || 'another branch'}`, 403);
        }
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user._id, role: user.role, branchId: activeBranch?._id },
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
            branchId: activeBranch?._id?.toString() || null,
            branchName: activeBranch?.name || 'Global',
        }
    });
});
