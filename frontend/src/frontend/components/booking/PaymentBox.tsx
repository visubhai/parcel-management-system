"use client";

import { Printer, PlusCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { PaymentStatus } from "@/shared/types";

interface PaymentBoxProps {
    costs: {
        freight: number;
        handling: number;
        hamali: number;
        total: number;
    };
    onSave: () => void;
    isLocked: boolean;
    onWhatsApp?: () => void;
    onReset?: () => void;
    saveLabel?: string;
}

export function PaymentBox({ costs, onSave, isLocked, onWhatsApp, onReset, saveLabel }: PaymentBoxProps) {
    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-500/50">
            <div className="flex items-center gap-2 mb-6">
                <Printer className="w-4 h-4 text-blue-600" />
                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">
                    PAYMENT SUMMARY
                </h3>
            </div>

            <div className="space-y-4">
                {/* Individual Charges */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Freight Charges</span>
                        <span className="text-xs font-bold text-gray-800">₹ {costs.freight}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">LR Charge</span>
                        <span className="text-xs font-bold text-gray-800">₹ {costs.handling}</span>
                    </div>
                </div>

                {/* Dotted Separator */}
                <div className="border-t border-dotted border-gray-300 my-2" />

                {/* Grand Total - Refined Number Section only */}
                <div className="flex flex-col items-end gap-2 pt-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Payable Amount</span>
                    <div className="bg-slate-900 px-6 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-blue-400">₹</span>
                        <span className="text-5xl font-black text-white tracking-tighter leading-none">
                            {costs.total}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 space-y-3">
                    {!isLocked ? (
                        <button
                            id="save-booking-button"
                            onClick={onSave}
                            disabled={isLocked}
                            className="w-full h-11 bg-[#2563EB] hover:bg-blue-600 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest"
                        >
                            <Printer size={16} />
                            {saveLabel || "PRINT & SAVE"}
                        </button>
                    ) : (
                        <>
                            <button
                                id="whatsapp-button"
                                onClick={onWhatsApp}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        document.getElementById('new-entry-button')?.focus();
                                    }
                                }}
                                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WHATSAPP MESSAGE
                            </button>
                            <button
                                id="new-entry-button"
                                onClick={onReset}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        document.getElementById('whatsapp-button')?.focus();
                                    }
                                }}
                                className="w-full h-11 bg-white border-2 border-green-600 text-green-600 font-bold rounded-md flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
                            >
                                <PlusCircle size={16} />
                                BOOKED - NEW ENTRY?
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
