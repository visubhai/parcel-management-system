"use client";

import { useEffect } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { useReports } from "@/frontend/hooks/useReports";
import { ReportFilters } from "@/frontend/components/reports/ReportFilters";
import { ReportTable } from "@/frontend/components/reports/ReportTable";
import { ReportCharts } from "@/frontend/components/reports/ReportCharts";
import { ExportButtons } from "@/frontend/components/reports/ExportButtons";
import { Branch } from "@/shared/types";
import { useSearchParams } from "next/navigation";

const ReportSummary = ({ stats }: { stats: any }) => (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Revenue</p>
            <p className="text-xl font-black text-slate-800 mt-1">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Paid</p>
            <p className="text-xl font-black text-green-600 mt-1">₹{(stats.paidAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">To Pay</p>
            <p className="text-xl font-black text-red-600 mt-1">₹{(stats.toPayAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Bookings</p>
            <p className="text-xl font-black text-blue-600 mt-1">{stats.totalBookings || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Parcels</p>
            <p className="text-xl font-black text-purple-600 mt-1">{stats.totalParcels || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Cancelled</p>
            <p className="text-xl font-black text-slate-400 mt-1">{stats.cancelledCount || 0}</p>
        </div>
    </div>
);

import { useBranches } from "@/frontend/hooks/useBranches";

import { PrintReportTable } from "@/frontend/components/reports/PrintReportTable";

export default function ReportsPage() {
    const { currentUser } = useBranchStore();
    const { branches: availableBranches } = useBranches('reports');
    const searchParams = useSearchParams();
    const lrFromUrl = searchParams.get('lrNumber');
    const autoEdit = searchParams.get('edit') === 'true';

    // Data loaded by useReports internal SWR
    const {
        data,
        allFilteredData,
        stats,
        filters,
        setFilters,
        currentPage, totalPages, rowsPerPage, totalItems, setCurrentPage, setRowsPerPage,
        sortConfig, handleSort, mutate, isLoading
    } = useReports();

    // Sync search from URL
    useEffect(() => {
        if (lrFromUrl && filters.searchQuery !== lrFromUrl) {
            setFilters(prev => ({ ...prev, searchQuery: lrFromUrl }));
        }
    }, [lrFromUrl, setFilters, filters.searchQuery]);

    // Permission check
    const isHirabagh = currentUser?.branch === 'hirabagh';
    const isBapunagar = currentUser?.branch === 'bapunagar';



    // UI flags
    const isBranchRestricted = currentUser?.role !== 'SUPER_ADMIN' && !isHirabagh && !isBapunagar;
    const userBranch = isBranchRestricted && currentUser?.branch ? currentUser.branch : undefined;

    const formatDate = (d: string | Date | undefined) => {
        if (!d) return new Date().toLocaleDateString('en-GB');
        return new Date(d).toLocaleDateString('en-GB');
    };

    const dateRangeStr = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-6 pb-20">
            {/* Print View - Specific Layout */}
            <div className="hidden print:block daily-report-print">
                {/* Reusing existing print header or Custom one? The PrintReportTable usually renders below header. */}
                {/* Existing header at line 89 matches somewhat, but let's just use PrintReportTable mostly. */}
                {/* I will keep line 89 header but maybe adjust? No, line 89 has "Savan Transport". */}
                <div className="mb-4">
                    <h1 className="text-2xl font-black text-black uppercase">Savan Transport</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase">Daily Manifest Report</p>
                </div>
                <PrintReportTable data={allFilteredData} dateRange={dateRangeStr} />
            </div>

            {/* Header - Screen Only */}
            <div className="mb-8 print:hidden">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Enterprise Reports</h1>
                        <p className="text-slate-500 font-medium">Advanced analytics and data management</p>
                    </div>
                    <ExportButtons data={allFilteredData} filters={filters} />
                </div>
            </div>

            <div className="print:hidden space-y-6">
                <ReportFilters
                    filters={filters}
                    setFilters={setFilters}
                    branches={availableBranches as any}
                    isBranchRestricted={isBranchRestricted}
                    userBranch={currentUser?.branch}
                />
                <ReportCharts data={allFilteredData} />
            </div>

            {/* Summary Stats - Screen Only */}
            <div className="print:hidden">
                <ReportSummary stats={stats} />
            </div>

            {/* Data Table - Screen Only */}
            <div className="space-y-2 print:hidden">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold text-slate-700">Detailed Transaction Log</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {totalItems} Records
                    </span>
                </div>
                <ReportTable
                    data={data}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalItems={totalItems}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setRowsPerPage}
                    mutate={mutate}
                    autoOpenLr={autoEdit ? lrFromUrl : null}
                />
            </div>

        </div>
    );
}
