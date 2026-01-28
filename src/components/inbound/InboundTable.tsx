"use client";

import { useBranchStore } from "@/lib/store";
import { Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ReceiveModal } from "./ReceiveModal";
import { IncomingParcel } from "@/lib/types";

export function InboundTable() {
    const { incomingParcels, markParcelReceived, fetchIncomingParcels } = useBranchStore();
    const [selectedParcel, setSelectedParcel] = useState<IncomingParcel | null>(null);

    useEffect(() => {
        fetchIncomingParcels();
    }, [fetchIncomingParcels]);

    const handleReceiveClick = (parcel: IncomingParcel) => {
        if (parcel.status === "Arrived") return;
        setSelectedParcel(parcel);
    };

    const handleConfirmReceive = () => {
        if (selectedParcel) {
            markParcelReceived(selectedParcel.id);
            setSelectedParcel(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Incoming Parcels
                </h2>
            </div>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <th className="px-6 py-3 font-medium">LR Number</th>
                        <th className="px-6 py-3 font-medium">From</th>
                        <th className="px-6 py-3 font-medium">To</th>
                        <th className="px-6 py-3 font-medium">Sender</th>
                        <th className="px-6 py-3 font-medium">Receiver</th>
                        <th className="px-6 py-3 font-medium">Payment</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {incomingParcels.map((parcel) => (
                        <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-slate-700">{parcel.lrNumber}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{parcel.fromBranch}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.toBranch}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.senderName}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.receiverName}</td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                                    parcel.paymentStatus === "Paid"
                                        ? "bg-green-50 text-green-700 border border-green-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                )}>
                                    {parcel.paymentStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5",
                                    parcel.status === "Arrived" ? "text-green-600" : "text-amber-600"
                                )}>
                                    {parcel.status === "Arrived" ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Arrived
                                        </>
                                    ) : (
                                        <>
                                            <Truck className="w-4 h-4" /> In Transit
                                        </>
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleReceiveClick(parcel)}
                                    disabled={parcel.status === "Arrived"}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                        parcel.status === "Arrived"
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                                    )}
                                >
                                    {parcel.status === "Arrived" ? "Received" : "Receive"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {incomingParcels.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No parcels found</p>
                </div>
            )}

            {selectedParcel && (
                <ReceiveModal
                    parcel={selectedParcel}
                    isOpen={!!selectedParcel}
                    onClose={() => setSelectedParcel(null)}
                    onConfirm={handleConfirmReceive}
                />
            )}
        </div>
    );
}
