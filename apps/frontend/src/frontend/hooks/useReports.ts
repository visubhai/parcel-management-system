import { useState, useMemo } from 'react';
import { Booking, Branch, PaymentStatus, ParcelStatus } from '@/shared/types';
import { useBranchStore } from '@/frontend/lib/store';
import useSWR from 'swr';
import { parcelService } from '@/frontend/services/parcelService';

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
    itemType: string | 'All';
    minAmount: string;
    maxAmount: string;
}

export function useReports() {
    const { currentUser } = useBranchStore();

    // -- State --
    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [filters, setFilters] = useState<FilterState>({
        startDate: getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), // First day of month
        endDate: getLocalDateString(new Date()),
        fromBranch: 'All',
        toBranch: 'All',
        paymentType: 'All',
        status: 'All',
        searchQuery: '',
        itemType: 'All',
        minAmount: '',
        maxAmount: ''
    });

    // -- Fetch Data --
    // Fetch based on date range to minimize load
    // We use a custom key to trigger re-fetch when dates change
    const { data: serverData, error, isLoading, mutate } = useSWR(
        ['reports', filters.startDate, filters.endDate],
        async ([key, start, end]) => {
            const { data } = await parcelService.getBookingsForReports(start, end);
            if (!data) return [];

            // Map DB Parcel to App Booking Type for UI consumption (Sharing logic from store legacy)
            const mappedBookings: Booking[] = data.map((p: any) => {

                return {
                    id: p._id,
                    lrNumber: p.lrNumber,
                    date: p.createdAt,
                    fromBranch: p.fromBranch?.name || "Unknown",
                    toBranch: p.toBranch?.name || "Unknown",
                    sender: {
                        name: p.sender?.name || "",
                        mobile: p.sender?.mobile || "",
                        email: p.sender?.email
                    },
                    receiver: {
                        name: p.receiver?.name || "",
                        mobile: p.receiver?.mobile || "",
                        email: p.receiver?.email
                    },
                    parcels: p.parcels || [],
                    costs: {
                        freight: p.costs?.freight || 0,
                        handling: p.costs?.handling || 0,
                        hamali: p.costs?.hamali || 0,
                        total: p.costs?.total || 0
                    },
                    paymentType: p.paymentType,
                    status: p.status
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

        // 1. RBAC Filtering: If not SUPER_ADMIN, user can only see data related to their branch
        if (currentUser && currentUser.role !== 'SUPER_ADMIN' && currentUser.branch) {
            data = data.filter(item =>
                item.fromBranch === currentUser.branch || item.toBranch === currentUser.branch
            );
        }

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

            // Advanced Filters
            if (filters.itemType !== 'All') {
                const hasItem = item.parcels.some((p: any) => p.itemType === filters.itemType);
                if (!hasItem) return false;
            }

            if (filters.minAmount && item.costs.total < Number(filters.minAmount)) return false;
            if (filters.maxAmount && item.costs.total > Number(filters.maxAmount)) return false;

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
    }, [bookings, filters, sortConfig, currentUser]);

    // -- Pagination Logic --
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, currentPage, rowsPerPage]);

    // -- Summary Stats --
    const stats = useMemo(() => {
        return {
            totalRevenue: processedData.reduce((sum, item) => item.status !== 'CANCELLED' ? sum + item.costs.total : sum, 0),
            totalBookings: processedData.length,
            paidAmount: processedData.filter(i => i.paymentType === 'Paid' && i.status !== 'CANCELLED').reduce((sum, i) => sum + i.costs.total, 0),
            toPayAmount: processedData.filter(i => i.paymentType === 'To Pay' && i.status !== 'CANCELLED').reduce((sum, i) => sum + i.costs.total, 0),
            cancelledCount: processedData.filter(i => i.status === 'CANCELLED').length
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
        handleSort,

        // Helpers
        mutate,
        isLoading
    };
}
