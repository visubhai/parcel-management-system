"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useBranchStore } from "@/frontend/lib/store";
import { parcelService } from "@/frontend/services/parcelService";
import { Package, Truck, CheckCircle, MessageCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { ledgerService } from "@/frontend/services/ledgerService";
import { Card } from "@/frontend/components/ui/card";
import { ReceiveModal } from "./ReceiveModal";
import { useToast } from "@/frontend/components/ui/toast";
import { BranchSelect } from "@/frontend/components/common/BranchSelect";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
export function InboundTable() {
    const { currentUser } = useBranchStore();
    const { addToast } = useToast();
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [selectedParcel, setSelectedParcel] = useState(null);
    // Determine target branch:
    // 1. If Branch User: Always use their assigned branch
    // 2. If Super Admin: Use selected branch
    const isSuperAdmin = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN';
    const targetBranchId = isSuperAdmin ? selectedBranchId : currentUser === null || currentUser === void 0 ? void 0 : currentUser.branchId;
    const { data: serverData, mutate } = useSWR(targetBranchId ? ['incoming', targetBranchId] : null, async ([key, branchId]) => {
        return (await parcelService.getIncomingParcels(branchId)).data || [];
    });
    // Standardize incoming parcels for display
    const incomingParcels = useMemo(() => {
        if (!serverData)
            return [];
        return serverData;
    }, [serverData]);
    const handleActionClick = (parcel) => {
        if (parcel.status === "DELIVERED")
            return;
        setSelectedParcel(parcel);
    };
    const handleConfirmAction = async (deliveredRemark, collectedBy, collectedByMobile) => {
        if (!selectedParcel)
            return;
        try {
            // Requirement: "Confirmation" moves it to DELIVERED
            if (selectedParcel.status === "PENDING" || selectedParcel.status === "BOOKED" || selectedParcel.status === "INCOMING") {
                // ... same logic for payment ...
                if (selectedParcel.paymentStatus === "To Pay") {
                    const ledgerRes = await ledgerService.addTransaction({
                        referenceId: selectedParcel.id,
                        amount: selectedParcel.totalAmount,
                        type: 'CREDIT',
                        description: `Payment collected for LR ${selectedParcel.lrNumber}`,
                        branchId: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branchId) || ''
                    });
                    if (ledgerRes.error)
                        throw ledgerRes.error;
                }
                // 2. Mark DELIVERED with Remark (Backend requires non-empty remark)
                const finalRemark = (deliveredRemark === null || deliveredRemark === void 0 ? void 0 : deliveredRemark.trim()) || "Delivered at counter";
                const statusRes = await parcelService.updateParcelStatus(selectedParcel.id, 'DELIVERED', finalRemark, collectedBy, collectedByMobile);
                if (statusRes.error)
                    throw statusRes.error;
            }
            mutate();
            setSelectedParcel(null);
            addToast("Operation successful", "success");
        }
        catch (error) {
            addToast("Error: " + error.message, "error");
        }
    };
    if (!targetBranchId) {
        return _jsx("div", { className: "p-12 text-center text-slate-400", children: "Select a branch to view inbound parcels." });
    }
    return (_jsxs(Card, { className: "shadow-sm border-slate-200 overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 flex items-center justify-between", children: [_jsxs("h2", { className: "text-lg font-bold text-slate-800 flex items-center gap-2", children: [_jsx(Truck, { className: "w-5 h-5 text-primary" }), "Incoming Parcels", targetBranchId && _jsxs("span", { className: "text-slate-400 text-sm font-normal ml-2", children: ["ID: ", targetBranchId] })] }), isSuperAdmin && (_jsx(BranchSelect, { value: selectedBranchId || "", onSelect: setSelectedBranchId, placeholder: "Select Branch to View" }))] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-50 text-slate-500 border-b border-slate-100", children: [_jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[140px]", children: "LR Number" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[120px]", children: "Date & Time" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[120px]", children: "From" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[120px]", children: "To" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[150px]", children: "Sender" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[150px]", children: "Receiver" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px]", children: "Remarks" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[100px]", children: "Payment" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] w-[130px]", children: "Status" }), _jsx("th", { className: "px-4 py-4 font-bold uppercase tracking-wider text-[10px] text-right w-[120px]", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: incomingParcels.map((parcel, index) => (_jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors group", children: [_jsx("td", { className: "px-4 py-4 text-sm font-mono font-black text-slate-700", children: parcel.lrNumber }), _jsx("td", { className: "px-4 py-4 text-slate-600 font-bold text-xs", children: parcel.date ? _jsxs(_Fragment, { children: [_jsx("div", { children: new Date(parcel.date).toLocaleDateString() }), _jsx("div", { className: "text-[10px] text-slate-400 font-normal", children: new Date(parcel.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }) : "-" }), _jsx("td", { className: "px-4 py-4 text-slate-600 font-bold text-xs uppercase", children: parcel.fromBranch }), _jsx("td", { className: "px-4 py-4 text-slate-600 font-bold text-xs uppercase", children: parcel.toBranch }), _jsx("td", { className: "px-4 py-4 text-slate-600 font-medium", children: parcel.senderName }), _jsx("td", { className: "px-4 py-4 text-slate-600 font-medium", children: parcel.receiverName }), _jsx("td", { className: "px-4 py-4 text-slate-400 italic text-xs truncate max-w-[150px]", title: parcel.remarks || "", children: parcel.remarks || "-" }), _jsx("td", { className: "px-4 py-4", children: _jsx("span", { className: cn("inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter", parcel.paymentStatus === "Paid"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700 shadow-sm"), children: parcel.paymentStatus }) }), _jsx("td", { className: "px-4 py-4", children: _jsxs("div", { className: cn("flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider", parcel.status === "DELIVERED" ? "text-emerald-600" : (parcel.status === "PENDING" ? "text-blue-600" : "text-teal-600")), children: [parcel.status === "DELIVERED" ? (_jsx(CheckCircle, { className: "w-3.5 h-3.5" })) : (_jsx(Package, { className: "w-3.5 h-3.5" })), parcel.status.toLowerCase()] }) }), _jsx("td", { className: "px-4 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [(parcel.receiverMobile || parcel.senderMobile) && (_jsx("button", { onClick: () => openWhatsApp({
                                                        mobile: parcel.receiverMobile || parcel.senderMobile || "",
                                                        lrNumber: parcel.lrNumber,
                                                        status: parcel.status,
                                                        fromBranch: parcel.fromBranch,
                                                        toBranch: parcel.toBranch,
                                                        receiverName: parcel.receiverName || parcel.senderName,
                                                        amount: parcel.totalAmount,
                                                        paymentStatus: parcel.paymentStatus
                                                    }, addToast), className: "p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100", title: "Send WhatsApp Notification", children: _jsx(MessageCircle, { className: "w-4 h-4" }) })), parcel.status !== "DELIVERED" ? (_jsx("button", { onClick: () => handleActionClick(parcel), className: "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700", children: "Confirm Delivery" })) : (_jsx("span", { className: "text-[10px] font-black text-emerald-500 uppercase tracking-widest", children: "Success" }))] }) })] }, parcel.id || index))) })] }) }), incomingParcels.length === 0 && (_jsxs("div", { className: "p-12 text-center text-slate-400", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-3 opacity-20" }), _jsx("p", { children: "No parcels found" })] })), selectedParcel && (_jsx(ReceiveModal, { parcel: selectedParcel, isOpen: !!selectedParcel, onClose: () => setSelectedParcel(null), onConfirm: handleConfirmAction }))] }));
}
