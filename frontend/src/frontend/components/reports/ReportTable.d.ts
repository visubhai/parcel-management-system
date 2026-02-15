import { Booking } from "@/shared/types";
import { SortField, SortOrder } from "@/frontend/hooks/useReports";
interface ReportTableProps {
    data: Booking[];
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    sortConfig: {
        field: SortField;
        order: SortOrder;
    };
    onSort: (field: SortField) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
    mutate: () => void;
    autoOpenLr?: string | null;
}
export declare function ReportTable({ data, isLoading, currentPage, totalPages, rowsPerPage, totalItems, sortConfig, onSort, onPageChange, onRowsPerPageChange, mutate, autoOpenLr }: ReportTableProps): import("react/jsx-runtime").JSX.Element;
export {};
