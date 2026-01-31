"use client";

import { useEffect, useState } from "react";
import { Booking, Parcel, Branch } from "@/shared/types";
import { BranchObj } from "@/frontend/hooks/useBranches";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { X, Save } from "lucide-react";

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

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    useEffect(() => {
        setSender(booking.sender);
        setReceiver(booking.receiver);
        setParcels(booking.parcels);
        setCosts(booking.costs);
        setPaymentType(booking.paymentType);
        setStatus(booking.status);
    }, [booking, isOpen]);

    // Auto-calculate logic (matching BookingDashboard)
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
            status
        };
        onSave(updatedBooking);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Edit Booking: {booking.lrNumber}</h2>
                        <p className="text-sm text-slate-500">Modify details for this consignment</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <BookingForm
                            title="Sender Details"
                            type="sender"
                            values={sender}
                            onChange={(field, val) => setSender({ ...sender, [field]: val })}
                            branch={booking.fromBranch}
                            disabled={false}
                            availableBranches={availableBranches as any}
                            onBranchChange={() => { }} // Branch cannot be changed
                            branchLabel="Origin"
                        />
                        <BookingForm
                            title="Receiver Details"
                            type="receiver"
                            values={receiver}
                            onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
                            branch={booking.toBranch}
                            disabled={false}
                            availableBranches={availableBranches as any}
                            onBranchChange={() => { }} // Destination cannot be changed
                            branchLabel="Destination"
                        />
                        <ParcelList
                            parcels={parcels}
                            onAdd={() => setParcels([...parcels, { id: Math.random().toString(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }])}
                            onRemove={(id) => setParcels(parcels.filter(p => p.id !== id))}
                            onChange={(id, field, val) => setParcels(parcels.map(p => p.id === id ? { ...p, [field]: val } : p))}

                            disabled={!isSuperAdmin} // Strictly enforced: Only Super Admin can change Parcel/Qty/Rate
                        />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
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
                            onSave={handleSave} // Triggers save from PaymentBox button if we want, or hide it
                            isLocked={!isSuperAdmin} // Strictly enforced: Only Super Admin can change costs
                        />

                        {/* Status Update (Optional) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Booking Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium"
                            >
                                <option value="In Transit">In Transit</option>
                                <option value="Arrived">Arrived</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
