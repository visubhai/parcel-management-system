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
    const isDeliverAction = parcel.status === "Arrived"; // If Arrived, we are now Delivering

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        {isDeliverAction ? "Confirm Delivery" : "Receive Parcel"}
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LR Number</p>
                            <p className="text-xl font-mono font-bold text-primary">{parcel.lrNumber}</p>
                        </div>
                        {isToPay && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount Due</p>
                                <p className="text-xl font-bold text-destructive flex items-center justify-end gap-1">
                                    <IndianRupee className="w-4 h-4" /> {parcel.totalAmount}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-3 border border-border/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sender</span>
                            <span className="font-medium">{parcel.senderName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Receiver</span>
                            <span className="font-medium">{parcel.receiverName}</span>
                        </div>
                    </div>

                    {isDeliverAction ? (
                        // Delivery Context
                        isToPay ? (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-2">
                                <p className="text-sm text-red-800 font-bold flex items-center gap-2">
                                    ⚠️ Collect ₹{parcel.totalAmount} cash from customer.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-2">
                                <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Payment Pre-paid. Safe to deliver.
                                </p>
                            </div>
                        )
                    ) : (
                        // Receive Context (In Transit -> Arrived)
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                            <p className="text-sm text-blue-800 font-medium">
                                Confirm physical receipt of goods at branch.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-muted/50 border-t border-border flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-muted-foreground bg-background border border-input rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-bold text-primary-foreground shadow-lg hover:scale-[1.02] transition-all",
                            (isDeliverAction && isToPay) ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {isDeliverAction
                            ? (isToPay ? "Collect & Deliver" : "Confirm Delivery")
                            : "Confirm Receipt"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
