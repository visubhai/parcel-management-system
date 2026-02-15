import { z } from 'zod';

export const addTransactionSchema = z.object({
    body: z.object({
        branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID"),
        amount: z.number().positive("Amount must be positive"),
        type: z.enum(['CREDIT', 'DEBIT']),
        description: z.string().min(1, "Description is required"),
        referenceId: z.string().optional(),
    })
});

export const getTransactionsSchema = z.object({
    query: z.object({
        branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid branch ID").optional(),
        date: z.string().optional(),
    })
});
