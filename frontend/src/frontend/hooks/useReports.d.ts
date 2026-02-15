import { Booking, Branch, PaymentStatus, ParcelStatus } from '@/shared/types';
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
export declare function useReports(): {
    data: Booking[];
    allFilteredData: Booking[];
    stats: {
        totalRevenue: number;
        totalBookings: number;
        paidAmount: number;
        toPayAmount: number;
        cancelledCount: number;
        totalParcels: number;
    };
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    setCurrentPage: import("react").Dispatch<import("react").SetStateAction<number>>;
    setRowsPerPage: import("react").Dispatch<import("react").SetStateAction<number>>;
    filters: FilterState;
    setFilters: import("react").Dispatch<import("react").SetStateAction<FilterState>>;
    sortConfig: {
        field: SortField;
        order: SortOrder;
    };
    handleSort: (field: SortField) => void;
    mutate: import("swr").KeyedMutator<Booking[]>;
    isLoading: boolean;
};
