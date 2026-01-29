import { supabase } from '@/lib/supabase';
import { handleSupabaseRequest, ServiceResponse } from './base';

export interface LedgerEntry {
    parcel_id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT'; // CREDIT = Income (Booking/Collection), DEBIT = Refund/Expense
    description: string;
    branch_id: string; // The branch that collected the money
}

export const ledgerService = {
    /**
     * Record a financial transaction.
     * Use CREDIT for money coming IN (Paid Booking, Delivery Collection).
     * Use DEBIT for money going OUT (Refunds).
     */
    async addTransaction(entry: LedgerEntry): Promise<ServiceResponse<any>> {
        // 1. Get current user (who is recording this?)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: new Error("User not authenticated") };

        // 2. Insert into payment_ledger
        const request = supabase
            .from('payment_ledger')
            .insert({
                parcel_id: entry.parcel_id,
                amount: entry.amount,
                type: entry.type,
                description: entry.description,
                branch_id: entry.branch_id,
                recorded_by: user.id
            })
            .select()
            .single();

        return handleSupabaseRequest(Promise.resolve(request));
    },

    /**
     * Get all transactions for a specific parcel.
     * Useful for auditing specific deliveries.
     */
    async getParcelTransactions(parcelId: string): Promise<ServiceResponse<any[]>> {
        const request = supabase
            .from('payment_ledger')
            .select('*')
            .eq('parcel_id', parcelId)
            .order('created_at', { ascending: true });

        return handleSupabaseRequest(Promise.resolve(request));
    },

    /**
     * Get total revenue collected by a branch today.
     * Useful for end-of-day reconciliation.
     */
    async getDailyRevenue(branchId: string, date: string = new Date().toISOString().split('T')[0]): Promise<ServiceResponse<number>> {
        const { data, error } = await supabase
            .from('payment_ledger')
            .select('amount, type')
            .eq('branch_id', branchId)
            .eq('type', 'CREDIT') // Only count income for now
            .gte('created_at', `${date}T00:00:00`)
            .lte('created_at', `${date}T23:59:59`);

        if (error) return { data: null, error };

        // Calculate sum manually since we can't easily use SUM() via simple client SDK without RPC
        const total = data?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;
        return { data: total, error: null };
    }
};
