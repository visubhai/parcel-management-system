import { Booking } from "@/shared/types";
import { useBranchStore } from "@/frontend/lib/store";
import { SortField, SortOrder } from "@/frontend/hooks/useReports";
import { TableRowSkeleton } from "../ui/Skeleton";
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowLeft, ArrowRight, Ban, MessageCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { ConfirmationModal } from "@/frontend/components/common/ConfirmationModal";
import { EditBookingModal } from "./EditBookingModal";
import { useBranches } from "@/frontend/hooks/useBranches";
import { useToast } from "@/frontend/components/ui/toast";
import { useState, useEffect } from "react";

interface ReportTableProps {
    data: Booking[];
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;
    sortConfig: { field: SortField, order: SortOrder };
    onSort: (field: SortField) => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
    mutate: () => void;
    autoOpenLr?: string | null;
}

import { parcelService } from "@/frontend/services/parcelService";
import { adminService } from "@/super-admin/services/adminService";

import { useRouter } from "next/navigation";
import { openWhatsApp } from "@/frontend/lib/whatsapp";

export function ReportTable({
    data, isLoading, currentPage, totalPages, rowsPerPage, totalItems,
    sortConfig, onSort, onPageChange, onRowsPerPageChange, mutate, autoOpenLr
}: ReportTableProps) {
    // const { cancelBooking } = useBranchStore(); // Removed
    const router = useRouter();
    const { branchObjects } = useBranches();
    const { addToast } = useToast();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [hasAutoOpened, setHasAutoOpened] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
    const { currentUser } = useBranchStore();

    useEffect(() => {
        if (autoOpenLr && data.length > 0 && hasAutoOpened !== autoOpenLr && !isLoading) {
            const match = data.find(b => b.lrNumber === autoOpenLr);
            if (match) {
                setSelectedBooking(match);
                setEditModalOpen(true);
                setHasAutoOpened(autoOpenLr);
            }
        }
    }, [autoOpenLr, data, hasAutoOpened, isLoading]);

    const handleCancelClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBookingToCancel(id);
        setCancelModalOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setBookingToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleEditClick = (e: React.MouseEvent, booking: Booking) => {
        e.stopPropagation();
        setSelectedBooking(booking);
        setEditModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (bookingToCancel) {
            const { error } = await parcelService.updateParcelStatus(bookingToCancel, 'CANCELLED');

            if (error) {
                addToast(`Failed to cancel booking: ${error.message}`, "error");
                return;
            }

            mutate();
            setBookingToCancel(null);
            setCancelModalOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (bookingToDelete) {
            const { error } = await adminService.deleteBooking(bookingToDelete);

            if (error) {
                addToast(`Failed to delete booking: ${error.message}`, "error");
                return;
            }

            mutate();
            setBookingToDelete(null);
            setDeleteModalOpen(false);
            addToast("Booking permanently deleted", "success");
        }
    };

    const handleSaveEdit = async (updated: Booking) => {
        if (selectedBooking) {
            // Sanitize payload to avoid sending populated objects or immutable fields that cause backend errors
            const payload = {
                sender: updated.sender,
                receiver: updated.receiver,
                parcels: updated.parcels,
                costs: updated.costs,
                paymentType: updated.paymentType,
                remarks: updated.remarks,
                deliveredRemark: updated.deliveredRemark,
                collectedBy: updated.collectedBy,
                collectedByMobile: updated.collectedByMobile,
                status: updated.status
            };

            const { error } = await parcelService.updateBooking(selectedBooking.id, payload as any);
            if (error) {
                addToast(`Failed to update booking: ${error.message}`, "error");
                return;
            }
            mutate();
            setEditModalOpen(false);
            setSelectedBooking(null);
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
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                            <HeaderCell field="total" label="Amount" align="right" />
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Payment</th>
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            Array.from({ length: rowsPerPage }).map((_, idx) => (
                                <TableRowSkeleton key={idx} columns={12} />
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, index) => {
                                const dateObj = new Date(row.date);
                                const isCancelled = row.status === 'CANCELLED';

                                return (
                                    <tr key={row.id || (row as any)._id || index} className={cn(
                                        "transition-colors group",
                                        isCancelled ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-blue-50/30"
                                    )}>
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
                                            <button
                                                onClick={(e) => handleEditClick(e, row)}
                                                className="hover:text-blue-600 hover:underline transition-colors text-left"
                                                title="Click to edit booking"
                                            >
                                                {row.lrNumber}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="font-medium">{dateObj.toLocaleDateString('en-CA')}</div>
                                            <div className="text-xs text-slate-400">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.fromBranch}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{row.toBranch}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium truncate max-w-[150px]" title={row.sender.name}>{row.sender.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]" title={row.receiver.name}>{row.receiver.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 italic truncate max-w-[150px]" title={row.remarks || ""}>
                                            {row.remarks || "-"}
                                        </td>
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
                                                row.status === 'DELIVERED' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                row.status === 'PENDING' && "bg-blue-50 text-blue-700 border-blue-200",
                                                row.status === 'BOOKED' && "bg-teal-50 text-teal-700 border-teal-200",
                                                row.status === 'CANCELLED' && "bg-red-50 text-red-700 border-red-200"
                                            )}>
                                                {row.status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isCancelled && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openWhatsApp({
                                                            mobile: row.receiver.mobile || row.sender.mobile,
                                                            lrNumber: row.lrNumber,
                                                            status: row.status,
                                                            fromBranch: row.fromBranch,
                                                            toBranch: row.toBranch,
                                                            senderName: row.sender.name || "-",
                                                            receiverName: row.receiver.name || "-",
                                                            amount: row.costs.total,
                                                            paymentStatus: row.paymentType
                                                        }, addToast)}
                                                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100"
                                                        title="Send WhatsApp Notification"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleEditClick(e, row)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                                                        title="Edit Booking"
                                                    >
                                                        Edit
                                                    </button>
                                                    {row.status !== 'DELIVERED' && (
                                                        <button
                                                            onClick={(e) => handleCancelClick(e, row.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                            title="Cancel Booking"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {currentUser?.role === 'SUPER_ADMIN' && (
                                                        <button
                                                            onClick={(e) => handleDeleteClick(e, row.id)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                            title="Permanently Delete Booking"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
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
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="PERMANENTLY DELETE booking"
                message="Warning: This will completely remove this LR from the system. This cannot be undone."
                confirmText="Yes, Delete Permanently"
                cancelText="No, Keep it"
                isDanger={true}
            />
            {/* Edit Booking Modal */}
            {selectedBooking && (
                <EditBookingModal
                    booking={selectedBooking}
                    isOpen={editModalOpen}
                    availableBranches={branchObjects as any}
                    onClose={() => setEditModalOpen(false)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}
