"use client";

import { useState, useEffect, useRef } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { Booking, Parcel, PaymentStatus } from "@/shared/types";
import { Printer, Zap, Save, PlusCircle, CheckCircle2 } from "lucide-react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { parcelService } from "@/frontend/services/parcelService";
import { mutate } from "swr";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BookingDashboard() {
  // Services & State
  const { currentUser } = useBranchStore();
  const { branchObjects } = useBranches();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local State
  const [lrNumber, setLrNumber] = useState("PENDING");
  const [isLocked, setIsLocked] = useState(false);

  // Initialize with sensible defaults.
  const [fromBranch, setFromBranch] = useState<string>("");
  const [toBranch, setToBranch] = useState<string>("");

  // Refs for focusing
  const senderNameRef = useRef<HTMLInputElement>(null);

  // Sync From Branch with Current User
  useEffect(() => {
    if (currentUser?.branchId) {
      setFromBranch(currentUser.branchId);
    } else if (branchObjects.length > 0) {
      if (!fromBranch) {
        setFromBranch(branchObjects[0]._id);
      }
    }
  }, [currentUser, branchObjects, fromBranch]);

  // Sync To Branch
  useEffect(() => {
    if (branchObjects.length > 1) {
      if (!toBranch || toBranch === fromBranch) {
        const alternate = branchObjects.find(b => b._id !== fromBranch);
        if (alternate) setToBranch(alternate._id);
      }
    }
  }, [branchObjects, fromBranch, toBranch]);

  const [sender, setSender] = useState({ name: "", mobile: "" });
  const [receiver, setReceiver] = useState({ name: "", mobile: "" });

  const [parcels, setParcels] = useState<Parcel[]>([
    { id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }
  ]);

  const [costs, setCosts] = useState({
    freight: 0,
    handling: 10,
    hamali: 0,
    total: 10
  });

  const [paymentType, setPaymentType] = useState<PaymentStatus>("Paid");

  // Auto-calculate Freight (Forward Sync: Parcels -> Total)
  useEffect(() => {
    if (isLocked) return;
    const totalFreight = parcels.reduce((sum, p) => sum + (p.quantity * (p.rate || 0)), 0);

    // Only update if there is a real difference to avoid infinite loops with backward sync
    if (Math.abs(costs.freight - totalFreight) > 0.01) {
      setCosts(prev => ({
        ...prev,
        freight: totalFreight,
        total: totalFreight + prev.handling + prev.hamali
      }));
    }
  }, [parcels, isLocked, costs.freight, costs.handling, costs.hamali]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isLocked && !isSubmitting) handleSave();
      }
      // New: Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (isLocked) handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, isSubmitting, sender, receiver, parcels, costs, paymentType, fromBranch, toBranch]);

  // Handlers
  const handleAddParcel = () => {
    setParcels([...parcels, { id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]);
  };

  const handleRemoveParcel = (id: string) => {
    setParcels(parcels.filter(p => p.id !== id));
  };

  const handleParcelChange = (id: string, field: keyof Parcel, value: any) => {
    setParcels(parcels.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    if (costs.total <= 0 || !sender.name || !receiver.name) {
      alert("Please fill in sender, receiver, and at least one item.");
      return;
    }
    setIsSubmitting(true);

    const bookingData: Booking = {
      id: generateId(),
      lrNumber: "GENERATING...",
      fromBranch: fromBranch,
      toBranch: toBranch,
      date: new Date().toISOString(),
      sender,
      receiver,
      parcels,
      costs,
      paymentType,
      status: "Booked"
    };

    const { data: createdParcel, error } = await parcelService.createBooking(bookingData, currentUser?.id || '') as { data: any, error?: any };

    if (error) {
      setIsSubmitting(false);
      alert("Booking Failed: " + error.message);
      return;
    }

    if (createdParcel) {
      setLrNumber(createdParcel.lrNumber);
      setIsLocked(true);
      setIsSubmitting(false);
      setShowSuccess(true);

      mutate(key => Array.isArray(key) && (key[0] === 'reports' || key[0] === 'ledger'));

      setTimeout(() => {
        window.print();
        setShowSuccess(false);
      }, 1000);
    }
  };

  const handleReset = () => {
    setIsLocked(false);
    setShowSuccess(false);
    setSender({ name: "", mobile: "" });
    setReceiver({ name: "", mobile: "" });
    setParcels([{ id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]);
    setCosts({ freight: 0, handling: 10, hamali: 0, total: 10 });
    setPaymentType("Paid");
    setLrNumber("PENDING");
    // Focus back to sender name for next entry
    setTimeout(() => senderNameRef.current?.focus(), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Shift Summary Bar (Operator Friendly) */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3 rounded-b-2xl mb-6 flex flex-wrap items-center justify-between shadow-lg -mt-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            Live: {currentUser?.branch || 'Global'}
          </div>
          <div className="text-sm font-medium opacity-80 border-l border-white/20 pl-4">
            Operator: <span className="font-bold">{currentUser?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="opacity-60 mr-1 italic">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 bg-black/20 rounded border border-white/10 text-[10px]">Ctrl+S</kbd> Save & Print
            <span className="mx-2 opacity-30">|</span>
            <kbd className="px-1.5 py-0.5 bg-black/20 rounded border border-white/10 text-[10px]">Ctrl+N</kbd> New LR
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 group">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">Booking Desk</h1>
          <p className="text-slate-500 font-medium">Streamlining branch shipments</p>
        </div>

        <div className={`transition-all duration-500 transform ${isLocked ? 'scale-110' : ''} bg-white ring-4 ${isLocked ? 'ring-green-400/20' : 'ring-slate-100'} px-6 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-4`}>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Serial Number</span>
            <span className={`text-2xl font-mono font-black ${isLocked ? 'text-green-600' : 'text-blue-600'}`}>
              {lrNumber}
            </span>
          </div>
          {isLocked && <CheckCircle2 className="text-green-500 animate-bounce" size={28} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Forms */}
        <div className="lg:col-span-2 space-y-8">
          <BookingForm
            title="Sender DETAILS (BHEJNAR)"
            type="sender"
            values={sender}
            onChange={(field, val) => setSender({ ...sender, [field]: val })}
            onNext={() => {
              const nextInput = document.getElementById('receiver-name') as HTMLInputElement;
              nextInput?.focus();
            }}
            disabled={isLocked}
            branch={fromBranch}
            onBranchChange={setFromBranch}
            branchLabel="FROM"
            availableBranches={branchObjects}
            inputRef={senderNameRef}
          />

          <BookingForm
            title="Receiver DETAILS (MELVNAR)"
            type="receiver"
            values={receiver}
            onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
            onNext={() => {
              const nextInput = document.getElementById('parcel-qty-0') as HTMLInputElement;
              nextInput?.focus();
            }}
            disabled={isLocked}
            branch={toBranch}
            onBranchChange={setToBranch}
            branchLabel="TO"
            availableBranches={branchObjects}
          />

          <ParcelList
            parcels={parcels}
            onAdd={handleAddParcel}
            onRemove={handleRemoveParcel}
            onChange={handleParcelChange}
            onNext={() => {
              const nextInput = document.getElementById('freight-input') as HTMLInputElement;
              nextInput?.focus();
            }}
            disabled={isLocked}
          />
        </div>

        {/* Right Panel: Payment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24">
            <PaymentBox
              costs={costs}
              paymentType={paymentType}
              onChange={(field, val) => {
                if (field === 'paymentType') setPaymentType(val);
                else {
                  const numVal = val as number;
                  setCosts(prev => {
                    const updated = { ...prev, [field]: numVal };
                    return { ...updated, total: updated.freight + updated.handling + updated.hamali };
                  });

                  // Backward Sync: If Total Freight changed manually, distribute to parcels
                  if (field === 'freight' && !isLocked) {
                    const totalQty = parcels.reduce((sum, p) => sum + p.quantity, 0);
                    const currentSum = parcels.reduce((sum, p) => sum + (p.quantity * p.rate), 0);

                    if (totalQty > 0) {
                      const newParcels = parcels.map(p => {
                        let newRate = 0;
                        if (currentSum > 0) {
                          // Proportional distribution
                          newRate = p.rate * (numVal / currentSum);
                        } else {
                          // Equal distribution if all rates are 0
                          newRate = numVal / totalQty;
                        }
                        // Round to 2 decimals for clean pricing
                        return { ...p, rate: Math.round(newRate * 100) / 100 };
                      });
                      setParcels(newParcels);
                    }
                  }
                }
              }}
              onSave={handleSave}
              isLocked={isLocked}
            />

            {isLocked && (
              <button
                onClick={handleReset}
                className="w-full mt-6 py-4 bg-blue-600/10 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-dashed border-blue-200"
              >
                <PlusCircle size={20} />
                NEW BOOKING (CTRL+N)
              </button>
            )}

            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Printer size={18} className="animate-pulse" />
                Printing receipt... Please wait.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Receipt */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10">
        {/* Receipt content remained mostly same but I'll optimize branding */}
        <div className="text-center mb-10 border-b-2 pb-6 border-slate-900">
          <h1 className="text-4xl font-black mb-1 uppercase tracking-tighter">SAVAN LOGISTICS</h1>
          <p className="text-sm font-bold tracking-widest text-slate-600">PREMIUM PARCEL SERVICES</p>
          <p className="text-base mt-2 font-mono">Branch: {branchObjects.find(b => b._id === fromBranch)?.name || 'Main'}</p>
        </div>

        <div className="flex justify-between items-end mb-10 pb-4 border-b border-dashed border-slate-300">
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">LR Tracking Number</p>
            <p className="text-3xl font-black font-mono tracking-wide">{lrNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Date & Time</p>
            <p className="text-lg font-bold">{new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-black uppercase text-slate-400 mb-2 border-b border-slate-200 pb-1">Shipper (Sender)</p>
            <p className="text-xl font-bold">{sender.name}</p>
            <p className="text-base text-slate-600">{sender.mobile}</p>
            <p className="text-sm mt-2"><span className="opacity-50">From:</span> {branchObjects.find(b => b._id === fromBranch)?.name}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-black uppercase text-slate-400 mb-2 border-b border-slate-200 pb-1">Consignee (Receiver)</p>
            <p className="text-xl font-bold">{receiver.name}</p>
            <p className="text-base text-slate-600">{receiver.mobile}</p>
            <p className="text-sm mt-2"><span className="opacity-50">To:</span> {branchObjects.find(b => b._id === toBranch)?.name}</p>
          </div>
        </div>

        <table className="w-full mb-10 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-100">
              <th className="py-3 px-2 font-black uppercase text-xs">Qty</th>
              <th className="py-3 px-2 font-black uppercase text-xs">Description</th>
              <th className="py-3 px-2 font-black uppercase text-xs text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((p, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-4 px-2 font-bold">{p.quantity}</td>
                <td className="py-4 px-2">{p.itemType}</td>
                <td className="py-4 px-2 text-right font-mono">₹ {(p.quantity * (p.rate || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start pt-6">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl">
            <p className="text-[10px] uppercase font-black opacity-50 mb-1">Billing Status</p>
            <p className="text-2xl font-black italic tracking-wider">{paymentType}</p>
          </div>
          <div className="text-right">
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex justify-between gap-10 text-sm opacity-60">
                <span>Freight:</span>
                <span>₹ {costs.freight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-10 text-sm opacity-60">
                <span>Handling:</span>
                <span>₹ {costs.handling.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-slate-100 px-6 py-4 rounded-2xl border-2 border-slate-900">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Grand Total</p>
              <p className="text-4xl font-black">₹ {costs.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-between">
          <div className="border-t-2 border-slate-900 pt-2 w-48 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Shipper Signature</p>
          </div>
          <div className="border-t-2 border-slate-900 pt-2 w-48 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Authorized Signatory</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 border-t pt-4 border-slate-100">
            Thank you for choosing SAVAN - Safe & Reliable Logistics
          </p>
        </div>
      </div>
    </div>
  );
}
