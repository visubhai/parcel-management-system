"use client";

import { useEffect, useState } from "react";
import { Booking, Parcel, Branch } from "@/shared/types";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import {
    X, Save, ChevronDown, Truck, MapPin,
    Calendar, User, ArrowRight, CheckCircle2, Clock,
    AlertCircle, FileText, MessageCircle
} from "lucide-react";
import { cn } from "@/frontend/lib/utils";

interface EditBookingModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedBooking: Booking) => void;
    availableBranches: Branch[];
}

export function EditBookingModal({ booking, isOpen, onClose, onSave, availableBranches }: EditBookingModalProps) {
    const { currentUser } = useBranchStore();
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

    if (!isOpen) return null;

    // Status Steps Configuration
    const statusSteps = [
        { id: 'Booked', label: 'Booked', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-600' },
        { id: 'In Transit', label: 'In Transit', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500' },
        { id: 'Arrived', label: 'Arrived', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-600', border: 'border-purple-600' },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-600' },
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === status) === -1 ? 0 : statusSteps.findIndex(s => s.id === status);
    const isCancelled = status === 'CANCELLED';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-[90rem] max-h-[92vh] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-300 border border-white/40 ring-1 ring-black/5">

                {/* 1. Header Section */}
                <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">LR Number</span>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">#{booking.lrNumber}</h2>
                                {isCancelled && (
                                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider rounded-full">
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

                    {/* Status Stepper (Visual) */}
                    <div className="hidden xl:flex items-center gap-3">
                        {statusSteps.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                                    (idx <= currentStepIndex && !isCancelled)
                                        ? `${step.bg}/10 ${step.border} ${step.color}`
                                        : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                                )}>
                                    <step.icon className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-wider">{step.label}</span>
                                </div>
                                {idx < statusSteps.length - 1 && (
                                    <div className={cn(
                                        "w-8 h-0.5 mx-2 rounded-full",
                                        (idx < currentStepIndex && !isCancelled) ? "bg-slate-800" : "bg-slate-200"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

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
                                            values={sender}
                                            onChange={(field, val) => setSender({ ...sender, [field]: val })}
                                            branch={booking.fromBranch}
                                            disabled={false}
                                            availableBranches={availableBranches as any}
                                            onBranchChange={() => { }}
                                            branchLabel="From"
                                            variant="minimal"
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
                                            values={receiver}
                                            onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
                                            branch={booking.toBranch}
                                            disabled={false}
                                            availableBranches={availableBranches as any}
                                            onBranchChange={() => { }}
                                            branchLabel="To"
                                            variant="minimal"
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
                                        disabled={!isSuperAdmin}
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
                                                    onChange={(e) => setCollectedByMobile(e.target.value)}
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
                                    onChange={(field, val) => {
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


