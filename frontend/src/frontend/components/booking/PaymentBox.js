"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Save, Printer, Lock, MessageCircle, PlusCircle, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function PaymentBox({ costs, paymentType, onChange, onSave, isLocked, onWhatsApp, onReset, saveLabel, onPrint, currentStatus }) {
    const freightRef = useRef(null);
    const saveButtonRef = useRef(null);
    // Auto-calculate total
    useEffect(() => {
        const total = (costs.freight || 0) + (costs.handling || 0) + (costs.hamali || 0);
        if (total !== costs.total) {
            onChange("total", total);
        }
    }, [costs.freight, costs.handling, costs.hamali, costs.total, onChange]);
    const handleKeyDown = (e) => {
        var _a;
        if (isLocked)
            return;
        if (e.key === "Enter") {
            if (e.currentTarget === freightRef.current) {
                e.preventDefault();
                (_a = saveButtonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            // Optional: Toggle payment type on arrows if focused on the section
            const newType = paymentType === "Paid" ? "To Pay" : "Paid";
            onChange("paymentType", newType);
        }
    };
    // Helper to format status for display
    const formatStatus = (s) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    return (_jsxs("div", { className: cn("p-6 rounded-[32px] border-2 shadow-xl shadow-slate-200/50 sticky top-6 backdrop-blur-md transition-all", isLocked ? "border-emerald-100 bg-emerald-50/50" : "bg-white border-slate-100 shadow-slate-100/50"), children: [_jsxs("div", { className: "flex items-center justify-between mb-6 pb-4 border-b border-slate-100", children: [_jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2", children: "Payment Gateway" }), isLocked && (_jsxs("span", { className: cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide", (currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.toUpperCase()) === 'CANCELLED' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"), children: [(currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.toUpperCase()) === 'CANCELLED' ? _jsx(X, { className: "w-3 h-3" }) : _jsx(Lock, { className: "w-3.5 h-3.5" }), formatStatus(currentStatus || "Booked")] }))] }), _jsxs("div", { className: "space-y-5", children: [[
                        { label: "Freight Charge", field: "freight", ref: freightRef },
                        { label: "Builty Charge", field: "handling" },
                        { label: "Hamali", field: "hamali" }
                    ].map((item) => (_jsxs("div", { children: [_jsx("label", { className: "flex items-center justify-between text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wide ml-1", children: item.label }), _jsxs("div", { className: "relative group/input", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold", children: "\u20B9" }), _jsx("input", { type: "number", id: "freight-input", ref: item.ref, value: costs[item.field], disabled: isLocked || item.field === "handling" || item.field === "hamali", onFocus: (e) => e.target.select(), onKeyDown: handleKeyDown, onChange: (e) => onChange(item.field, parseFloat(e.target.value) || 0), className: cn("w-full pl-8 pr-4 py-3 rounded-xl border border-transparent text-right font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50 disabled:text-slate-400 transition-all bg-slate-50/50 focus:bg-white text-lg", (isLocked || item.field === "handling" || item.field === "hamali") && "opacity-60") })] })] }, item.field))), _jsxs("div", { className: "pt-6 border-t border-slate-100", children: [_jsxs("div", { className: "flex items-end justify-between mb-6", children: [_jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1", children: "Final Amount" }), _jsx("div", { className: "text-right", children: _jsxs("span", { className: "text-4xl font-black text-slate-900 tracking-tighter", children: [_jsx("span", { className: "text-2xl text-slate-300 font-medium align-top mr-1", children: "\u20B9" }), costs.total.toFixed(0), _jsxs("span", { className: "text-lg text-slate-400 font-bold", children: [".", costs.total.toFixed(2).split('.')[1]] })] }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [_jsx("button", { type: "button", onClick: () => onChange("paymentType", "Paid"), onKeyDown: handleKeyDown, disabled: isLocked, className: cn("py-3 text-xs font-black rounded-xl transition-all border-2 tracking-widest uppercase", paymentType === "Paid"
                                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"), children: "PAID" }), _jsx("button", { type: "button", onClick: () => onChange("paymentType", "To Pay"), onKeyDown: handleKeyDown, disabled: isLocked, className: cn("py-3 text-xs font-black rounded-xl transition-all border-2 tracking-widest uppercase", paymentType === "To Pay"
                                            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200"
                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"), children: "TO PAY" })] }), _jsx("button", { ref: saveButtonRef, onClick: onSave, disabled: (!saveLabel && isLocked) || costs.total <= 0, className: cn("w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white transition-all shadow-xl text-sm uppercase tracking-widest h-14", (!saveLabel && isLocked)
                                    ? "bg-slate-800 cursor-not-allowed shadow-none"
                                    : "bg-slate-900 hover:bg-black active:scale-[0.98]"), children: (!saveLabel && isLocked) ? (_jsxs(_Fragment, { children: [_jsx(Printer, { size: 18 }), " Print LR"] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { size: 18 }), " ", saveLabel || "Confirm LR (Enter)"] })) }), isLocked && (_jsxs("div", { className: "space-y-3 mt-4", children: [_jsxs("button", { onClick: onWhatsApp, className: "w-full py-4 bg-emerald-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98] text-sm uppercase tracking-widest", children: [_jsx(MessageCircle, { size: 18 }), "Notify on WhatsApp"] }), _jsxs("button", { onClick: onReset, className: "w-full py-4 bg-blue-600/10 text-blue-700 hover:bg-blue-600 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-sm uppercase tracking-widest", children: [_jsx(PlusCircle, { size: 18 }), "New Booking"] }), onPrint && (_jsxs("button", { onClick: onPrint, className: "w-full py-4 bg-slate-100 text-slate-800 font-black rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-slate-200 hover:bg-slate-200 active:scale-[0.98] text-sm uppercase tracking-widest mt-2", children: [_jsx(Printer, { size: 18 }), "Re-print Builty"] }))] }))] })] })] }));
}
