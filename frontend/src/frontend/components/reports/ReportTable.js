import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBranchStore } from "@/frontend/lib/store";
import { TableRowSkeleton } from "../ui/Skeleton";
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowLeft, ArrowRight, Ban, MessageCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { ConfirmationModal } from "@/frontend/components/common/ConfirmationModal";
import { EditBookingModal } from "./EditBookingModal";
import { useBranches } from "@/frontend/hooks/useBranches";
import { useToast } from "@/frontend/components/ui/toast";
import { useState, useEffect } from "react";
import { parcelService } from "@/frontend/services/parcelService";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { useRouter } from "next/navigation";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
export function ReportTable({ data, isLoading, currentPage, totalPages, rowsPerPage, totalItems, sortConfig, onSort, onPageChange, onRowsPerPageChange, mutate, autoOpenLr }) {
    // const { cancelBooking } = useBranchStore(); // Removed
    const router = useRouter();
    const { branches } = useBranches();
    const { addToast } = useToast();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [hasAutoOpened, setHasAutoOpened] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
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
    const handleCancelClick = (e, id) => {
        e.stopPropagation();
        setBookingToCancel(id);
        setCancelModalOpen(true);
    };
    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setBookingToDelete(id);
        setDeleteModalOpen(true);
    };
    const handleEditClick = (e, booking) => {
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
    const handleSaveEdit = async (updated) => {
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
            const { error } = await parcelService.updateBooking(selectedBooking.id, payload);
            if (error) {
                addToast(`Failed to update booking: ${error.message}`, "error");
                return;
            }
            mutate();
            setEditModalOpen(false);
            setSelectedBooking(null);
        }
    };
    const SortIcon = ({ field }) => {
        if (sortConfig.field !== field)
            return _jsx(ChevronsUpDown, { className: "w-3 h-3 text-slate-300 opacity-50" });
        return sortConfig.order === 'asc'
            ? _jsx(ChevronUp, { className: "w-3 h-3 text-blue-600" })
            : _jsx(ChevronDown, { className: "w-3 h-3 text-blue-600" });
    };
    const HeaderCell = ({ field, label, align = 'left' }) => (_jsx("th", { className: cn("px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none", align === 'right' && "text-right", align === 'center' && "text-center"), onClick: () => onSort(field), children: _jsxs("div", { className: cn("flex items-center gap-2", align === 'right' && "justify-end", align === 'center' && "justify-center"), children: [label, _jsx(SortIcon, { field: field })] }) }));
    return (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200", children: [_jsx(HeaderCell, { field: "lrNumber", label: "LR No" }), _jsx(HeaderCell, { field: "date", label: "Date & Time" }), _jsx(HeaderCell, { field: "fromBranch", label: "Origin" }), _jsx(HeaderCell, { field: "toBranch", label: "Destination" }), _jsx(HeaderCell, { field: "sender", label: "Sender" }), _jsx(HeaderCell, { field: "receiver", label: "Receiver" }), _jsx("th", { className: "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Remarks" }), _jsx("th", { className: "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right", children: "Qty" }), _jsx(HeaderCell, { field: "total", label: "Amount", align: "right" }), _jsx("th", { className: "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center", children: "Payment" }), _jsx("th", { className: "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-center", children: "Status" }), _jsx("th", { className: "px-6 py-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: isLoading ? (Array.from({ length: rowsPerPage }).map((_, idx) => (_jsx(TableRowSkeleton, { columns: 12 }, idx)))) : data.length > 0 ? (data.map((row, index) => {
                                const dateObj = new Date(row.date);
                                const isCancelled = row.status === 'CANCELLED';
                                return (_jsxs("tr", { className: cn("transition-colors group", isCancelled ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-blue-50/30"), children: [_jsx("td", { className: "px-6 py-4 text-sm font-mono font-bold text-slate-700", children: _jsx("button", { onClick: (e) => handleEditClick(e, row), className: "hover:text-blue-600 hover:underline transition-colors text-left", title: "Click to edit booking", children: row.lrNumber }) }), _jsxs("td", { className: "px-6 py-4 text-sm text-slate-600", children: [_jsx("div", { className: "font-medium", children: dateObj.toLocaleDateString('en-CA') }), _jsx("div", { className: "text-xs text-slate-400", children: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), _jsx("td", { className: "px-6 py-4 text-sm font-medium text-slate-600", children: row.fromBranch }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-500", children: row.toBranch }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600 font-medium truncate max-w-[150px]", title: row.sender.name, children: row.sender.name }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]", title: row.receiver.name, children: row.receiver.name }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-500 italic truncate max-w-[150px]", title: row.remarks || "", children: row.remarks || "-" }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-700 text-right font-mono", children: row.parcels.reduce((s, p) => s + p.quantity, 0) }), _jsxs("td", { className: "px-6 py-4 text-sm font-bold text-slate-800 text-right", children: ["\u20B9", row.costs.total.toLocaleString()] }), _jsx("td", { className: "px-6 py-4 text-center", children: _jsx("span", { className: cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border", row.paymentType === 'Paid'
                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                    : "bg-red-100 text-red-700 border-red-200"), children: row.paymentType }) }), _jsx("td", { className: "px-6 py-4 text-center", children: _jsx("span", { className: cn("px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm", row.status === 'DELIVERED' && "bg-emerald-50 text-emerald-700 border-emerald-200", row.status === 'PENDING' && "bg-blue-50 text-blue-700 border-blue-200", row.status === 'BOOKED' && "bg-teal-50 text-teal-700 border-teal-200", row.status === 'CANCELLED' && "bg-red-50 text-red-700 border-red-200"), children: row.status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) }) }), _jsx("td", { className: "px-6 py-4 text-right", children: !isCancelled && (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => openWhatsApp({
                                                            mobile: row.receiver.mobile || row.sender.mobile,
                                                            lrNumber: row.lrNumber,
                                                            status: row.status,
                                                            fromBranch: row.fromBranch,
                                                            toBranch: row.toBranch,
                                                            receiverName: row.receiver.name || row.sender.name,
                                                            amount: row.costs.total,
                                                            paymentStatus: row.paymentType
                                                        }, addToast), className: "p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100", title: "Send WhatsApp Notification", children: _jsx(MessageCircle, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: (e) => handleEditClick(e, row), className: "px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all", title: "Edit Booking", children: "Edit" }), row.status !== 'DELIVERED' && (_jsxs("button", { onClick: (e) => handleCancelClick(e, row.id), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all", title: "Cancel Booking", children: [_jsx(Ban, { className: "w-3.5 h-3.5" }), "Cancel"] })), (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN' && (_jsx("button", { onClick: (e) => handleDeleteClick(e, row.id), className: "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all", title: "Permanently Delete Booking", children: "Delete" }))] })) })] }, row.id || row._id || index));
                            })) : (_jsx("tr", { children: _jsx("td", { colSpan: 11, className: "px-6 py-12 text-center text-slate-400", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-12 h-1 bg-slate-100 rounded-full" }), _jsx("p", { className: "font-medium", children: "No records found matching your filters" })] }) }) })) })] }) }), _jsxs("div", { className: "py-4 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500", children: "Rows per page:" }), _jsxs("select", { value: rowsPerPage, onChange: (e) => onRowsPerPageChange(Number(e.target.value)), className: "bg-white border border-slate-200 rounded-md text-xs font-bold py-1 px-2 outline-none focus:border-blue-500", children: [_jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 50, children: "50" }), _jsx("option", { value: 100, children: "100" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-xs font-medium text-slate-400", children: ["Page ", _jsx("span", { className: "text-slate-700 font-bold", children: currentPage }), " of ", _jsx("span", { className: "text-slate-700 font-bold", children: totalPages })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage === 1, className: "p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all", children: _jsx(ArrowLeft, { className: "w-4 h-4 text-slate-600" }) }), _jsx("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages || totalPages === 0, className: "p-1.5 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all", children: _jsx(ArrowRight, { className: "w-4 h-4 text-slate-600" }) })] })] })] }), _jsx(ConfirmationModal, { isOpen: cancelModalOpen, onClose: () => setCancelModalOpen(false), onConfirm: handleConfirmCancel, title: "Cancel Booking", message: "Are you sure for final cancelling parcel?", confirmText: "Yes, Cancel", cancelText: "No, Keep It", isDanger: true }), _jsx(ConfirmationModal, { isOpen: deleteModalOpen, onClose: () => setDeleteModalOpen(false), onConfirm: handleConfirmDelete, title: "PERMANENTLY DELETE booking", message: "Warning: This will completely remove this LR from the system. This cannot be undone.", confirmText: "Yes, Delete Permanently", cancelText: "No, Keep it", isDanger: true }), selectedBooking && (_jsx(EditBookingModal, { booking: selectedBooking, isOpen: editModalOpen, availableBranches: branches, onClose: () => setEditModalOpen(false), onSave: handleSaveEdit }))] }));
}
