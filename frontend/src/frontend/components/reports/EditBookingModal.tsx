"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Booking, Parcel, Branch } from "@/shared/types";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import {
    X, Save, ChevronDown, Truck, MapPin,
    Calendar, User, ArrowRight, CheckCircle2, Clock,
    AlertCircle, FileText, MessageCircle, Printer
} from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { PrintBuilty } from "@/frontend/components/booking/PrintBuilty";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
import { useToast } from "@/frontend/components/ui/toast";

interface EditBookingModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
    availableBranches: Branch[];
}

export function EditBookingModal({ booking, isOpen, onClose, onSave, availableBranches }: EditBookingModalProps) {
    const { currentUser } = useBranchStore();
    const { addToast } = useToast();
    const [sender, setSender] = useState(booking.sender);
    const [receiver, setReceiver] = useState(booking.receiver);
    const [parcels, setParcels] = useState<Parcel[]>(booking.parcels);
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
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

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
        setCosts(prev => ({
            ...prev,
            freight: totalFreight,
            total: totalFreight + prev.handling + prev.hamali
        }));
    }, [parcels]);

    const handleSave = () => {
        const updatedBooking: Booking = {
            ...booking,
            sender,
            receiver,
            parcels,
            costs,
            paymentType,
            status,
            remarks,
            deliveredRemark,
            collectedBy,
            collectedByMobile
        };
        onSave(updatedBooking);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {
        const fromBranchName = getBranchName(booking.fromBranch) || "";
        const toBranchName = getBranchName(booking.toBranch) || "";

        openWhatsApp({
            mobile: sender.mobile,
            lrNumber: booking.lrNumber,
            status: status,
            fromBranch: fromBranchName,
            toBranch: toBranchName,
            senderName: sender.name,
            receiverName: receiver.name,
            amount: costs.total,
            paymentStatus: paymentType
        }, addToast);
    };

    if (!isOpen) return null;

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

    const getBranchName = (branchVal: any) => {
        if (!branchVal) return "";
        if (typeof branchVal !== 'string' && branchVal.name) return branchVal.name;
        const id = typeof branchVal === 'string' ? branchVal : (branchVal._id || branchVal.id);

        const found = availableBranches.find(b => {
            const bId = typeof b === 'string' ? b : ((b as any)._id || (b as any).id);
            return bId === id;
        });

        if (found) {
            return typeof found === 'string' ? found : (found as any).name;
        }
        return typeof branchVal === 'string' ? branchVal : "Unknown Branch";
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
                <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-[90rem] max-h-[92vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5">

                    {/* 1. Header Section */}
                    <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">LR Number</span>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">#{booking.lrNumber}</h2>
                                    {isCancelled && (
                                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            Cancelled
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="h-10 w-px bg-slate-100 mx-2"></div>

                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Date</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Redesigned Status Stepper */}
                        {!isCancelled && (
                            <div className="hidden xl:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {statusSteps.map((step, idx) => {
                                    const isCompleted = idx < currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;

                                    return (
                                        <React.Fragment key={step.label}>
                                            <div className={cn(
                                                "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-500",
                                                isCurrent ? "bg-white shadow-sm border border-slate-200 text-blue-600 scale-105" :
                                                    isCompleted ? "text-emerald-600" : "text-slate-400 opacity-60"
                                            )}>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                    isCurrent ? "bg-blue-600 text-white" :
                                                        isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                                                )}>
                                                    {isCompleted ? "✓" : idx + 1}
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider">{step.label}</span>
                                            </div>
                                            {idx < statusSteps.length - 1 && (
                                                <div className="w-6 h-0.5 mx-1 flex items-center">
                                                    <div className={cn(
                                                        "w-full h-full rounded-full transition-all duration-700",
                                                        isCompleted ? "bg-emerald-400" : "bg-slate-200"
                                                    )} />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-full transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 2. Main Content Grid */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50/50">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 max-w-[1600px] mx-auto">

                            {/* LEFT COLUMN (Inputs) */}
                            <div className="xl:col-span-8 space-y-6">

                                {/* Route Visualization Card */}
                                <div className="bg-white rounded-[24px] p-1 shadow-sm border border-slate-200/60 overflow-hidden">
                                    <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Route Details</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>From: {getBranchName(booking.fromBranch)}</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span>To: {getBranchName(booking.toBranch)}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-start relative">
                                        <div className="relative group">
                                            <div className="absolute -left-3 top-6 bottom-6 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 md:hidden"></div>
                                            <BookingForm
                                                title="Sender"
                                                type="sender"
                                                values={{ name: sender.name, mobile: sender.mobile }}
                                                onChange={(field, val) => setSender({ ...sender, [field]: val })}
                                                disabled={false}
                                            />
                                        </div>

                                        {/* Visual Connector */}
                                        <div className="hidden md:flex flex-col items-center justify-center pt-12 text-slate-300 self-stretch">
                                            <div className="w-px flex-1 bg-gradient-to-b from-slate-100 via-slate-300 to-slate-100 dashed-line"></div>
                                            <div className="p-3 my-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 shadow-sm">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                            <div className="w-px flex-1 bg-gradient-to-t from-slate-100 via-slate-300 to-slate-100 dashed-line"></div>
                                        </div>

                                        <div className="relative group">
                                            <BookingForm
                                                title="Receiver"
                                                type="receiver"
                                                values={{ name: receiver.name, mobile: receiver.mobile }}
                                                onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
                                                disabled={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Consignment Section */}
                                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                                    <div className="p-6">
                                        {/* Custom Styling wrapper for ParcelList to blend in */}
                                        {/* We pass a prop or just let it render. The ParcelList has its own Card. 
                                         Ideally we would strip the Card from ParcelList, but since we can't easily without affecting other pages,
                                         We will style around it or update ParcelList later. For now, we use it as is but it fits well.
                                     */}
                                        <ParcelList
                                            parcels={parcels}
                                            onAdd={() => setParcels([...parcels, { id: Math.random().toString(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }])}
                                            onRemove={(id) => setParcels(parcels.filter(p => p.id !== id))}
                                            onChange={(id, field, val) => setParcels(parcels.map(p => p.id === id ? { ...p, [field]: val } : p))}
                                            disabled={true}
                                        />
                                    </div>
                                </div>

                                {/* Remarks Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Booking Remarks</label>
                                        </div>
                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            className="w-full h-32 p-4 bg-slate-50/50 border-0 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-0 transition-all outline-none resize-none leading-relaxed"
                                            placeholder="Add notes about the parcel condition or handling..."
                                        />
                                    </div>
                                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                <MessageCircle className="w-4 h-4" />
                                            </div>
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Delivery Instructions</label>
                                        </div>
                                        <textarea
                                            value={deliveredRemark}
                                            onChange={(e) => setDeliveredRemark(e.target.value)}
                                            className="w-full h-32 p-4 bg-slate-50/50 border-0 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-0 transition-all outline-none resize-none leading-relaxed"
                                            placeholder="Instructions for the delivery agent or receiver..."
                                        />
                                    </div>
                                </div>

                                {/* Proof of Delivery (Shown when needed or status is Delivered) */}
                                {status === 'DELIVERED' && (
                                    <div className="bg-emerald-50/50 p-8 rounded-[24px] border border-emerald-100 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-5">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-black text-emerald-900 tracking-tight flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                    Proof of Delivery
                                                </h3>
                                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1 pl-7">Handover Confirmation</p>
                                            </div>
                                            {booking.deliveredAt && (
                                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100/50">
                                                    <div className="flex items-center gap-2 text-emerald-600 mb-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] uppercase font-bold tracking-wider">Delivered Time</span>
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-950">
                                                        {new Date(booking.deliveredAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1">Collected By</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={collectedBy}
                                                        onChange={(e) => setCollectedBy(e.target.value)}
                                                        className="w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-emerald-200/50 rounded-xl font-bold text-emerald-900 placeholder:text-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                                        placeholder="Receiver Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest ml-1">Contact</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 group-focus-within:text-emerald-500 transition-colors">#</div>
                                                    <input
                                                        type="tel"
                                                        value={collectedByMobile}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                            setCollectedByMobile(val);
                                                        }}
                                                        className="w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-emerald-200/50 rounded-xl font-bold text-emerald-900 placeholder:text-emerald-300/50 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                                        placeholder="Mobile Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN (Actions) */}
                            <div className="xl:col-span-4 space-y-6">

                                {/* Sticky Action Panel */}
                                <div className="sticky top-24 space-y-6">
                                    {/* Status Selector */}
                                    {/* Financials */}
                                    <PaymentBox
                                        costs={costs}
                                        paymentType={paymentType}
                                        onChange={(field: string, val: any) => {
                                            if (field === 'paymentType') setPaymentType(val as any);
                                            else {
                                                setCosts(prev => {
                                                    const updated = { ...prev, [field]: val };
                                                    return { ...updated, total: updated.freight + updated.handling + updated.hamali };
                                                });
                                            }
                                        }}
                                        onSave={handleSave}
                                        isLocked={false}
                                        saveLabel="Update Booking Details"
                                        onPrint={handlePrint}
                                        currentStatus={status}
                                    />

                                    {/* Additional Actions */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handlePrint}
                                            className="w-full h-11 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-sm"
                                        >
                                            <Printer size={16} />
                                            Re-Print
                                        </button>
                                        <button
                                            onClick={handleWhatsApp}
                                            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-lg shadow-green-500/20"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hidden Print Component - Teleported to body to escape print:hidden parents */}
            {typeof document !== 'undefined' && createPortal(
                <PrintBuilty
                    booking={{
                        ...booking,
                        sender,
                        receiver,
                        parcels,
                        costs,
                        paymentType,
                        remarks,
                        status
                    }}
                    branches={availableBranches}
                />,
                document.body
            )}
        </>
    );
}
