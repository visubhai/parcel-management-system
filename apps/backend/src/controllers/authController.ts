import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Branch from '../models/Branch';

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, branchId } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        // Support login by Email OR Username
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: email },
            ]
        }).select('+password +role +branch').populate('branch');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Branch Validation
        if (branchId) {
            if (user.branch && user.branch._id.toString() !== branchId) {
                return res.status(403).json({ error: `Access denied. You belong to ${user.branch.name}` });
            }
        }

        // Return user data for session
        return res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branch?._id?.toString() || null,
            branchName: user.branch?.name || 'Global',
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
