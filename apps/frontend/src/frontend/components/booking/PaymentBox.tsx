"use client";

import { useEffect, useRef } from "react";
import { Save, Printer, Lock, MessageCircle, PlusCircle } from "lucide-react";
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
}

export function PaymentBox({ costs, paymentType, onChange, onSave, isLocked, onWhatsApp, onReset, saveLabel }: PaymentBoxProps) {
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

        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            // Optional: Toggle payment type on arrows if focused on the section
            const newType = paymentType === "Paid" ? "To Pay" : "Paid";
            onChange("paymentType", newType);
        }
    };

    return (
        <div className={cn(
            "p-6 rounded-[24px] border-2 shadow-xl shadow-slate-200/50 sticky top-6 backdrop-blur-md transition-all",
            isLocked ? "border-green-200 bg-green-50/80" : "bg-white/90 border-slate-100"
        )}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    Payment Gateway
                </h3>
                {isLocked && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wide">
                        <Lock className="w-3.5 h-3.5" /> Booked
                    </span>
                )}
            </div>

            <div className="space-y-5">
                {/* Inputs */}
                {[
                    { label: "Freight Charge", field: "freight", ref: freightRef },
                    { label: "Builty Charge", field: "handling" },
                    { label: "Hamali", field: "hamali" }
                ].map((item) => (
                    <div key={item.field}>
                        <label className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wide ml-1">
                            {item.label}
                        </label>
                        <div className="relative group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                            <input
                                type="number"
                                id="freight-input"
                                ref={item.ref as any}
                                value={costs[item.field as keyof typeof costs]}
                                disabled={isLocked || item.field === "handling" || item.field === "hamali"}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => onChange(item.field, parseFloat(e.target.value) || 0)}
                                className={cn(
                                    "w-full pl-8 pr-4 py-3 rounded-xl border border-transparent text-right font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 disabled:bg-slate-50 disabled:text-slate-400 transition-all bg-slate-50/50 focus:bg-white text-lg",
                                    (isLocked || item.field === "handling" || item.field === "hamali") && "opacity-60"
                                )}
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-end justify-between mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Final Amount</span>
                        <div className="text-right">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                <span className="text-2xl text-slate-300 font-medium align-top mr-1">₹</span>
                                {costs.total.toFixed(0)}
                                <span className="text-lg text-slate-400 font-bold">.{costs.total.toFixed(2).split('.')[1]}</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => onChange("paymentType", "Paid")}
                            onKeyDown={handleKeyDown}
                            disabled={isLocked}
                            className={cn(
                                "py-3 text-xs font-black rounded-xl transition-all border-2 tracking-widest uppercase",
                                paymentType === "Paid"
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            PAID
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("paymentType", "To Pay")}
                            onKeyDown={handleKeyDown}
                            disabled={isLocked}
                            className={cn(
                                "py-3 text-xs font-black rounded-xl transition-all border-2 tracking-widest uppercase",
                                paymentType === "To Pay"
                                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            TO PAY
                        </button>
                    </div>

                    <button
                        ref={saveButtonRef}
                        onClick={onSave}
                        disabled={isLocked || costs.total <= 0}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white transition-all shadow-xl text-sm uppercase tracking-widest h-14",
                            isLocked
                                ? "bg-slate-800 cursor-not-allowed shadow-none"
                                : "bg-slate-900 hover:bg-black active:scale-[0.98]"
                        )}
                    >
                        {isLocked ? (
                            <>
                                <Printer size={18} /> Print LR
                            </>
                        ) : (
                            <>
                                <Save size={18} /> {saveLabel || "Confirm LR (Enter)"}
                            </>
                        )}
                    </button>

                    {isLocked && (
                        <div className="space-y-3 mt-4">
                            <button
                                onClick={onWhatsApp}
                                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98] text-sm uppercase tracking-widest"
                            >
                                <MessageCircle size={18} />
                                Notify on WhatsApp
                            </button>

                            <button
                                onClick={onReset}
                                className="w-full py-4 bg-blue-600/10 text-blue-700 hover:bg-blue-600 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-sm uppercase tracking-widest"
                            >
                                <PlusCircle size={18} />
                                New Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
