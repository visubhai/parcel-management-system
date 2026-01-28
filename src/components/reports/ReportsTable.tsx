"use client";

import { cn } from "@/lib/utils";
import { Download, FileSpreadsheet } from "lucide-react";

// MOCK_DATA Removed in favor of real store data

import { useState } from "react";
import { EditBookingModal } from "@/components/reports/EditBookingModal";
import { useBranchStore } from "@/lib/store";
import { Branch, Booking } from "@/lib/types";
import { Edit2, Ban } from "lucide-react";

interface ReportsTableProps {
    fromBranch?: Branch | "All";
    toBranch?: Branch | "All";
    startDate: string;
    endDate: string;
}

export function ReportsTable({ fromBranch = "All", toBranch = "All", startDate, endDate }: ReportsTableProps) {
    const { bookings, currentUser, branches, cancelBooking } = useBranchStore();
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // Combine Mock Data (mapped to fit Booking type roughly) and Real Bookings
    // For specific requirement, let's prioritize Real Bookings but keep Mock for demo if needed.
    // Actually, to show "real" editing, we rely on the store 'bookings'.
    // If we want MOCK_DATA to be editable, we'd need to load it into store on init.
    // For now, let's just display both, but only "Real" bookings from store might be editable if IDs don't match.
    // Ideally, we just use 'bookings' from store.

    // Let's just use store bookings + simple mapping for MOCK_DATA if we really want to keep it?
    // User asked to edit "previous booked parcel", implying newly created ones mainly.
    // Let's treat MOCK_DATA as read-only historical or just focus on 'bookings'.

    // Simplification: We will display `bookings` from store.

    const allData = [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Convert strings to Date objects for comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredData = allData.filter(item => {
        // Branch Filter
        if (fromBranch !== "All" && item.fromBranch !== fromBranch) return false;
        if (toBranch !== "All" && item.toBranch !== toBranch) return false;

        // Date Range Filter
        const itemDate = new Date(item.date);
        if (itemDate < start || itemDate > end) return false;

        return true;
    });

    const totalPaid = filteredData
        .filter(r => r.paymentType === 'Paid' && r.status !== 'Cancelled')
        .reduce((sum, r) => sum + r.costs.total, 0);

    const totalToPay = filteredData
        .filter(r => r.paymentType === 'To Pay' && r.status !== 'Cancelled')
        .reduce((sum, r) => sum + r.costs.total, 0);

    const handleEditClick = (booking: Booking) => {
        setEditingBooking(booking);
    };

    const handleSaveEdit = (updated: Booking) => {
        // Update feature temporarily disabled during refactor
        console.log("Update Disabled", updated);
        setEditingBooking(null);
    };

    const canEdit = (item: Booking) => {
        if (!currentUser) return false;
        if (currentUser.role === 'SUPER_ADMIN') return true;
        return currentUser.branch === item.fromBranch;
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Detailed Report
                    </h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export CSV
                    </button>
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-b border-slate-100">
                    <div className="bg-green-100/50 border border-green-200 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Total Paid</span>
                        <span className="text-xl font-black text-green-800">₹{totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="bg-red-100/50 border border-red-200 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Total To Pay</span>
                        <span className="text-xl font-black text-red-800">₹{totalToPay.toLocaleString()}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <th className="px-6 py-3 font-medium">LR Number</th>
                                <th className="px-6 py-3 font-medium">From</th>
                                <th className="px-6 py-3 font-medium">To</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Time</th>
                                <th className="px-6 py-3 font-medium">Sender</th>
                                <th className="px-6 py-3 font-medium">Receiver</th>
                                <th className="px-6 py-3 font-medium text-right">Qty</th>
                                <th className="px-6 py-3 font-medium text-right">Weight</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                <th className="px-6 py-3 font-medium">Pay Status</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((row) => {
                                    const dateObj = new Date(row.date);
                                    const dateStr = dateObj.toLocaleDateString('en-CA');
                                    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                    const totalQty = row.parcels.reduce((s, p) => s + p.quantity, 0);
                                    const totalWeight = row.parcels.reduce((s, p) => s + p.weight, 0);

                                    return (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-700">{row.lrNumber}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{row.fromBranch}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.toBranch}</td>
                                            <td className="px-6 py-4 text-slate-600">{dateStr}</td>
                                            <td className="px-6 py-4 text-slate-500">{timeStr}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.sender.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{row.receiver.name}</td>
                                            <td className="px-6 py-4 text-right text-slate-700">{totalQty}</td>
                                            <td className="px-6 py-4 text-right text-slate-700">{totalWeight}</td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-800">₹{row.costs.total}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                                                    row.paymentType === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {row.paymentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                                    row.status === "Delivered" && "bg-slate-100 text-slate-600",
                                                    row.status === "Arrived" && "bg-green-50 text-green-700",
                                                    row.status === "In Transit" && "bg-blue-50 text-blue-700",
                                                    row.status === "Cancelled" && "bg-red-50 text-red-700"
                                                )}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleEditClick(row)}
                                                    disabled={!canEdit(row)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                                                    title={canEdit(row) ? "Edit Booking" : "Only origin branch can edit"}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {row.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                                                                cancelBooking(row.id);
                                                            }
                                                        }}
                                                        disabled={!canEdit(row)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all ml-1 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                                                        title={canEdit(row) ? "Cancel Booking" : "Only origin branch can cancel"}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={13} className="px-6 py-8 text-center text-slate-500">
                                        No records found matching the selecting filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    isOpen={!!editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSave={handleSaveEdit}
                    availableBranches={branches}
                />
            )
            }
        </>
    );
}
