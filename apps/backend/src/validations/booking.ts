import { z } from 'zod';

const parcelSchema = z.object({
    quantity: z.number().int().positive("Quantity must be at least 1"),
    itemType: z.string().min(1, "Item type is required"),
    weight: z.number().optional(),
    rate: z.number().min(0, "Rate cannot be negative").optional(),
});

const personalInfoSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

export const updateBookingStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
    }),
    body: z.object({
        status: z.enum(["INCOMING", "PENDING", "DELIVERED", "CANCELLED", "ARRIVED", "IN_TRANSIT"]),
        deliveredRemark: z.string().optional(),
    })
});

export const updateBookingSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
    }),
    body: z.object({
        remarks: z.string().optional(),
    })
});

export const createBookingSchema = z.object({
    body: z.object({
        fromBranch: z.string().min(1, "Source branch is required"),
        toBranch: z.string().min(1, "Destination branch is required"),
        sender: personalInfoSchema,
        receiver: personalInfoSchema,
        parcels: z.array(parcelSchema).min(1, "At least one parcel is required"),
        costs: z.object({
            freight: z.number().min(0),
            handling: z.number().min(0).default(10),
            hamali: z.number().min(0).default(0),
            total: z.number().min(0),
        }),
        paymentType: z.enum(["Paid", "To Pay"]),
        remarks: z.string().optional(),
    })
});

export const getBookingsSchema = z.object({
    query: z.object({
        fromBranch: z.string().optional(),
        toBranch: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        lrNumber: z.string().optional(),
        export: z.enum(['pdf', 'excel']).optional(),
        reportType: z.enum(['BOOKING_REPORT', 'LOADING_REPORT', 'UNLOADING_REPORT', 'COLLECTION_REPORT']).optional(),
    }).optional()
});
