import { Booking } from "@/lib/types";
import { SortField, SortOrder } from "@/hooks/useReports";
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowLeft, ArrowRight, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useState } from "react";

interface ReportTableProps {
    data: Booking[];
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    sortConfig: { field: SortField, order: SortOrder };
    onSort: (field: SortField) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
}

import { parcelService } from "@/services/parcelService";

import { useRouter } from "next/navigation";

export function ReportTable({
    data, currentPage, totalPages, rowsPerPage, totalItems,
    sortConfig, onSort, onPageChange, onRowsPerPageChange
}: ReportTableProps) {
    // const { cancelBooking } = useBranchStore(); // Removed
    const router = useRouter();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

    const handleCancelClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBookingToCancel(id);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (bookingToCancel) {
            const { error } = await parcelService.updateParcelStatus(bookingToCancel, 'Cancelled');

            if (error) {
                alert(`Failed to cancel booking: ${error.message}`);
                // Don't close modal so user can retry or see error
                return;
            }

            // Success
            // Use Next.js soft refresh to keep client state intact
            router.refresh();
            setBookingToCancel(null);
            setCancelModalOpen(false);
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortConfig.field !== field) return <ChevronsUpDown className="w-3 h-3 text-slate-300 opacity-50" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-3 h-3 text-blue-600" />
            : <ChevronDown className="w-3 h-3 text-blue-600" />;
    };

    const HeaderCell = ({ field, label, align = 'left' }: { field: SortField, label: string, align?: 'left' | 'right' | 'center' }) => (
        <th
            className={cn(
                "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none",
                align === 'right' && "text-right",
                align === 'center' && "text-center"
            )}
            onClick={() => onSort(field)}
        >
            <div className={cn("flex items-center gap-2", align === 'right' && "justify-end", align === 'center' && "justify-center")}>
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <HeaderCell field="lrNumber" label="LR No" />
                            <HeaderCell field="date" label="Date & Time" />
                            <HeaderCell field="fromBranch" label="Origin" />
                            <HeaderCell field="toBranch" label="Destination" />
                            <HeaderCell field="sender" label="Sender" />
                            <HeaderCell field="receiver" label="Receiver" />
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                            <HeaderCell field="total" label="Amount" align="right" />
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Payment</th>
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row) => {
                                const dateObj = new Date(row.date);
                                const isCancelled = row.status === 'Cancelled';

                                return (
                                    <tr key={row.id} className={cn(
                                        "transition-colors group",
                                        isCancelled ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-blue-50/30"
                                    )}>
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">{row.lrNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="font-medium">{dateObj.toLocaleDateString('en-CA')}</div>
                                            <div className="text-xs text-slate-400">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.fromBranch}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{row.toBranch}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium truncate max-w-[150px]" title={row.sender.name}>{row.sender.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]" title={row.receiver.name}>{row.receiver.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700 text-right font-mono">
                                            {row.parcels.reduce((s, p) => s + p.quantity, 0)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                                            ₹{row.costs.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                row.paymentType === 'Paid'
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : "bg-red-100 text-red-700 border-red-200"
                                            )}>
                                                {row.paymentType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm",
                                                row.status === 'Delivered' && "bg-slate-100 text-slate-600 border-slate-200",
                                                row.status === 'Arrived' && "bg-teal-50 text-teal-700 border-teal-200",
                                                row.status === 'In Transit' && "bg-blue-50 text-blue-700 border-blue-200",
                                                row.status === 'Cancelled' && "bg-red-50 text-red-700 border-red-200"
                                            )}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isCancelled && row.status !== 'Delivered' && (
                                                <button
                                                    onClick={(e) => handleCancelClick(e, row.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                    title="Cancel Booking"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-1 bg-slate-100 rounded-full" />
                                        <p className="font-medium">No records found matching your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="py-4 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-md text-xs font-bold py-1 px-2 outline-none focus:border-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-400">
                        Page <span className="text-slate-700 font-bold">{currentPage}</span> of <span className="text-slate-700 font-bold">{totalPages}</span>
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                        >
                            <ArrowRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Cancel Confirmation Modal */}
            <ConfirmationModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Booking"
                message="Are you sure for final cancelling parcel?"
                confirmText="Yes, Cancel"
                cancelText="No, Keep It"
                isDanger={true}
            />
        </div>
    );
}
