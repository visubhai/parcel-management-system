import { create } from 'zustand';
import { Booking, Branch, IncomingParcel, User } from './types';
import { supabase } from './supabase';

interface BranchState {
    currentBranch: Branch;
    branches: Branch[];
    bookings: Booking[];
    incomingParcels: IncomingParcel[];
    searchQuery: string;

    currentUser: User | null;
    users: User[]; // Managed via Supabase now, perhaps explicit fetch needed for Super Admin

    isLoading: boolean;
    error: string | null;

    // Actions
    setBranch: (branch: Branch) => void;

    // Async Data Fetching
    fetchBranches: () => Promise<void>;
    fetchBookings: () => Promise<void>;
    fetchIncomingParcels: () => Promise<void>;
    fetchUsers: () => Promise<void>;

    // Auth
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;

    // Mutations
    addBooking: (booking: Partial<Booking>) => Promise<void>;
    cancelBooking: (id: string) => Promise<void>;
    markParcelReceived: (id: string) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;

    // UI
    setSearchQuery: (query: string) => void;
}

export const useBranchStore = create<BranchState>((set, get) => ({
    currentBranch: "",
    branches: [],
    bookings: [],
    incomingParcels: [],
    searchQuery: "",
    currentUser: null,
    users: [],
    isLoading: false,
    error: null,

    setBranch: (branch) => set({ currentBranch: branch }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    markParcelReceived: async (id) => {
        const { error } = await supabase.from('parcels').update({ status: 'ARRIVED' }).eq('id', id);
        if (error) {
            console.error("Failed to receive", error);
            return;
        }
        // Refresh Inbound List
        get().fetchIncomingParcels();
    },

    fetchBranches: async () => {
        const { data, error } = await supabase.from('branches').select('name');
        if (data) {
            set({ branches: data.map(b => b.name) });
            // Set default branch if none selected
            if (!get().currentBranch && data.length > 0) {
                set({ currentBranch: data[0].name });
            }
        }
    },

    fetchBookings: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('parcels')
            .select('*')
            .order('booking_date', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            set({ error: error.message, isLoading: false });
            return;
        }

        // Map DB Parcel to Booking Type
        const mappedBookings: Booking[] = data.map((p: any) => ({
            id: p.id,
            lrNumber: p.lr_number,
            date: p.booking_date,
            fromBranch: p.from_branch_id, // TODO: needing join for names? Or handle UUIDs?
            toBranch: p.to_branch_id,
            sender: { name: p.sender_name, mobile: p.sender_mobile, email: p.sender_email },
            receiver: { name: p.receiver_name, mobile: p.receiver_mobile, email: p.receiver_email },
            // Items need to be fetched separately or via join? 
            // For now assuming items are fetched or we change the query.
            parcels: [], // Placeholder until Join
            costs: {
                freight: p.freight_charge,
                handling: p.handling_charge,
                hamali: p.hamali_charge,
                total: p.total_amount
            },
            paymentType: p.payment_type,
            status: p.status
        }));

        set({ bookings: mappedBookings, isLoading: false });
    },

    fetchIncomingParcels: async () => {
        const { data, error } = await supabase.from('view_incoming_parcels').select('*');
        if (error) {
            console.error("Error fetching incoming:", error);
            return;
        }
        if (data) {
            const mapped: IncomingParcel[] = data.map((p: any) => ({
                id: p.id,
                lrNumber: p.lr_number,
                senderName: p.sender_name,
                receiverName: p.receiver_name,
                fromBranch: p.from_branch,
                toBranch: p.to_branch,
                status: p.status,
                paymentStatus: p.payment_status,
                totalAmount: p.total_amount
            }));
            set({ incomingParcels: mapped });
        }
    },

    fetchUsers: async () => {
        // Only for admins
        const { data, error } = await supabase.from('app_users').select('*, branches(name)');
        if (data) {
            const mappedUsers: User[] = data.map((u: any) => ({
                id: u.id,
                name: u.full_name,
                username: u.username || u.email, // Fallback
                role: u.role,
                branch: u.branches?.name,
                allowedBranches: u.allowed_branches || [],
                allowedReports: [], // Need separate fetch or join on admin_report_access
                isActive: u.is_active,
                password: '' // Security: don't load hashes
            }));
            set({ users: mappedUsers });
        }
    },

    login: async (emailOrUsername, password) => {
        // Auto-append domain if username is provided
        const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@abcd.com`;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            console.error("Login failed:", error);
            return false;
        }

        // Fetch User Profile
        const { data: profile } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profile) {
            set({
                currentUser: {
                    id: profile.id,
                    name: profile.full_name,
                    username: profile.username || email,
                    role: profile.role,
                    // Map branch_id to name? Or keep ID?
                    // allowedBranches: profile.allowed_branches
                    isActive: profile.is_active,
                    allowedBranches: [], // Needs mapping
                    allowedReports: [] // Needs Permissions Table Fetch
                }
            });
            return true;
        }
        return false;
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, bookings: [], incomingParcels: [] });
    },

    checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Re-fetch profile logic (similar to login)
            // simplified for now
        }
    },

    addBooking: async (booking) => {
        set({ isLoading: true });
        const state = get();

        // 1. Get Branch ID (Assuming currentBranch is Name, we need ID... 
        // We probably need to store Branch Objects or fetch ID. 
        // For now, let's fetch branch ID by name if needed, or rely on currentUser branch_id if better.
        // Actually, schema expects UUID. Frontend has Name strings in `currentBranch`.
        // This is a disconnect. I need to map Name -> ID.
        // I'll assume we can query it or store locally.

        let fromBranchId: string | undefined;
        let toBranchId: string | undefined;

        // Fetch Branch IDs
        const { data: branches } = await supabase.from('branches').select('id, name');
        if (branches) {
            fromBranchId = branches.find(b => b.name === booking.fromBranch)?.id || branches.find(b => b.name === state.currentBranch)?.id;
            toBranchId = branches.find(b => b.name === booking.toBranch)?.id;
        }

        if (!fromBranchId || !toBranchId) {
            console.error("Branch ID lookup failed");
            set({ isLoading: false, error: "Invalid Branch Selection" });
            return;
        }

        // 2. Generate LR (RPC)
        const { data: lrNumber, error: lrError } = await supabase.rpc('generate_lr_number', { p_branch_id: fromBranchId });

        if (lrError || !lrNumber) {
            console.error("LR Generation Failed", lrError);
            set({ isLoading: false, error: "Failed to generate LR Number" });
            return;
        }

        // 3. Insert Parcel
        const { data: parcel, error: parcelError } = await supabase.from('parcels').insert({
            lr_number: lrNumber,
            from_branch_id: fromBranchId,
            to_branch_id: toBranchId,
            current_branch_id: fromBranchId,
            sender_name: booking.sender?.name,
            sender_mobile: booking.sender?.mobile,
            sender_email: booking.sender?.email,
            receiver_name: booking.receiver?.name,
            receiver_mobile: booking.receiver?.mobile,
            receiver_email: booking.receiver?.email,
            payment_type: booking.paymentType || 'TO_PAY',
            status: 'BOOKED',
            weight_total: booking.parcels?.reduce((sum: number, p: any) => sum + (Number(p.weight) || 0), 0) || 0,
            freight_charge: booking.costs?.freight || 0,
            handling_charge: booking.costs?.handling || 0,
            hamali_charge: booking.costs?.hamali || 0,
            total_amount: booking.costs?.total || 0,
            amount_paid: booking.paymentType === 'Paid' ? (booking.costs?.total || 0) : 0,
            booked_by: state.currentUser?.id
        }).select().single();

        if (parcelError || !parcel) {
            console.error("Parcel Insert Failed", parcelError);
            set({ isLoading: false, error: parcelError?.message || "Parcel insertion failed" });
            return;
        }

        // 4. Insert Items
        if (booking.parcels && booking.parcels.length > 0) {
            const items = booking.parcels.map((p: any) => ({
                parcel_id: parcel.id,
                item_type: 'CARTON', // Default or map from p.itemType
                quantity: p.quantity,
                weight: p.weight,
                rate: p.rate,
                description: p.itemType
            }));

            await supabase.from('parcel_items').insert(items);
        }

        // 5. Success
        set({ isLoading: false });
        get().fetchBookings(); // Refresh
    },

    cancelBooking: async (id) => {
        await supabase.from('parcels').update({ status: 'CANCELLED' }).eq('id', id);
        get().fetchBookings(); // Refresh
    },

    deleteUser: async (id) => {
        // Soft delete or real delete. 
        // For now, hard delete if constraints allow, or soft delete `is_active=false`.
        // Let's toggle is_active to false.
        const { error } = await supabase.from('app_users').update({ is_active: false }).eq('id', id);

        if (!error) {
            set(state => ({ users: state.users.map(u => u.id === id ? { ...u, isActive: false } : u) }));
        } else {
            console.error("Delete user failed:", error);
        }
    },

    // Stubs for other actions to prevent compile errors during migration
    addBranch: () => { },
    removeBranch: () => { },
    addUser: () => { },
    updateUser: () => { },
    resetPassword: () => { },
    updateBooking: () => { }
}));
