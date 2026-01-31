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
