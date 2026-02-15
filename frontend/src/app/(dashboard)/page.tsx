"use client";

import { useState, useEffect, useRef } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { Booking, Parcel, PaymentStatus } from "@/shared/types";
import { Zap, MapPin, Search, History, Calculator, Keyboard, Receipt, RotateCcw, Menu, Bell, Clock, ArrowRight, Truck, Calendar } from "lucide-react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { parcelService } from "@/frontend/services/parcelService";
import { useToast } from "@/frontend/components/ui/toast";
import { mutate } from "swr";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
import { PrintBuilty } from "@/frontend/components/booking/PrintBuilty";
import { useRouter } from "next/navigation";
import { SingleSelect } from "@/frontend/components/ui/single-select-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BookingDashboard() {
  // Services & State
  const { currentUser, setLR } = useBranchStore();
  const { branchObjects } = useBranches();
  const { addToast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local State
  const [lrNumber, setLrNumber] = useState("Loading...");
  const [isLocked, setIsLocked] = useState(false);

  // Sync Global LR state
  useEffect(() => {
    setLR(lrNumber);
    return () => setLR(null);
  }, [lrNumber, setLR]);

  // Initialize with sensible defaults.
  const [fromBranch, setFromBranch] = useState<string>("");
  const [toBranch, setToBranch] = useState<string>("");
  const [paymentType, setPaymentType] = useState<PaymentStatus>("Paid");

  // Refs for focusing
  const senderNameRef = useRef<HTMLInputElement>(null);

  // Fetch Next LR
  const fetchNextLR = async () => {
    if (fromBranch && !isLocked) {
      const { data } = await parcelService.getNextLR(fromBranch);
      if (data?.nextLR) {
        setLrNumber(data.nextLR);
      }
    }
  };

  // Sync Next LR when branch changes or unlocked
  useEffect(() => {
    fetchNextLR();
  }, [fromBranch, isLocked]);

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

  const [remarks, setRemarks] = useState("");

  // Recent Bookings (For history)
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const fetchRecent = async () => {
    if (currentUser?.branchId) {
      const { data } = await parcelService.getOutgoingParcels(currentUser.branchId);
      if (data) {
        setRecentBookings(data.slice(0, 5));
      }
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [currentUser?.branchId]);

  // Auto-calculate Freight
  useEffect(() => {
    if (isLocked) return;
    const totalFreight = parcels.reduce((sum, p) => sum + (p.quantity * (p.rate || 0)), 0);

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
  }, [isLocked, isSubmitting, sender, receiver, parcels, costs, paymentType, fromBranch, toBranch, remarks]);

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
      addToast("Please fill in sender, receiver, and at least one item.", "error");
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
      remarks,
      status: "PENDING"
    };

    const { data: createdParcel, error } = await parcelService.createBooking(bookingData, currentUser?.id || '') as { data: any, error?: any };

    if (error) {
      setIsSubmitting(false);
      addToast("Booking Failed: " + error.message, "error");
      return;
    }

    if (createdParcel) {
      setLrNumber(createdParcel.lr_number);
      setIsLocked(true);
      setIsSubmitting(false);
      setShowSuccess(true);
      addToast("Booking Created Successfully!", "success");

      fetchRecent();
      mutate(key => Array.isArray(key) && (key[0] === 'reports' || key[0] === 'ledger'));

      // AUTO PRINT AND THEN RESET
      setTimeout(() => {
        // Trigger print
        window.print();

        // Reset form automatically after print dialog closes (approximate)
        // Or we can just reset state immediately but maybe user wants to see it
        // Let's reset after a short delay to allow print to capture the "Locked" state
        setTimeout(() => {
          handleReset();
        }, 1000); // 1s delay
      }, 500);
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
    setLrNumber("Loading...");
    setRemarks(""); // Clear remarks

    // Check next LR immediately
    fetchNextLR();

    // Focus back to sender name for next entry
    setTimeout(() => senderNameRef.current?.focus(), 100);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Header Removed */}

      {/* 2. MAIN WORKSPACE GRID */}
      <main className="max-w-[1920px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 items-start">

        {/* TOP STATUS ROW */}
        {/* TOP STATUS ROW REMOVED - MERGED INTO GLOBAL HEADER */}

        {/* LEFT COLUMN - DATA ENTRY (Fluid Width) */}
        <div className="col-span-12 xl:col-span-9 space-y-5">

          {/* SECTION 1: DESTINATION & PAYMENT MODE */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <Card className="md:col-span-8 shadow-sm border-slate-200">
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-auto md:flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <MapPin size={12} /> Destination Branch
                  </label>
                  <SingleSelect
                    value={toBranch}
                    options={branchObjects.filter(b => b._id !== fromBranch).map(b => ({ label: b.name, value: b._id }))}
                    onChange={setToBranch}
                    disabled={isLocked}
                    placeholder="Select Branch..."
                    className="h-10 text-sm font-semibold w-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-4 shadow-sm border-slate-200">
              <CardContent className="p-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <Receipt size={12} /> Payment Mode
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['To Pay', 'Paid'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentType(mode as PaymentStatus)}
                      disabled={isLocked}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wide ${paymentType === mode
                        ? (mode === 'Paid' ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' : 'bg-white text-red-700 shadow-sm ring-1 ring-black/5')
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION 2: SENDER & RECEIVER (Splitscreen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="shadow-sm border-slate-200 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5">
                <BookingForm
                  title="Sender Details"
                  type="sender"
                  values={sender}
                  onChange={(field, val) => setSender({ ...sender, [field]: val })}
                  onNext={() => {
                    const nextInput = document.getElementById('receiver-name') as HTMLInputElement;
                    nextInput?.focus();
                  }}
                  disabled={isLocked}
                  inputRef={senderNameRef}
                  variant="fintech"
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5">
                <BookingForm
                  title="Receiver Details"
                  type="receiver"
                  values={receiver}
                  onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
                  onNext={() => {
                    const nextInput = document.getElementById('parcel-qty-0') as HTMLInputElement;
                    nextInput?.focus();
                  }}
                  disabled={isLocked}
                  variant="fintech"
                />
              </CardContent>
            </Card>
          </div>

          {/* SECTION 4: PARCEL MANIFEST */}
          <Card className="shadow-sm border-slate-200 min-h-[400px]">
            <CardContent className="p-0">
              <ParcelList
                parcels={parcels}
                onAdd={handleAddParcel}
                onRemove={handleRemoveParcel}
                onChange={handleParcelChange}
                onNext={() => {
                  const nextInput = document.getElementById('freight-input') as HTMLInputElement; // Fallback
                  nextInput?.focus();
                }}
                disabled={isLocked}
                variant="fintech"
              />

              {/* Internal Remarks */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Remarks / Reference</span>
                </div>
                <input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={isLocked}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="Add private notes, invoice numbers, or references here..."
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN - STICKY PAYMENT SUMMARY */}
        <div className="col-span-12 xl:col-span-3 space-y-6 sticky top-24">

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col">
            {/* Summary Header */}
            <div className="bg-slate-900 text-white p-5 py-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 opacity-20"></div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-2 relative z-10">Grand Total</h3>
              <div className="text-5xl font-black tracking-tighter relative z-10">
                <span className="text-3xl align-top opacity-50 font-medium mr-1">₹</span>
                {costs.total}
              </div>
              <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${paymentType === 'Paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'} relative z-10`}>
                {paymentType}
              </div>
            </div>

            {/* Payment Breakdown (Using PaymentBox Logic but stripped styling) */}
            <div className="p-0">
              <PaymentBox
                costs={costs}
                paymentType={paymentType}
                onChange={(field, val) => {
                  if (field !== 'paymentType') {
                    const numVal = val as number;
                    setCosts(prev => {
                      const updated = { ...prev, [field]: numVal };
                      return { ...updated, total: updated.freight + updated.handling + updated.hamali };
                    });
                    // Backward Sync Logic
                    if (field === 'freight' && !isLocked) {
                      const currentSum = parcels.reduce((sum, p) => sum + (p.quantity * p.rate), 0);
                      const totalQty = parcels.reduce((sum, p) => sum + p.quantity, 0);
                      if (totalQty > 0) {
                        const newParcels = parcels.map(p => {
                          let newRate = 0;
                          if (currentSum > 0) newRate = p.rate * (numVal / currentSum);
                          else newRate = numVal / totalQty;
                          return { ...p, rate: Math.round(newRate * 100) / 100 };
                        });
                        setParcels(newParcels);
                      }
                    }
                  }
                }}
                onSave={handleSave}
                isLocked={isLocked}
                onWhatsApp={() => openWhatsApp({
                  mobile: receiver.mobile || sender.mobile,
                  lrNumber: lrNumber,
                  status: "Booked",
                  fromBranch: branchObjects.find(b => b._id === fromBranch)?.name || "",
                  toBranch: branchObjects.find(b => b._id === toBranch)?.name || "",
                  receiverName: receiver.name || sender.name,
                  amount: costs.total,
                  paymentStatus: paymentType
                }, addToast)}
                onReset={handleReset}
              // Custom styling passed via logic not props unfortunately, but wrapper handles structure
              // The PaymentBox renders its own styles too, so we might have double styling if not careful.
              // I will rely on PaymentBox's existing structure but it's okay because we are wrapping it.
              // Actually, PaymentBox renders a card. I put it inside a card. Double Card?
              // Let's rely on standard PaymentBox rendering but cleaner.
              // I'll leave as is for now, user asked for "Sticky Right Panel".
              />
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="bg-slate-50 p-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Keyboard size={12} /> Hotkeys
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Save & Print</span>
                  <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-sm">Cmd+S</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Reset Form</span>
                  <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-sm">Cmd+N</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Print Receipt Component */}
      <PrintBuilty
        booking={{
          id: '',
          lrNumber: lrNumber,
          fromBranch: fromBranch,
          toBranch: toBranch,
          date: new Date().toISOString(),
          sender: sender,
          receiver: receiver,
          parcels: parcels,
          costs: costs,
          paymentType: paymentType as any,
          status: 'Booked',
          remarks: remarks
        } as any}
        branches={branchObjects}
      />
    </div>
  );
}
