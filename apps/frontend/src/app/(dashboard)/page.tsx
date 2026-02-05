"use client";

import { useState, useEffect, useRef } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { Booking, Parcel, PaymentStatus } from "@/shared/types";
import { Printer, Zap, Save, PlusCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { parcelService } from "@/frontend/services/parcelService";
import { useToast } from "@/frontend/components/ui/toast";
import { mutate } from "swr";
import { openWhatsApp } from "@/frontend/lib/whatsapp";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BookingDashboard() {
  // Services & State
  const { currentUser } = useBranchStore();
  const { branchObjects } = useBranches();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local State
  const [lrNumber, setLrNumber] = useState("Loading...");
  const [isLocked, setIsLocked] = useState(false);

  // Initialize with sensible defaults.
  const [fromBranch, setFromBranch] = useState<string>("");
  const [toBranch, setToBranch] = useState<string>("");

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

  const [paymentType, setPaymentType] = useState<PaymentStatus>("Paid");
  const [remarks, setRemarks] = useState("");

  // Recent Bookings
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
      status: "INCOMING"
    };

    const { data: createdParcel, error } = await parcelService.createBooking(bookingData, currentUser?.id || '') as { data: any, error?: any };

    if (error) {
      setIsSubmitting(false);
      addToast("Booking Failed: " + error.message, "error");
      return;
    }

    if (createdParcel) {
      setLrNumber(createdParcel.lr_number); // Note: backend returns lr_number in this object
      setIsLocked(true);
      setIsSubmitting(false);
      setShowSuccess(true);
      addToast("Booking Created Successfully!", "success");

      fetchRecent(); // Refresh recent list
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
    setLrNumber("Loading...");
    setRemarks("");
    // Focus back to sender name for next entry
    setTimeout(() => senderNameRef.current?.focus(), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Shift Summary Bar (Operator Friendly) */}
      <div className="bg-slate-900 text-white p-3 rounded-b-2xl mb-6 flex flex-wrap items-center justify-between shadow-xl shadow-slate-900/10 -mt-6 relative overflow-hidden">
        {/* Abstract Background - Matching Theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            Live: {currentUser?.branch || 'Global'}
          </div>
          <div className="text-sm font-medium opacity-80 border-l border-white/20 pl-4">
            Operator: <span className="font-bold">{currentUser?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
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
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">LR Number</span>
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

          <div className="bg-card text-card-foreground p-5 rounded-[24px] border-2 border-slate-100 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Remarks / Comments</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isLocked}
              className="w-full bg-slate-50 border-transparent focus:bg-white rounded-xl p-3 min-h-[80px] text-sm font-semibold"
              placeholder="Any special instructions..."
            />
          </div>
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
            />

            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Printer size={18} className="animate-pulse" />
                Printing receipt... Please wait.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Bookings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <div key={booking.id || booking._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{booking.lrNumber}</span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-sm font-bold text-slate-700 truncate">{booking.receiver?.name}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-slate-500">{booking.parcels?.length} Items</span>
                  <span className="text-xs font-black text-slate-800">₹{booking.costs?.total}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
              No recent bookings found today.
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Receipt for Pre-printed Stationery */}
      {/* Target area: Middle 3 inches. Header ~2in already printed. Footer also printed. */}
      {/* Using absolute positioning and inch units for precision */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-hidden text-black font-sans leading-tight">
        {/* Spacer for pre-printed header */}
        <div style={{ height: "1in" }}></div>

        {/* Printable Area Container (height reduced by ~10%, width increased by reducing padding) */}
        <div className="px-2 relative h-[2.5in]" style={{ fontFamily: "Arial, sans-serif", width: "100%" }}>

          {/* Top Row: LR and Date */}
          <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-1">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500">L.R. Number</span>
              <span className="text-2xl font-black tracking-widest">{lrNumber}</span>
            </div>
            <div className="flex flex-col items-center mx-auto">
              <span className="text-xl font-bold uppercase border-2 border-black px-4 py-0.5 rounded-md">{paymentType}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-gray-500">Booking Date</span>
              <span className="text-sm font-bold">{new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* From / To Branch Row */}
          <div className="flex mb-3 text-xs">
            <div className="w-1/2 pr-2 border-r border-gray-300">
              <p className="font-bold uppercase text-gray-500 text-[10px]">From Branch</p>
              <p className="font-bold text-base">{branchObjects.find(b => b._id === fromBranch)?.name?.replace("Branch", "").trim() || 'Head Office'}</p>
            </div>
            <div className="w-1/2 pl-2">
              <p className="font-bold uppercase text-gray-500 text-[10px]">To Branch</p>
              <p className="font-bold text-base">{branchObjects.find(b => b._id === toBranch)?.name?.replace("Branch", "").trim()}</p>
            </div>
          </div>

          {/* Sender / Receiver Row (Grid) */}
          <div className="grid grid-cols-2 gap-4 mb-3 border border-black rounded-lg">
            {/* Sender */}
            <div className="p-2 border-r border-black">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-bold uppercase opacity-60">Sender</span>
                <span className="text-[10px] font-mono">{sender.mobile}</span>
              </div>
              <p className="font-bold text-sm truncate uppercase">{sender.name}</p>
            </div>
            {/* Receiver */}
            <div className="p-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-bold uppercase opacity-60">Receiver</span>
                <span className="text-[10px] font-mono">{receiver.mobile}</span>
              </div>
              <p className="font-bold text-sm truncate uppercase">{receiver.name}</p>
            </div>
          </div>

          {/* Parcel & Payment Details (Side by Side) */}
          <div className="flex gap-2 h-[1.2in]">
            {/* Parcel Table */}
            <div className="w-[60%] border border-black rounded-lg overflow-hidden flex flex-col">
              <div className="flex bg-gray-100 border-b border-black text-[10px] font-bold uppercase py-1">
                <div className="w-12 text-center border-r border-black">Qty</div>
                <div className="flex-1 px-2 border-r border-black">Description</div>
                <div className="w-16 text-center">Weight</div>
              </div>
              <div className="flex-1 overflow-visible">
                {parcels.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex text-xs py-1 border-b border-gray-200 last:border-0">
                    <div className="w-12 text-center border-r border-gray-200 font-bold">{p.quantity}</div>
                    <div className="flex-1 px-2 border-r border-gray-200 truncate">{p.itemType}</div>
                    <div className="w-16 text-center">{p.weight || '-'}</div>
                  </div>
                ))}
                {remarks && (
                  <div className="text-[10px] italic p-1 border-t border-gray-200 mt-auto bg-gray-50 truncate">
                    Note: {remarks}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="w-[40%] border border-black rounded-lg p-2 flex flex-col justify-between">
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between"><span className="opacity-60">Freight</span> <span className="font-mono">{costs.freight}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Handling</span> <span className="font-mono">{costs.handling}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Hamali</span> <span className="font-mono">{costs.hamali}</span></div>
              </div>
              <div className="border-t border-black pt-1 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase">Total</span>
                <span className="text-xl font-black">₹{costs.total}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
