"use client";

import { useEffect } from "react";
import { Save, Printer, Lock } from "lucide-react";
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
}

export function PaymentBox({ costs, paymentType, onChange, onSave, isLocked }: PaymentBoxProps) {

    // Auto-calculate total
    useEffect(() => {
        const total = (costs.freight || 0) + (costs.handling || 0) + (costs.hamali || 0);
        if (total !== costs.total) {
            onChange("total", total);
        }
    }, [costs.freight, costs.handling, costs.hamali, costs.total, onChange]);

    return (
        <div className={cn(
            "p-6 rounded-xl border shadow-xl shadow-slate-200/50 sticky top-6 backdrop-blur-md transition-all",
            isLocked ? "border-green-200 bg-green-50/80" : "bg-white/90 border-slate-200"
        )}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Payment
                </h3>
                {isLocked && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        <Lock className="w-3.5 h-3.5" /> Booked
                    </span>
                )}
            </div>

            <div className="space-y-5">
                {/* Inputs */}
                {[
                    { label: "Freight Charge", field: "freight" },
                    { label: "Builty Charge", field: "handling" },
                    { label: "Hamali", field: "hamali" }
                ].map((item) => (
                    <div key={item.field}>
                        <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                            {item.label}
                        </label>
                        <div className="relative group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={costs[item.field as keyof typeof costs]}
                                disabled={isLocked || item.field === "handling" || item.field === "hamali"}
                                onChange={(e) => onChange(item.field, parseFloat(e.target.value) || 0)}
                                className={cn(
                                    "w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 text-right font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500 transition-all",
                                    !isLocked && item.field !== "handling" && item.field !== "hamali" && "bg-slate-50/50 focus:bg-white"
                                )}
                            />
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t border-slate-200">
                    <div className="flex items-end justify-between mb-6">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Total Amount</span>
                        <div className="text-right">
                            <span className="text-4xl font-black text-slate-900 tracking-tight">
                                <span className="text-2xl text-slate-400 font-medium align-top mr-1">₹</span>
                                {costs.total.toFixed(0)}
                                <span className="text-lg text-slate-500 font-bold">.{costs.total.toFixed(2).split('.')[1]}</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => onChange("paymentType", "Paid")}
                            disabled={isLocked}
                            className={cn(
                                "py-2.5 text-sm font-bold rounded-lg transition-all border-2",
                                paymentType === "Paid"
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                        >
                            PAID
                        </button>
                        <button
                            onClick={() => onChange("paymentType", "To Pay")}
                            disabled={isLocked}
                            className={cn(
                                "py-2.5 text-sm font-bold rounded-lg transition-all border-2",
                                paymentType === "To Pay"
                                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                        >
                            TO PAY
                        </button>
                    </div>

                    <button
                        onClick={onSave}
                        disabled={isLocked || costs.total <= 0}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-xl shadow-teal-500/20 text-base uppercase tracking-wide",
                            isLocked
                                ? "bg-slate-800 cursor-not-allowed shadow-none"
                                : "bg-slate-900 hover:bg-slate-800 hover:scale-[1.02]"
                        )}
                    >
                        {isLocked ? (
                            <>
                                <Printer className="w-5 h-5" /> Print Receipt
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Confirm Booking
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
