import { supabase } from '@/lib/supabase';
import { handleSupabaseRequest, ServiceResponse } from './base';
import { ledgerService } from './ledgerService';
import { Booking, Parcel, Branch } from '@/lib/types';

export const parcelService = {
    async getParcels(page = 1, limit = 50): Promise<ServiceResponse<any[]>> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const request = supabase
            .from('parcels')
            .select(`
                *,
                from_branch:from_branch_id(name),
                to_branch:to_branch_id(name)
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

        return handleSupabaseRequest(Promise.resolve(request));
    },

    async getIncomingParcelsByName(branchName: string): Promise<ServiceResponse<any[]>> {
        const request = supabase
            .from('parcels')
            .select(`
                *,
                from_branch:from_branch_id(name),
                to_branch:to_branch_id!inner(name)
            `)
            .eq('to_branch.name', branchName) // Filter by related table field
            .in('status', ['BOOKED', 'IN_TRANSIT', 'ARRIVED'])
            .order('created_at', { ascending: false });

        return handleSupabaseRequest(Promise.resolve(request));
    },

    async getIncomingParcels(branchId: string): Promise<ServiceResponse<any[]>> {
        const request = supabase
            .from('parcels')
            .select(`
                *,
                from_branch:from_branch_id(name),
                to_branch:to_branch_id(name)
            `)
            .eq('to_branch_id', branchId)
            .in('status', ['BOOKED', 'IN_TRANSIT', 'ARRIVED']) // Items coming or here waiting processing
            .order('created_at', { ascending: false });

        return handleSupabaseRequest(Promise.resolve(request));
    },

    async updateParcelStatus(parcelId: string, status: string): Promise<ServiceResponse<void>> {
        // Map UI Status to DB Enum
        const statusMap: Record<string, string> = {
            'Booked': 'BOOKED',
            'In Transit': 'IN_TRANSIT',
            'Arrived': 'ARRIVED',
            'Delivered': 'DELIVERED',
            'Cancelled': 'CANCELLED'
        };
        const dbStatus = statusMap[status] || status;

        const response = await supabase.from('parcels').update({ status: dbStatus }).eq('id', parcelId);
        return { data: null, error: response.error };
    },

    async getBookingsForReports(startDate: string, endDate: string): Promise<ServiceResponse<any[]>> {
        // Query to fetch all matching rows for client-side aggregation (or move aggregation to RPC/Query later)
        // Adjust limit as necessary or implement server-side aggregation
        const request = supabase
            .from('parcels')
            .select(`
                *,
                from_branch:from_branch_id(name),
                to_branch:to_branch_id(name)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59')
            .order('created_at', { ascending: false })
            .limit(2000); // Safety limit

        return handleSupabaseRequest(Promise.resolve(request));
    },

    async createBooking(booking: Partial<Booking>, userId: string): Promise<ServiceResponse<any>> {
        // 1. Resolve Branch IDs (In a real app, IDs should be passed, not names)
        // We assume booking.fromBranch and booking.toBranch are populated with Names for now
        // But we need IDs. 

        // HELPER: Fetch ID for branch name
        const getBranchId = async (name: string) => {
            const cleanName = name?.trim();
            if (!cleanName) return null;

            const { data } = await supabase
                .from('branches')
                .select('id')
                .eq('name', cleanName)
                .maybeSingle(); // Use maybeSingle to avoid 406 errors on duplicates (though unique is expected)

            return data?.id;
        };

        const fromId = await getBranchId(booking.fromBranch || '');
        const toId = await getBranchId(booking.toBranch || '');

        if (!fromId) {
            console.error(`Branch not found: "${booking.fromBranch}"`);
            return { data: null, error: new Error(`Invalid Dispatch Branch: '${booking.fromBranch}' not found or inactive.`) };
        }

        if (!toId) {
            console.error(`Branch not found: "${booking.toBranch}"`);
            return { data: null, error: new Error(`Invalid Destination Branch: '${booking.toBranch}' not found.`) };
        }

        // 2. Generate LR
        const { data: lrNumber, error: lrError } = await supabase.rpc('generate_lr_number', { p_branch_id: fromId });
        if (lrError) return { data: null, error: lrError };

        // 3. Create Parcel
        const { data: parcel, error: parcelError } = await supabase
            .from('parcels')
            .insert({
                lr_number: lrNumber,
                from_branch_id: fromId,
                to_branch_id: toId,
                current_branch_id: fromId,
                status: 'BOOKED',
                sender_name: booking.sender?.name,
                sender_mobile: booking.sender?.mobile,
                receiver_name: booking.receiver?.name,
                receiver_mobile: booking.receiver?.mobile,
                payment_type: booking.paymentType === 'Paid' ? 'PAID' : 'TO_PAY',
                total_amount: booking.costs?.total || 0,
                amount_paid: booking.paymentType === 'Paid' ? (booking.costs?.total || 0) : 0,
                booked_by: userId
            })
            .select()
            .single();

        if (parcelError || !parcel) return { data: null, error: parcelError };

        // 4. Create Items (if any)
        if (booking.parcels && booking.parcels.length > 0) {
            // ... item insertion logic (omitted for brevity, can be added if schema supports)
        }

        // 5. [NEW] Ledger Entry for PAID parcels
        if (booking.paymentType === 'Paid') {
            // We can use a dynamic import or just import at top. Let's assume top-level import is added.
            // Importing directly inside here for cleaner diff if top-level is hard, but top level is better.
            // Relying on subsequent tool call or user to ensure top-level import of ledgerService.
            await ledgerService.addTransaction({
                parcel_id: parcel.id,
                amount: booking.costs?.total || 0,
                type: 'CREDIT',
                description: 'Initial Booking Payment',
                branch_id: fromId
            });
        }

        return { data: parcel, error: null };
    }
};
