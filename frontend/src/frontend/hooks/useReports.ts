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
        startDate: getLocalDateString(new Date()), // Default to Today
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
                        freight: Number(p.costs?.freight || 0),
                        handling: Number(p.costs?.handling || 0),
                        hamali: Number(p.costs?.hamali || 0),
                        total: Number(p.costs?.total || 0)
                    },
                    paymentType: p.paymentType,
                    status: p.status,
                    deliveredRemark: p.deliveredRemark,
                    cancellationRemark: p.cancellationRemark,
                    collectedBy: p.collectedBy,
                    collectedByMobile: p.collectedByMobile,
                    deliveredAt: p.deliveredAt
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

    const normalizeStatus = (status: string) => status.toUpperCase().replace(/_/g, ' ');

    // -- Derived Data --
    const processedData = useMemo(() => {
        let data = [...bookings];

        // 1. RBAC Filtering: Re-introduce branch restriction but allow exceptions
        if (currentUser && currentUser.role === 'BRANCH' && currentUser.branch) {
            const bName = currentUser.branch.toLowerCase();
            const allowedForBapunagar = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];

            if (bName === 'hirabagh') {
                // No filters for Hirabagh
            } else if (bName === 'bapunagar') {
                data = data.filter(item =>
                    allowedForBapunagar.includes(item.fromBranch.toLowerCase()) ||
                    allowedForBapunagar.includes(item.toBranch.toLowerCase())
                );
            } else {
                data = data.filter(item =>
                    item.fromBranch === currentUser.branch || item.toBranch === currentUser.branch
                );
            }
        }

        // 1. Filtering (Client side refinement on fetched chunk)
        // Date is already filtered by API, but strictly:
        // const start... (redundant if API is correct, but safe to keep logic or just skip date check)

        data = data.filter(item => {
            // Branch
            if (filters.fromBranch !== 'All') {
                const branches = filters.fromBranch.split(',');
                if (!branches.includes(item.fromBranch)) return false;
            }
            if (filters.toBranch !== 'All') {
                const branches = filters.toBranch.split(',');
                if (!branches.includes(item.toBranch)) return false;
            }

            // Payment Type - Optional if we want to keep logic but we removed UI
            // Status - Optional if we want to keep logic but we removed UI

            // Search Query Filter (on the fetched range)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matches =
                    item.lrNumber.toLowerCase().includes(query) ||
                    item.sender.name.toLowerCase().includes(query) ||
                    item.receiver.name.toLowerCase().includes(query) ||
                    item.sender.mobile.includes(query) ||
                    item.receiver.mobile.includes(query);

                if (!matches) return false;
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
            totalRevenue: processedData.reduce((sum, item) => normalizeStatus(item.status) !== 'CANCELLED' ? sum + item.costs.total : sum, 0),
            totalBookings: processedData.length,
            paidAmount: processedData.filter(i => i.paymentType === 'Paid' && normalizeStatus(i.status) !== 'CANCELLED').reduce((sum, i) => sum + i.costs.total, 0),
            toPayAmount: processedData.filter(i => i.paymentType === 'To Pay' && normalizeStatus(i.status) !== 'CANCELLED').reduce((sum, i) => sum + i.costs.total, 0),
            cancelledCount: processedData.filter(i => normalizeStatus(i.status) === 'CANCELLED').length,
            totalParcels: processedData.reduce((sum, item) => {
                if (normalizeStatus(item.status) === 'CANCELLED') return sum;
                const bookingParcels = item.parcels.reduce((pSum, p) => pSum + (p.quantity || 0), 0);
                return sum + bookingParcels;
            }, 0)
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
