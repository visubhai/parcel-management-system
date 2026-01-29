import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/backend/db';
import Transaction from '@/backend/models/Transaction';
import mongoose from 'mongoose';

// POST: Add Transaction
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Basic validation
        if (!body.branchId || !body.amount || !body.type || !body.description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newTransaction = await Transaction.create(body);

        return NextResponse.json({
            message: "Transaction added successfully",
            transaction: newTransaction
        }, { status: 201 });

    } catch (error) {
        console.error("Error adding transaction:", error);
        return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
    }
}

// GET: Fetch Transactions / Stats
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const branchId = searchParams.get('branchId');
        const date = searchParams.get('date');

        if (!branchId) {
            return NextResponse.json({ error: "Branch ID required" }, { status: 400 });
        }

        // Daily Stats Query
        // For simplicity now, just returning today's transactions or empty list if no date
        const query: any = { branchId };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 });

        // Calculate simple stats
        const totalRevenue = transactions
            .filter(t => t.type === 'CREDIT')
            .reduce((sum, t) => sum + t.amount, 0);

        return NextResponse.json({
            transactions,
            stats: {
                total_revenue: totalRevenue,
                count: transactions.length
            }
        });

    } catch (error) {
        console.error("Error fetching ledger:", error);
        return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
    }
}
