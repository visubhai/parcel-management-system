import { useState, useMemo } from 'react';
import { useBranchStore } from '@/frontend/lib/store';
import useSWR from 'swr';
import { parcelService } from '@/frontend/services/parcelService';
export function useReports() {
    const { currentUser } = useBranchStore();
    // -- State --
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [filters, setFilters] = useState({
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
    const { data: serverData, error, isLoading, mutate } = useSWR(['reports', filters.startDate, filters.endDate], async ([key, start, end]) => {
        const { data } = await parcelService.getBookingsForReports(start, end);
        if (!data)
            return [];
        // Map DB Parcel to App Booking Type for UI consumption (Sharing logic from store legacy)
        const mappedBookings = data.map((p) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return {
                id: p._id,
                lrNumber: p.lrNumber,
                date: p.createdAt,
                fromBranch: ((_a = p.fromBranch) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                toBranch: ((_b = p.toBranch) === null || _b === void 0 ? void 0 : _b.name) || "Unknown",
                sender: {
                    name: ((_c = p.sender) === null || _c === void 0 ? void 0 : _c.name) || "",
                    mobile: ((_d = p.sender) === null || _d === void 0 ? void 0 : _d.mobile) || "",
                    email: (_e = p.sender) === null || _e === void 0 ? void 0 : _e.email
                },
                receiver: {
                    name: ((_f = p.receiver) === null || _f === void 0 ? void 0 : _f.name) || "",
                    mobile: ((_g = p.receiver) === null || _g === void 0 ? void 0 : _g.mobile) || "",
                    email: (_h = p.receiver) === null || _h === void 0 ? void 0 : _h.email
                },
                parcels: p.parcels || [],
                costs: {
                    freight: Number(((_j = p.costs) === null || _j === void 0 ? void 0 : _j.freight) || 0),
                    handling: Number(((_k = p.costs) === null || _k === void 0 ? void 0 : _k.handling) || 0),
                    hamali: Number(((_l = p.costs) === null || _l === void 0 ? void 0 : _l.hamali) || 0),
                    total: Number(((_m = p.costs) === null || _m === void 0 ? void 0 : _m.total) || 0)
                },
                paymentType: p.paymentType,
                status: p.status,
                deliveredRemark: p.deliveredRemark,
                collectedBy: p.collectedBy,
                collectedByMobile: p.collectedByMobile,
                deliveredAt: p.deliveredAt
            };
        });
        return mappedBookings;
    });
    const bookings = serverData || [];
    const [sortConfig, setSortConfig] = useState({
        field: 'date',
        order: 'desc'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const normalizeStatus = (status) => status.toUpperCase().replace(/_/g, ' ');
    // -- Derived Data --
    const processedData = useMemo(() => {
        let data = [...bookings];
        // 1. RBAC Filtering: Re-introduce branch restriction but allow exceptions
        if (currentUser && currentUser.role === 'BRANCH' && currentUser.branch) {
            const bName = currentUser.branch.toLowerCase();
            const allowedForBapunagar = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];
            if (bName === 'hirabagh') {
                // No filters for Hirabagh
            }
            else if (bName === 'bapunagar') {
                data = data.filter(item => allowedForBapunagar.includes(item.fromBranch.toLowerCase()) ||
                    allowedForBapunagar.includes(item.toBranch.toLowerCase()));
            }
            else {
                data = data.filter(item => item.fromBranch === currentUser.branch || item.toBranch === currentUser.branch);
            }
        }
        // 1. Filtering (Client side refinement on fetched chunk)
        // Date is already filtered by API, but strictly:
        // const start... (redundant if API is correct, but safe to keep logic or just skip date check)
        data = data.filter(item => {
            // Branch
            if (filters.fromBranch !== 'All') {
                const branches = filters.fromBranch.split(',');
                if (!branches.includes(item.fromBranch))
                    return false;
            }
            if (filters.toBranch !== 'All') {
                const branches = filters.toBranch.split(',');
                if (!branches.includes(item.toBranch))
                    return false;
            }
            // Payment Type - Optional if we want to keep logic but we removed UI
            // Status - Optional if we want to keep logic but we removed UI
            // Search Query Filter (on the fetched range)
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matches = item.lrNumber.toLowerCase().includes(query) ||
                    item.sender.name.toLowerCase().includes(query) ||
                    item.receiver.name.toLowerCase().includes(query) ||
                    item.sender.mobile.includes(query) ||
                    item.receiver.mobile.includes(query);
                if (!matches)
                    return false;
            }
            return true;
        });
        // 2. Sorting
        data.sort((a, b) => {
            const field = sortConfig.field;
            let valA, valB;
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
                    valA = (a[field] || '').toString().toLowerCase();
                    valB = (b[field] || '').toString().toLowerCase();
            }
            if (valA < valB)
                return sortConfig.order === 'asc' ? -1 : 1;
            if (valA > valB)
                return sortConfig.order === 'asc' ? 1 : -1;
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
                if (normalizeStatus(item.status) === 'CANCELLED')
                    return sum;
                const bookingParcels = item.parcels.reduce((pSum, p) => pSum + (p.quantity || 0), 0);
                return sum + bookingParcels;
            }, 0)
        };
    }, [processedData]);
    // -- Handlers --
    const handleSort = (field) => {
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
