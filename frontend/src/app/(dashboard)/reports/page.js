"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { useReports } from "@/frontend/hooks/useReports";
import { ReportFilters } from "@/frontend/components/reports/ReportFilters";
import { ReportTable } from "@/frontend/components/reports/ReportTable";
import { ReportCharts } from "@/frontend/components/reports/ReportCharts";
import { ExportButtons } from "@/frontend/components/reports/ExportButtons";
import { useSearchParams } from "next/navigation";
const ReportSummary = ({ stats }) => (_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "Revenue" }), _jsxs("p", { className: "text-xl font-black text-slate-800 mt-1", children: ["\u20B9", (stats.totalRevenue || 0).toLocaleString()] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "Paid" }), _jsxs("p", { className: "text-xl font-black text-green-600 mt-1", children: ["\u20B9", (stats.paidAmount || 0).toLocaleString()] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "To Pay" }), _jsxs("p", { className: "text-xl font-black text-red-600 mt-1", children: ["\u20B9", (stats.toPayAmount || 0).toLocaleString()] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "Bookings" }), _jsx("p", { className: "text-xl font-black text-blue-600 mt-1", children: stats.totalBookings || 0 })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "Parcels" }), _jsx("p", { className: "text-xl font-black text-purple-600 mt-1", children: stats.totalParcels || 0 })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase", children: "Cancelled" }), _jsx("p", { className: "text-xl font-black text-slate-400 mt-1", children: stats.cancelledCount || 0 })] })] }));
import { useBranches } from "@/frontend/hooks/useBranches";
import { PrintReportTable } from "@/frontend/components/reports/PrintReportTable";
export default function ReportsPage() {
    const { currentUser } = useBranchStore();
    const { branches: availableBranches } = useBranches('reports');
    const searchParams = useSearchParams();
    const lrFromUrl = searchParams.get('lrNumber');
    const autoEdit = searchParams.get('edit') === 'true';
    // Data loaded by useReports internal SWR
    const { data, allFilteredData, stats, filters, setFilters, currentPage, totalPages, rowsPerPage, totalItems, setCurrentPage, setRowsPerPage, sortConfig, handleSort, mutate, isLoading } = useReports();
    // Sync search from URL
    useEffect(() => {
        if (lrFromUrl && filters.searchQuery !== lrFromUrl) {
            setFilters(prev => (Object.assign(Object.assign({}, prev), { searchQuery: lrFromUrl })));
        }
    }, [lrFromUrl, setFilters, filters.searchQuery]);
    // Permission check
    const isHirabagh = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch) === 'hirabagh';
    const isBapunagar = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch) === 'bapunagar';
    // Auto-select branch for restricted users if "All" is selected but they are restricted to a subset
    useEffect(() => {
        if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'SUPER_ADMIN' && !isHirabagh && !isBapunagar && availableBranches.length > 0) {
            const currentFrom = filters.fromBranch;
            if (currentFrom === "All" || !availableBranches.includes(currentFrom)) {
                setFilters(prev => (Object.assign(Object.assign({}, prev), { fromBranch: availableBranches[0] })));
            }
        }
    }, [currentUser, isHirabagh, isBapunagar, availableBranches, filters.fromBranch, setFilters]);
    // UI flags
    const isBranchRestricted = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'SUPER_ADMIN' && !isHirabagh && !isBapunagar;
    const userBranch = isBranchRestricted && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch) ? currentUser.branch : undefined;
    const formatDate = (d) => {
        if (!d)
            return new Date().toLocaleDateString('en-GB');
        return new Date(d).toLocaleDateString('en-GB');
    };
    const dateRangeStr = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    return (_jsxs("div", { className: "max-w-[1600px] mx-auto p-6 space-y-6 pb-20", children: [_jsxs("div", { className: "hidden print:block daily-report-print", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-2xl font-black text-black uppercase", children: "Savan Transport" }), _jsx("p", { className: "text-xs font-bold text-gray-500 uppercase", children: "Daily Manifest Report" })] }), _jsx(PrintReportTable, { data: allFilteredData, dateRange: dateRangeStr })] }), _jsx("div", { className: "mb-8 print:hidden", children: _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-slate-800 tracking-tight", children: "Enterprise Reports" }), _jsx("p", { className: "text-slate-500 font-medium", children: "Advanced analytics and data management" })] }), _jsx(ExportButtons, { data: allFilteredData, filters: filters })] }) }), _jsxs("div", { className: "print:hidden space-y-6", children: [_jsx(ReportFilters, { filters: filters, setFilters: setFilters, branches: availableBranches, isBranchRestricted: isBranchRestricted, userBranch: currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch }), _jsx(ReportCharts, { data: allFilteredData })] }), _jsx("div", { className: "print:hidden", children: _jsx(ReportSummary, { stats: stats }) }), _jsxs("div", { className: "space-y-2 print:hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-1", children: [_jsx("h3", { className: "text-lg font-bold text-slate-700", children: "Detailed Transaction Log" }), _jsxs("span", { className: "text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md", children: [totalItems, " Records"] })] }), _jsx(ReportTable, { data: data, isLoading: isLoading, currentPage: currentPage, totalPages: totalPages, rowsPerPage: rowsPerPage, totalItems: totalItems, sortConfig: sortConfig, onSort: handleSort, onPageChange: setCurrentPage, onRowsPerPageChange: setRowsPerPage, mutate: mutate, autoOpenLr: autoEdit ? lrFromUrl : null })] })] }));
}
