import { Request, Response } from 'express';
import User from '../models/User';
import { catchAsync, AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await User.find({})
        .select('-password') // Exclude password
        .populate('branch', 'name code') // Populate branch details
        .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch: user.branch ? (user.branch as any).name : 'Global',
        branchId: user.branch ? (user.branch as any)._id : null,
        branchDetails: user.branch,
        isActive: user.isActive,
        createdAt: user.createdAt
    }));

    return res.json(formattedUsers);
});

export const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return res.json(user);
});

export const resetPassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;
    const adminUser = req.user;

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    await logAudit({
        userId: adminUser._id,
        action: 'PASSWORD_RESET',
        entityType: 'User',
        entityId: id,
        req
    });

    return res.json({ message: 'Password reset successful', user });
});
