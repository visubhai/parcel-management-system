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

export function InboundTable() {
    const { currentUser } = useBranchStore();
    const [selectedParcel, setSelectedParcel] = useState<IncomingParcel | null>(null);

    // Fetch incoming parcels for current user's branch
    // If Super Admin, maybe fetch all? Logic says "Manage incoming...". 
    // Assuming currentUser.branch or allowedBranches[0] is the target. 
    // For now we use currentUser.branch (assuming they are working in a specific branch context).
    const targetBranchId = currentUser?.branch && currentUser.branch !== 'All' ? currentUser.branch : null;
    // Note: If branch is 'All' or null, we might need a selector or default to empty.
    // Given previous logic relied on "currentBranch" from store which is now "fromBranch" in some contexts but for Inbound it implies "My Branch".
    // We will wait for "targetBranchId" to be available.

    const { data: serverData, mutate } = useSWR(
        targetBranchId ? ['incoming', targetBranchId] : null,
        async ([key, branch]) => {
            // Need Branch UUID, but store might have name. 
            // Services usually handle UUIDs. 
            // If `currentUser.branch` is a Name, getIncomingParcels needs to handle Name or we resolve ID.
            // Current database schema uses UUIDs for relations.
            // But `parcelService.getIncomingParcels` query uses `eq('to_branch_id', branchId)`.
            // If `branch` is name, this fails.
            // Helper: We need to resolve Name to ID if needed, OR the backend view handles it.
            // Assumption: currentUser.branch in store IS the Name (based on types: Branch = string).
            // So we need to query by Name.
            // Let's update useSWR query to filter on joined table or change service to lookup ID.

            // To be safe and quick: Fetch by Name via join filter?
            // "getIncomingParcels" in service does: .eq('to_branch_id', branchId)
            // I should change service to allow Name lookup or update getIncomingParcels.
            // Better: update service to search by name in relation.

            return (await parcelService.getIncomingParcelsByName(branch)).data || [];
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
            status: p.status === 'ARRIVED' ? 'Arrived' : (p.status === 'IN_TRANSIT' ? 'In Transit' : p.status),
            items: [], // populate if needed
            totalAmount: p.total_amount
        }));
    }, [serverData]);


    const handleActionClick = (parcel: IncomingParcel) => {
        if (parcel.status === "Delivered") return;
        setSelectedParcel(parcel);
    };

    const handleConfirmAction = async () => {
        if (selectedParcel) {
            // If already Arrived, we are Delivering
            if (selectedParcel.status === "Arrived") {
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
                // 2. Mark Delivered
                await parcelService.updateParcelStatus(selectedParcel.id, 'DELIVERED');
            } else {
                // We are Receiving (In Transit -> Arrived)
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
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Incoming Parcels for {targetBranchId}
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
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                )}>
                                    {parcel.paymentStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 font-semibold",
                                    parcel.status === "Arrived" ? "text-blue-600" : (
                                        parcel.status === "Delivered" ? "text-emerald-600" : "text-amber-600"
                                    )
                                )}>
                                    {parcel.status === "Arrived" ? (
                                        <>
                                            <Package className="w-4 h-4" /> Arrived
                                        </>
                                    ) : (
                                        parcel.status === "Delivered" ? "Delivered" : "In Transit"
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {parcel.status !== "Delivered" && (
                                    <Button
                                        onClick={() => handleActionClick(parcel)}
                                        size="sm"
                                        variant={parcel.status === "Arrived" ? "default" : "secondary"}
                                        className={cn(
                                            "min-w-[100px] font-bold shadow-sm",
                                            parcel.status === "Arrived" ? "bg-primary hover:bg-primary/90" : "bg-white border hover:bg-slate-50 text-slate-700"
                                        )}
                                    >
                                        {parcel.status === "Arrived" ? "Deliver" : "Receive"}
                                    </Button>
                                )}
                                {parcel.status === "Delivered" && (
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
