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

export const createUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { name, email, username, password, role, branchId, allowedBranches, allowedReports, isActive } = req.body;
    const adminUser = req.user;

    // Support both username and email, but one must be unique
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new AppError('User with this email or username already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        username,
        password: hashedPassword,
        role,
        branchId,
        branch: branchId, // Keep synced
        allowedBranches: allowedBranches || [],
        allowedReports: allowedReports || [],
        isActive: isActive !== undefined ? isActive : true
    });

    await logAudit({
        userId: adminUser._id,
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: newUser._id.toString(),
        newValue: { name, email, username, role, branchId },
        req
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json(userResponse);
});

export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, email, username, password, role, branchId, allowedBranches, allowedReports, isActive } = req.body;
    const adminUser = req.user;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const updates: any = {
        name,
        email,
        username,
        role,
        branchId,
        branch: branchId,
        allowedBranches,
        allowedReports,
        isActive
    };

    if (password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
    ).select('-password');

    await logAudit({
        userId: adminUser._id,
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: id,
        newValue: updates,
        req
    });

    return res.json(updatedUser);
});
