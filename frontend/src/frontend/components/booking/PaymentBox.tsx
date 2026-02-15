"use client";

import { useEffect, useRef } from "react";
import { Save, Printer, Lock, MessageCircle, PlusCircle, X, Receipt } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { PaymentStatus } from "@/shared/types";

interface PaymentBoxProps {
    costs: {
        freight: number;
        handling: number;
        hamali: number;
        total: number;
    };
    paymentType: PaymentStatus;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    isLocked: boolean;
    onWhatsApp?: () => void;
    onReset?: () => void;
    saveLabel?: string;
    onPrint?: () => void;
    currentStatus?: string;
}

export function PaymentBox({ costs, paymentType, onChange, onSave, isLocked, onWhatsApp, onReset, saveLabel, onPrint, currentStatus }: PaymentBoxProps) {
    const freightRef = useRef<HTMLInputElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // Auto-calculate total
    useEffect(() => {
        const total = (costs.freight || 0) + (costs.handling || 0) + (costs.hamali || 0);
        if (total !== costs.total) {
            onChange("total", total);
        }
    }, [costs.freight, costs.handling, costs.hamali, costs.total, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isLocked) return;

        if (e.key === "Enter") {
            if (e.currentTarget === freightRef.current) {
                e.preventDefault();
                saveButtonRef.current?.focus();
            }
        }
    };

    // Helper to format status for display
    const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className={cn(
            "rounded-xl border shadow-sm sticky top-6 transition-all overflow-hidden flex flex-col h-full",
            isLocked ? "border-emerald-100 bg-emerald-50/20" : "bg-white border-slate-200 shadow-slate-100"
        )}>
            {/* Header */}
            <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-slate-400" />
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Payment Summary
                    </h3>
                </div>

                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                    paymentType === 'Paid'
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                )}>
                    {paymentType}
                </span>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-center">
                {/* Line Items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-500">Freight Charges</span>
                        <div className="flex-1 border-b-2 border-dotted border-slate-200 mx-3 relative top-1 opacity-50" />
                        <div className="relative w-24 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-400 text-xs font-bold">₹</span>
                                <input
                                    type="number"
                                    ref={freightRef}
                                    value={costs.freight}
                                    disabled={isLocked}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => onChange("freight", parseFloat(e.target.value) || 0)}
                                    className="w-16 text-right bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 text-sm py-0.5 transition-all focus:bg-blue-50/50 p-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-500">LR / Admin Charge</span>
                        <div className="flex-1 border-b-2 border-dotted border-slate-200 mx-3 relative top-1 opacity-50" />
                        <div className="relative w-24 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-400 text-xs font-bold">₹</span>
                                <span className="w-16 text-right font-bold text-slate-500 text-sm py-0.5">
                                    {costs.handling}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-500">Hamali / Labor</span>
                        <div className="flex-1 border-b-2 border-dotted border-slate-200 mx-3 relative top-1 opacity-50" />
                        <div className="relative w-24 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-400 text-xs font-bold">₹</span>
                                <input
                                    type="number"
                                    value={costs.hamali}
                                    disabled={isLocked}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => onChange("hamali", parseFloat(e.target.value) || 0)}
                                    className="w-16 text-right bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 text-sm py-0.5 transition-all focus:bg-blue-50/50 p-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tighter">
                        ₹{costs.total.toFixed(0)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                {!isLocked ? (
                    <button
                        ref={saveButtonRef}
                        onClick={onSave}
                        disabled={(!saveLabel && isLocked) || costs.total <= 0}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-widest"
                    >
                        {saveLabel ? (
                            <>
                                <Printer size={16} /> {saveLabel}
                            </>
                        ) : (
                            <>
                                <Save size={16} /> CONFIRM & PRINT
                            </>
                        )}
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={onWhatsApp}
                                className="h-10 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#128C7E] transition-all flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider shadow-md shadow-green-500/20"
                            >
                                <MessageCircle size={14} /> WhatsApp
                            </button>
                            <button
                                onClick={onPrint}
                                className="h-10 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider"
                            >
                                <Printer size={14} /> Reprint
                            </button>
                        </div>
                        <button
                            onClick={onReset}
                            className="w-full h-10 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider"
                        >
                            <PlusCircle size={14} /> NEW PARCEL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
