import { z } from 'zod';

export const getBranchesSchema = z.object({
    query: z.object({
        isActive: z.string().optional(),
        scope: z.string().optional()
    }).optional()
});

export const createBranchSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        branchCode: z.string().min(2, "Branch code is required"),
        state: z.string().min(2, "State is required"),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional()
    })
});

export const updateBranchSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID"),
    }),
    body: z.object({
        name: z.string().optional(),
        branchCode: z.string().optional(),
        state: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional()
    })
});
