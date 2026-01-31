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

import { BranchSelect } from "@/frontend/components/common/BranchSelect";

export function InboundTable() {
    const { currentUser } = useBranchStore();
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

    // Map DB to UI Type
    const incomingParcels: IncomingParcel[] = useMemo(() => {
        if (!serverData) return [];
        return serverData.map((p: any) => ({
            id: p.id,
            lrNumber: p.lr_number,
            fromBranch: p.from_branch?.name || "Unknown",
            toBranch: p.to_branch?.name || "Unknown",
            senderName: p.sender_name,
            receiverName: p.receiver_name,
            paymentStatus: p.payment_type === 'PAID' ? 'Paid' : 'To Pay',
            status: p.status, // Standardized to uppercase in backend
            items: [], // populate if needed
            totalAmount: p.costs?.total || 0,
            remarks: p.remarks
        }));
    }, [serverData]);


    const handleActionClick = (parcel: IncomingParcel) => {
        if (parcel.status === "DELIVERED") return;
        setSelectedParcel(parcel);
    };

    const handleConfirmAction = async (deliveredRemark?: string) => {
        if (selectedParcel) {
            // If already ARRIVED, we are Delivering
            if (selectedParcel.status === "ARRIVED") {
                // 1. Payment Collection (if needed)
                if (selectedParcel.paymentStatus === "To Pay") {
                    await ledgerService.addTransaction({
                        parcel_id: selectedParcel.id,
                        amount: selectedParcel.totalAmount,
                        type: 'CREDIT',
                        description: 'Payment collected at Delivery',
                        branch_id: currentUser?.branchId || '' // Use the new ID
                    });
                }
                // 2. Mark DELIVERED with Remark
                await parcelService.updateParcelStatus(selectedParcel.id, 'DELIVERED', deliveredRemark);
            } else {
                // We are Receiving (IN_TRANSIT -> ARRIVED)
                await parcelService.updateParcelStatus(selectedParcel.id, 'ARRIVED');
            }
            mutate();
            setSelectedParcel(null);
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

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <th className="px-6 py-3 font-medium">LR Number</th>
                        <th className="px-6 py-3 font-medium">From</th>
                        <th className="px-6 py-3 font-medium">To</th>
                        <th className="px-6 py-3 font-medium">Sender</th>
                        <th className="px-6 py-3 font-medium">Receiver</th>
                        <th className="px-6 py-3 font-medium">Remarks</th>
                        <th className="px-6 py-3 font-medium">Payment</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {incomingParcels.map((parcel) => (
                        <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">{parcel.lrNumber}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{parcel.fromBranch}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.toBranch}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.senderName}</td>
                            <td className="px-6 py-4 text-slate-600">{parcel.receiverName}</td>
                            <td className="px-6 py-4 text-slate-500 italic truncate max-w-[150px]" title={parcel.remarks || ""}>
                                {parcel.remarks || "-"}
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                                    parcel.paymentStatus === "Paid"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                )}>
                                    {parcel.paymentStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 font-semibold",
                                    parcel.status === "ARRIVED" ? "text-blue-600" : (
                                        parcel.status === "DELIVERED" ? "text-emerald-600" : "text-amber-600"
                                    )
                                )}>
                                    {parcel.status === "ARRIVED" ? (
                                        <>
                                            <Package className="w-4 h-4" /> ARRIVED
                                        </>
                                    ) : (
                                        parcel.status === "DELIVERED" ? "DELIVERED" : "IN TRANSIT"
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {parcel.status !== "DELIVERED" && (
                                    <Button
                                        onClick={() => handleActionClick(parcel)}
                                        size="sm"
                                        variant={parcel.status === "ARRIVED" ? "default" : "secondary"}
                                        className={cn(
                                            "min-w-[100px] font-bold shadow-sm",
                                            parcel.status === "ARRIVED" ? "bg-primary hover:bg-primary/90" : "bg-white border hover:bg-slate-50 text-slate-700"
                                        )}
                                    >
                                        {parcel.status === "ARRIVED" ? "Deliver" : "Receive"}
                                    </Button>
                                )}
                                {parcel.status === "DELIVERED" && (
                                    <span className="text-xs font-bold text-slate-400">Completed</span>
                                )}
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
                    onConfirm={handleConfirmAction}
                />
            )}
        </Card>
    );
}
