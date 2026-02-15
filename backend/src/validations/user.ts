import { z } from 'zod';

export const toggleUserStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
    }),
    body: z.object({
        isActive: z.boolean()
    })
});

export const getUsersSchema = z.object({
    query: z.object({
        role: z.enum(['SUPER_ADMIN', 'BRANCH']).optional(),
        branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID").optional(),
    }).optional()
});

export const resetPasswordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
    }),
    body: z.object({
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Invalid email"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(['SUPER_ADMIN', 'BRANCH']),
        branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID").optional(),
        allowedBranches: z.array(z.string()).optional(),
        allowedReports: z.array(z.string()).optional(),
        isActive: z.boolean().optional()
    })
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
    }),
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        username: z.string().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(['SUPER_ADMIN', 'BRANCH']).optional(),
        branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID").optional(),
        allowedBranches: z.array(z.string()).optional(),
        allowedReports: z.array(z.string()).optional(),
        isActive: z.boolean().optional()
    })
});
