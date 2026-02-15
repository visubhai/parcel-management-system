"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { X, MapPin, Calendar, User, ArrowRight, CheckCircle2, Clock, AlertCircle, FileText, MessageCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { PrintBuilty } from "@/frontend/components/booking/PrintBuilty";
export function EditBookingModal({ booking, isOpen, onClose, onSave, availableBranches }) {
    const { currentUser } = useBranchStore();
    const [sender, setSender] = useState(booking.sender);
    const [receiver, setReceiver] = useState(booking.receiver);
    const [parcels, setParcels] = useState(booking.parcels);
    const [costs, setCosts] = useState(booking.costs);
    const [paymentType, setPaymentType] = useState(booking.paymentType);
    const [status, setStatus] = useState(booking.status);
    const [remarks, setRemarks] = useState(booking.remarks || "");
    const [deliveredRemark, setDeliveredRemark] = useState(booking.deliveredRemark || "");
    const [collectedBy, setCollectedBy] = useState(booking.collectedBy || "");
    const [collectedByMobile, setCollectedByMobile] = useState(booking.collectedByMobile || "");
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        }
        else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);
    const isSuperAdmin = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN';
    useEffect(() => {
        setSender(booking.sender);
        setReceiver(booking.receiver);
        setParcels(booking.parcels);
        setCosts(booking.costs);
        setPaymentType(booking.paymentType);
        setStatus(booking.status);
        setRemarks(booking.remarks || "");
        setDeliveredRemark(booking.deliveredRemark || "");
        setCollectedBy(booking.collectedBy || "");
        setCollectedByMobile(booking.collectedByMobile || "");
    }, [booking, isOpen]);
    // Auto-calculate logic
    useEffect(() => {
        const totalFreight = parcels.reduce((sum, p) => sum + (p.quantity * (p.rate || 0)), 0);
        setCosts(prev => (Object.assign(Object.assign({}, prev), { freight: totalFreight, total: totalFreight + prev.handling + prev.hamali })));
    }, [parcels]);
    const handleSave = () => {
        const updatedBooking = Object.assign(Object.assign({}, booking), { sender,
            receiver,
            parcels,
            costs,
            paymentType,
            status,
            remarks,
            deliveredRemark,
            collectedBy,
            collectedByMobile });
        onSave(updatedBooking);
    };
    const handlePrint = () => {
        window.print();
    };
    if (!isOpen)
        return null;
    // Simplified 3-State Status Configuration
    const statusSteps = [
        { ids: ['BOOKED'], label: 'Booked', icon: FileText },
        { ids: ['PENDING'], label: 'Pending', icon: Clock },
        { ids: ['DELIVERED'], label: 'Delivered', icon: CheckCircle2 },
    ];
    // Helper to normalize status for matching
    const normalizedCurrentStatus = status.toUpperCase();
    const currentStepIndex = statusSteps.findIndex(s => s.ids.includes(normalizedCurrentStatus));
    const isCancelled = normalizedCurrentStatus === 'CANCELLED';
    const getBranchName = (branchVal) => {
        if (!branchVal)
            return "";
        if (typeof branchVal !== 'string' && branchVal.name)
            return branchVal.name;
        const id = typeof branchVal === 'string' ? branchVal : (branchVal._id || branchVal.id);
        const found = availableBranches.find(b => {
            const bId = typeof b === 'string' ? b : (b._id || b.id);
            return bId === id;
        });
        if (found) {
            return typeof found === 'string' ? found : found.name;
        }
        return typeof branchVal === 'string' ? branchVal : "Unknown Branch";
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden", children: _jsxs("div", { className: "bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-[90rem] max-h-[92vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5", children: [_jsxs("div", { className: "bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm/50", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1", children: "LR Number" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("h2", { className: "text-3xl font-black text-slate-800 tracking-tighter", children: ["#", booking.lrNumber] }), isCancelled && (_jsxs("span", { className: "px-3 py-1 bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), "Cancelled"] }))] })] }), _jsx("div", { className: "h-10 w-px bg-slate-100 mx-2" }), _jsxs("div", { className: "flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100", children: [_jsx("div", { className: "p-2 bg-white rounded-xl shadow-sm border border-slate-100", children: _jsx(Calendar, { className: "w-4 h-4 text-slate-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: "Booking Date" }), _jsx("p", { className: "text-sm font-bold text-slate-700", children: new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) })] })] })] }), !isCancelled && (_jsx("div", { className: "hidden xl:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100", children: statusSteps.map((step, idx) => {
                                        const isCompleted = idx < currentStepIndex;
                                        const isCurrent = idx === currentStepIndex;
                                        return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: cn("flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-500", isCurrent ? "bg-white shadow-sm border border-slate-200 text-blue-600 scale-105" :
                                                        isCompleted ? "text-emerald-600" : "text-slate-400 opacity-60"), children: [_jsx("div", { className: cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", isCurrent ? "bg-blue-600 text-white" :
                                                                isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"), children: isCompleted ? "✓" : idx + 1 }), _jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider", children: step.label })] }), idx < statusSteps.length - 1 && (_jsx("div", { className: "w-6 h-0.5 mx-1 flex items-center", children: _jsx("div", { className: cn("w-full h-full rounded-full transition-all duration-700", isCompleted ? "bg-emerald-400" : "bg-slate-200") }) }))] }, step.label));
                                    }) })), _jsx("button", { onClick: onClose, className: "p-3 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-full transition-all duration-200", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50/50", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 max-w-[1600px] mx-auto", children: [_jsxs("div", { className: "xl:col-span-8 space-y-6", children: [_jsxs("div", { className: "bg-white rounded-[24px] p-1 shadow-sm border border-slate-200/60 overflow-hidden", children: [_jsxs("div", { className: "bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-xs font-black text-slate-500 uppercase tracking-widest", children: "Route Details" })] }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [_jsxs("span", { children: ["From: ", getBranchName(booking.fromBranch)] }), _jsx(ArrowRight, { className: "w-3 h-3" }), _jsxs("span", { children: ["To: ", getBranchName(booking.toBranch)] })] })] }), _jsxs("div", { className: "p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-start relative", children: [_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute -left-3 top-6 bottom-6 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 md:hidden" }), _jsx(BookingForm, { title: "Sender", type: "sender", values: sender, onChange: (field, val) => setSender(Object.assign(Object.assign({}, sender), { [field]: val })), branch: booking.fromBranch, disabled: false, availableBranches: availableBranches, onBranchChange: () => { }, branchLabel: "From", variant: "minimal" })] }), _jsxs("div", { className: "hidden md:flex flex-col items-center justify-center pt-12 text-slate-300 self-stretch", children: [_jsx("div", { className: "w-px flex-1 bg-gradient-to-b from-slate-100 via-slate-300 to-slate-100 dashed-line" }), _jsx("div", { className: "p-3 my-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 shadow-sm", children: _jsx(ArrowRight, { className: "w-5 h-5" }) }), _jsx("div", { className: "w-px flex-1 bg-gradient-to-t from-slate-100 via-slate-300 to-slate-100 dashed-line" })] }), _jsx("div", { className: "relative group", children: _jsx(BookingForm, { title: "Receiver", type: "receiver", values: receiver, onChange: (field, val) => setReceiver(Object.assign(Object.assign({}, receiver), { [field]: val })), branch: booking.toBranch, disabled: false, availableBranches: availableBranches, onBranchChange: () => { }, branchLabel: "To", variant: "minimal" }) })] })] }), _jsxs("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative", children: [_jsx("div", { className: "absolute top-0 left-0 w-1.5 h-full bg-indigo-500" }), _jsx("div", { className: "p-6", children: _jsx(ParcelList, { parcels: parcels, onAdd: () => setParcels([...parcels, { id: Math.random().toString(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]), onRemove: (id) => setParcels(parcels.filter(p => p.id !== id)), onChange: (id, field, val) => setParcels(parcels.map(p => p.id === id ? Object.assign(Object.assign({}, p), { [field]: val }) : p)), disabled: true }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx("div", { className: "p-1.5 bg-yellow-50 text-yellow-600 rounded-lg", children: _jsx(AlertCircle, { className: "w-4 h-4" }) }), _jsx("label", { className: "text-xs font-black uppercase text-slate-500 tracking-widest", children: "Booking Remarks" })] }), _jsx("textarea", { value: remarks, onChange: (e) => setRemarks(e.target.value), className: "w-full h-32 p-4 bg-slate-50/50 border-0 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-0 transition-all outline-none resize-none leading-relaxed", placeholder: "Add notes about the parcel condition or handling..." })] }), _jsxs("div", { className: "bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx("div", { className: "p-1.5 bg-blue-50 text-blue-600 rounded-lg", children: _jsx(MessageCircle, { className: "w-4 h-4" }) }), _jsx("label", { className: "text-xs font-black uppercase text-slate-500 tracking-widest", children: "Delivery Instructions" })] }), _jsx("textarea", { value: deliveredRemark, onChange: (e) => setDeliveredRemark(e.target.value), className: "w-full h-32 p-4 bg-slate-50/50 border-0 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-0 transition-all outline-none resize-none leading-relaxed", placeholder: "Instructions for the delivery agent or receiver..." })] })] }), status === 'DELIVERED' && (_jsxs("div", { className: "bg-emerald-50/50 p-8 rounded-[24px] border border-emerald-100 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-5", children: [_jsx("div", { className: "absolute top-0 left-0 w-1.5 h-full bg-emerald-500" }), _jsxs("div", { className: "flex items-start justify-between mb-8", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-black text-emerald-900 tracking-tight flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600" }), "Proof of Delivery"] }), _jsx("p", { className: "text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1 pl-7", children: "Handover Confirmation" })] }), booking.deliveredAt && (_jsxs("div", { className: "bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100/50", children: [_jsxs("div", { className: "flex items-center gap-2 text-emerald-600 mb-0.5", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { className: "text-[10px] uppercase font-bold tracking-wider", children: "Delivered Time" })] }), _jsx("div", { className: "text-sm font-black text-emerald-950", children: new Date(booking.deliveredAt).toLocaleString() })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1", children: "Collected By" }), _jsxs("div", { className: "relative group", children: [_jsx(User, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" }), _jsx("input", { type: "text", value: collectedBy, onChange: (e) => setCollectedBy(e.target.value), className: "w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-emerald-200/50 rounded-xl font-bold text-emerald-900 placeholder:text-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none", placeholder: "Receiver Name" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1", children: "Contact" }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors", children: "#" }), _jsx("input", { type: "tel", value: collectedByMobile, onChange: (e) => {
                                                                                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                                                    setCollectedByMobile(val);
                                                                                }, className: "w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-emerald-200/50 rounded-xl font-bold text-emerald-900 placeholder:text-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none", placeholder: "Mobile Number" })] })] })] })] }))] }), _jsx("div", { className: "xl:col-span-4 space-y-6", children: _jsx("div", { className: "sticky top-24 space-y-6", children: _jsx(PaymentBox, { costs: costs, paymentType: paymentType, onChange: (field, val) => {
                                                    if (field === 'paymentType')
                                                        setPaymentType(val);
                                                    else {
                                                        setCosts(prev => {
                                                            const updated = Object.assign(Object.assign({}, prev), { [field]: val });
                                                            return Object.assign(Object.assign({}, updated), { total: updated.freight + updated.handling + updated.hamali });
                                                        });
                                                    }
                                                }, onSave: handleSave, isLocked: true, saveLabel: "Update Booking Details", onPrint: handlePrint, currentStatus: status }) }) })] }) })] }) }), typeof document !== 'undefined' && createPortal(_jsx(PrintBuilty, { booking: Object.assign(Object.assign({}, booking), { sender,
                    receiver,
                    parcels,
                    costs,
                    paymentType,
                    remarks,
                    status }), branches: availableBranches }), document.body)] }));
}
