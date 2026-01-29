import { useState, useMemo } from 'react';
import { Booking, Branch, PaymentStatus, ParcelStatus } from '@/lib/types';
import { useBranchStore } from '@/lib/store';
import useSWR from 'swr';
import { parcelService } from '@/services/parcelService';

export type SortField = 'date' | 'lrNumber' | 'fromBranch' | 'toBranch' | 'total' | 'sender' | 'receiver';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
    startDate: string;
    endDate: string;
    fromBranch: Branch | 'All';
    toBranch: Branch | 'All';
    paymentType: PaymentStatus | 'All';
    status: ParcelStatus | 'All';
    searchQuery: string;
}

export function useReports() {
    // const { bookings } = useBranchStore(); // Removed

    // -- State --
    const [filters, setFilters] = useState<FilterState>({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of month
        endDate: new Date().toISOString().split('T')[0],
        fromBranch: 'All',
        toBranch: 'All',
        paymentType: 'All',
        status: 'All',
        searchQuery: ''
    });

    // -- Fetch Data --
    // Fetch based on date range to minimize load
    // We use a custom key to trigger re-fetch when dates change
    const { data: serverData, error, isLoading } = useSWR(
        ['reports', filters.startDate, filters.endDate],
        async ([key, start, end]) => {
            const { data } = await parcelService.getBookingsForReports(start, end);
            if (!data) return [];

            // Map DB Parcel to App Booking Type for UI consumption (Sharing logic from store legacy)
            const mappedBookings: Booking[] = data.map((p: any) => {
                // Helper to map Payment
                const mapPayment = (pt: string): any => {
                    if (pt === 'PAID') return 'Paid';
                    return 'To Pay';
                };

                // Helper to map Status - DB has BOOKED, UI needs casing? 
                // DB: BOOKED, IN_TRANSIT, ARRIVED, DELIVERED, CANCELLED
                // UI Type: Booked, In Transit, Arrived, Delivered, Cancelled
                const mapStatus = (st: string): any => {
                    if (st === 'IN_TRANSIT') return 'In Transit';
                    if (st === 'ARRIVED') return 'Arrived';
                    if (st === 'DELIVERED') return 'Delivered';
                    if (st === 'CANCELLED') return 'Cancelled';
                    if (st === 'BOOKED') return 'Booked';
                    return 'Booked';
                };

                return {
                    id: p.id,
                    lrNumber: p.lr_number,
                    date: p.created_at, // Mapping created_at to date
                    fromBranch: p.from_branch?.name || "Unknown",
                    toBranch: p.to_branch?.name || "Unknown",
                    sender: { name: p.sender_name, mobile: p.sender_mobile, email: p.sender_email },
                    receiver: { name: p.receiver_name, mobile: p.receiver_mobile, email: p.receiver_email },
                    parcels: [], // Items need fetch? For report summary, usually not needed. 
                    costs: {
                        freight: p.freight_charge,
                        handling: p.handling_charge,
                        hamali: p.hamali_charge,
                        total: p.total_amount
                    },
                    paymentType: mapPayment(p.payment_type),
                    status: mapStatus(p.status)
                };
            });
            return mappedBookings;
        }
    );

    const bookings = serverData || [];

    const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({
        field: 'date',
        order: 'desc'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // -- Derived Data --
    const processedData = useMemo(() => {
        let data = [...bookings];

        // 1. Filtering (Client side refinement on fetched chunk)
        // Date is already filtered by API, but strictly:
        // const start... (redundant if API is correct, but safe to keep logic or just skip date check)

        data = data.filter(item => {
            // Branch
            if (filters.fromBranch !== 'All' && item.fromBranch !== filters.fromBranch) return false;
            if (filters.toBranch !== 'All' && item.toBranch !== filters.toBranch) return false;

            // Payment Type
            if (filters.paymentType !== 'All' && item.paymentType !== filters.paymentType) return false;

            // Status
            if (filters.status !== 'All' && item.status !== filters.status) return false;

            // Search (Case insensitive text search)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const match =
                    item.lrNumber.toLowerCase().includes(query) ||
                    item.sender.name.toLowerCase().includes(query) ||
                    item.receiver.name.toLowerCase().includes(query);
                if (!match) return false;
            }

            return true;
        });

        // 2. Sorting
        data.sort((a, b) => {
            const field = sortConfig.field;
            let valA: any, valB: any;

            switch (field) {
                case 'date':
                    valA = new Date(a.date).getTime();
                    valB = new Date(b.date).getTime();
                    break;
                case 'total':
                    valA = a.costs.total;
                    valB = b.costs.total;
                    break;
                case 'sender':
                    valA = a.sender.name.toLowerCase();
                    valB = b.sender.name.toLowerCase();
                    break;
                case 'receiver':
                    valA = a.receiver.name.toLowerCase();
                    valB = b.receiver.name.toLowerCase();
                    break;
                default:
                    valA = (a[field as keyof Booking] || '').toString().toLowerCase();
                    valB = (b[field as keyof Booking] || '').toString().toLowerCase();
            }

            if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [bookings, filters, sortConfig]);

    // -- Pagination Logic --
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, currentPage, rowsPerPage]);

    // -- Summary Stats --
    const stats = useMemo(() => {
        return {
            totalRevenue: processedData.reduce((sum, item) => item.status !== 'Cancelled' ? sum + item.costs.total : sum, 0),
            totalBookings: processedData.length,
            paidAmount: processedData.filter(i => i.paymentType === 'Paid' && i.status !== 'Cancelled').reduce((sum, i) => sum + i.costs.total, 0),
            toPayAmount: processedData.filter(i => i.paymentType === 'To Pay' && i.status !== 'Cancelled').reduce((sum, i) => sum + i.costs.total, 0),
            cancelledCount: processedData.filter(i => i.status === 'Cancelled').length
        };
    }, [processedData]);

    // -- Handlers --
    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    return {
        // Data
        data: paginatedData,
        allFilteredData: processedData, // For export/charts
        stats,

        // Pagination
        currentPage,
        totalPages,
        rowsPerPage,
        totalItems: processedData.length,
        setCurrentPage,
        setRowsPerPage,

        // Filters
        filters,
        setFilters,

        // Sorting
        sortConfig,
        handleSort
    };
}
