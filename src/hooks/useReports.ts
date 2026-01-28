import { useState, useMemo } from 'react';
import { Booking, Branch, PaymentStatus, ParcelStatus } from '@/lib/types';
import { useBranchStore } from '@/lib/store';

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
    const { bookings } = useBranchStore();

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

    const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({
        field: 'date',
        order: 'desc'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // -- Derived Data --
    const processedData = useMemo(() => {
        let data = [...bookings];

        // 1. Filtering
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);

        data = data.filter(item => {
            const itemDate = new Date(item.date);

            // Date Range
            if (itemDate < start || itemDate > end) return false;

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
