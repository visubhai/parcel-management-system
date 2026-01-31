import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find({})
            .select('-password') // Exclude password
            .populate('branch', 'name code') // Populate branch details
            .sort({ createdAt: -1 });

        // Map to frontend expected format if necessary, or just return
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
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive must be a boolean' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Error toggling user status:', error);
        return res.status(500).json({ error: 'Failed to update user status' });
    }
};
