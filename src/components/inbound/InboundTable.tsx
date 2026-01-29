"use client";

import { useBranchStore } from "@/lib/store";
import { parcelService } from "@/services/parcelService";
import { Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { ReceiveModal } from "./ReceiveModal";
import { IncomingParcel } from "@/lib/types";

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


    const handleReceiveClick = (parcel: IncomingParcel) => {
        if (parcel.status === "Arrived") return;
        setSelectedParcel(parcel);
    };

    const handleConfirmReceive = async () => {
        if (selectedParcel) {
            await parcelService.updateParcelStatus(selectedParcel.id, 'ARRIVED');
            mutate(); // Refresh list
            setSelectedParcel(null);
        }
    };

    if (!targetBranchId) {
        return <div className="p-12 text-center text-slate-400">Select a branch to view inbound parcels.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
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
