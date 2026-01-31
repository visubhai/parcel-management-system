import { z } from 'zod';

export const getBranchesSchema = z.object({
    query: z.object({
        isActive: z.string().optional(),
    }).optional()
});
