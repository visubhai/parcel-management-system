"use client";

import { X, Check, IndianRupee } from "lucide-react";
import { IncomingParcel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReceiveModalProps {
    parcel: IncomingParcel;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ReceiveModal({ parcel, isOpen, onClose, onConfirm }: ReceiveModalProps) {
    if (!isOpen) return null;

    const isToPay = parcel.paymentStatus === "To Pay";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Receive Parcel</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">LR Number</p>
                            <p className="text-xl font-mono font-bold text-blue-600">{parcel.lrNumber}</p>
                        </div>
                        {isToPay && (
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount Due</p>
                                <p className="text-xl font-bold text-red-600 flex items-center justify-end gap-1">
                                    <IndianRupee className="w-4 h-4" /> {parcel.totalAmount}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Sender</span>
                            <span className="font-medium text-slate-800">{parcel.senderName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Receiver</span>
                            <span className="font-medium text-slate-800">{parcel.receiverName}</span>
                        </div>
                    </div>

                    {isToPay ? (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-2">
                            <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                                Collect payment of ₹{parcel.totalAmount} before handing over.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-2">
                            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                                <Check className="w-4 h-4" /> Payment already completed.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all",
                            isToPay ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {isToPay ? "Collect & Receive" : "Confirm Receive"}
                    </button>
                </div>
            </div>
        </div>
    );
}
