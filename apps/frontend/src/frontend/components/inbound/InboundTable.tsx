"use client";

import { useBranchStore } from "@/frontend/lib/store";
import { parcelService } from "@/frontend/services/parcelService";
import { Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { ledgerService } from "@/frontend/services/ledgerService";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { ReceiveModal } from "./ReceiveModal";
import { IncomingParcel } from "@/shared/types";
import { useToast } from "@/frontend/components/ui/toast";

import { BranchSelect } from "@/frontend/components/common/BranchSelect";

export function InboundTable() {
    const { currentUser } = useBranchStore();
    const { addToast } = useToast();
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [selectedParcel, setSelectedParcel] = useState<IncomingParcel | null>(null);

    // Determine target branch:
    // 1. If Branch User: Always use their assigned branch
    // 2. If Super Admin: Use selected branch
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const targetBranchId = isSuperAdmin ? selectedBranchId : currentUser?.branchId;

    const { data: serverData, mutate } = useSWR(
        targetBranchId ? ['incoming', targetBranchId] : null,
        async ([key, branchId]) => {
            return (await parcelService.getIncomingParcels(branchId)).data || [];
        }
    );

    // Standardize incoming parcels for display
    const incomingParcels: IncomingParcel[] = useMemo(() => {
        if (!serverData) return [];
        return serverData;
    }, [serverData]);


    const handleActionClick = (parcel: IncomingParcel) => {
        if (parcel.status === "DELIVERED") return;
        setSelectedParcel(parcel);
    };

    const handleConfirmAction = async (deliveredRemark?: string) => {
        if (!selectedParcel) return;

        try {
            // If PENDING or INCOMING, we are Delivering
            if (selectedParcel.status === "PENDING" || selectedParcel.status === "INCOMING") {
                // 1. Payment Collection (if needed)
                if (selectedParcel.paymentStatus === "To Pay") {
                    const ledgerRes = await ledgerService.addTransaction({
                        referenceId: selectedParcel.id,
                        amount: selectedParcel.totalAmount,
                        type: 'CREDIT',
                        description: `Payment collected for LR ${selectedParcel.lrNumber}`,
                        branchId: currentUser?.branchId || ''
                    });
                    if (ledgerRes.error) throw ledgerRes.error;
                }

                // 2. Mark DELIVERED with Remark (Backend requires non-empty remark)
                const finalRemark = deliveredRemark?.trim() || "Delivered at counter";
                const statusRes = await parcelService.updateParcelStatus(selectedParcel.id, 'DELIVERED', finalRemark);
                if (statusRes.error) throw statusRes.error;
            }

            mutate();
            setSelectedParcel(null);
            addToast("Operation successful", "success");
        } catch (error: any) {
            addToast("Error: " + error.message, "error");
        }
    };

    if (!targetBranchId) {
        return <div className="p-12 text-center text-slate-400">Select a branch to view inbound parcels.</div>;
    }

    return (
        <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Incoming Parcels
                    {targetBranchId && <span className="text-slate-400 text-sm font-normal ml-2">ID: {targetBranchId}</span>}
                </h2>
                {isSuperAdmin && (
                    <BranchSelect
                        value={selectedBranchId || ""}
                        onSelect={setSelectedBranchId}
                        placeholder="Select Branch to View"
                    />
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[140px]">LR Number</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[120px]">From</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[120px]">To</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[150px]">Sender</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[150px]">Receiver</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px]">Remarks</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[100px]">Payment</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[130px]">Status</th>
                            <th className="px-4 py-4 font-bold uppercase tracking-wider text-[10px] text-right w-[120px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {incomingParcels.map((parcel) => (
                            <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-4 py-4 text-sm font-mono font-black text-slate-700">{parcel.lrNumber}</td>
                                <td className="px-4 py-4 text-slate-600 font-bold text-xs uppercase">{parcel.fromBranch}</td>
                                <td className="px-4 py-4 text-slate-600 font-bold text-xs uppercase">{parcel.toBranch}</td>
                                <td className="px-4 py-4 text-slate-600 font-medium">{parcel.senderName}</td>
                                <td className="px-4 py-4 text-slate-600 font-medium">{parcel.receiverName}</td>
                                <td className="px-4 py-4 text-slate-400 italic text-xs truncate max-w-[150px]" title={parcel.remarks || ""}>
                                    {parcel.remarks || "-"}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={cn(
                                        "inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                                        parcel.paymentStatus === "Paid"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700 shadow-sm"
                                    )}>
                                        {parcel.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className={cn(
                                        "flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider",
                                        parcel.status === "PENDING" ? "text-blue-600" : (
                                            parcel.status === "DELIVERED" ? "text-emerald-600" : "text-orange-500"
                                        )
                                    )}>
                                        {parcel.status === "PENDING" ? (
                                            <Package className="w-3.5 h-3.5" />
                                        ) : parcel.status === "DELIVERED" ? (
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        ) : (
                                            <Truck className="w-3.5 h-3.5" />
                                        )}
                                        {parcel.status}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    {parcel.status !== "DELIVERED" ? (
                                        <button
                                            onClick={() => handleActionClick(parcel)}
                                            className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                                        >
                                            Deliver
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            Success
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                    onConfirm={handleConfirmAction}
                />
            )}
        </Card>
    );
}
