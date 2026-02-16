"use client";

import { useState, useEffect, useRef } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { SingleSelect } from "@/frontend/components/ui/single-select-dropdown";
import { Booking, Parcel, PaymentStatus } from "@/shared/types";
import { Printer, Zap, Save, PlusCircle, CheckCircle2, MessageCircle, MapPin, CreditCard, User, Package } from "lucide-react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { parcelService } from "@/frontend/services/parcelService";
import { useToast } from "@/frontend/components/ui/toast";
import { mutate } from "swr";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
import { PrintBuilty } from "@/frontend/components/booking/PrintBuilty";
import { useRouter } from "next/navigation";
import { cn } from "@/frontend/lib/utils";

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BookingDashboard() {
  // Services & State
  const { currentUser, setBookingLrNumber } = useBranchStore();
  const { branchObjects } = useBranches();
  const { addToast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local State
  const [lrNumber, setLrNumber] = useState("Loading...");
  const [isLocked, setIsLocked] = useState(false);

  // Sync Global LR for Header Display
  useEffect(() => {
    setBookingLrNumber(lrNumber);
    // Cleanup on unmount
    return () => setBookingLrNumber("");
  }, [lrNumber, setBookingLrNumber]);

  // Initialize with sensible defaults.
  const [fromBranch, setFromBranch] = useState<string>("");
  const [toBranch, setToBranch] = useState<string>("");

  // Refs for focusing
  const senderNameRef = useRef<HTMLInputElement>(null);

  // Auto-focus Destination on Mount
  useEffect(() => {
    document.getElementById('destination-select')?.focus();
  }, []);

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

  const [paymentType, setPaymentType] = useState<PaymentStatus>("To Pay");
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
      status: "PENDING"
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

  const handleWhatsApp = () => {
    const fromBranchName = branchObjects.find(b => b._id === fromBranch)?.name || "";
    const toBranchName = branchObjects.find(b => b._id === toBranch)?.name || "";

    openWhatsApp({
      mobile: sender.mobile,
      lrNumber,
      status: "Booked & Outbound",
      fromBranch: fromBranchName,
      toBranch: toBranchName,
      senderName: sender.name,
      receiverName: receiver.name,
      amount: costs.total,
      paymentStatus: paymentType
    }, addToast);
  };

  const handleReset = () => {
    setIsLocked(false);
    setShowSuccess(false);
    setToBranch("");
    setSender({ name: "", mobile: "" });
    setReceiver({ name: "", mobile: "" });
    setParcels([{ id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]);
    setCosts({ freight: 0, handling: 10, hamali: 0, total: 10 });
    setPaymentType("To Pay");
    setLrNumber("Loading...");
    setRemarks("");
    // Focus back to destination for next entry
    setTimeout(() => document.getElementById('destination-select')?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans print:hidden">

      {/* Title Bar below Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-3 mb-6 shadow-md relative overflow-hidden">
        {/* Subtle Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-full mx-auto px-6 flex items-center justify-between relative z-10">
          <h1 className="text-lg font-bold text-white">
            New Parcel <span className="text-blue-400">Booking</span>
          </h1>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg shadow-inner">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">SYSTEM ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace - Exact 2-Column Look */}
      <main className="max-w-full mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* SELECT DESTINATION CARD */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-blue-600" />
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">SELECT DESTINATION</label>
              </div>
              <SingleSelect
                id="destination-select"
                value={toBranch}
                disabled={isLocked}
                placeholder="Select Destination Branch..."
                options={branchObjects
                  .filter(b => b._id !== fromBranch)
                  .map(b => ({ label: b.name, value: b._id }))
                }
                onChange={(val) => {
                  setToBranch(val);
                  // Focus move to payment type for quick keyboard selection
                  setTimeout(() => document.getElementById('payment-topay')?.focus(), 100);
                }}
                className="border-gray-200"
              />
            </div>

            {/* SENDER DETAILS CARD */}
            <BookingForm
              title="SENDER DETAILS"
              type="sender"
              values={sender}
              onChange={(field, val) => setSender({ ...sender, [field]: val })}
              onNext={() => document.getElementById('receiver-name')?.focus()}
              disabled={isLocked}
              inputRef={senderNameRef}
            />

            {/* PARCEL INFO CARD - Compact Look */}
            <ParcelList
              parcels={parcels}
              onAdd={handleAddParcel}
              onRemove={handleRemoveParcel}
              onChange={handleParcelChange}
              onNext={() => document.getElementById('save-booking-button')?.focus()}
              disabled={isLocked}
              remarks={remarks}
              onRemarksChange={setRemarks}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* PAYMENT TYPE CARD */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-blue-600" />
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">PAYMENT TYPE</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="payment-topay"
                  onClick={() => setPaymentType("To Pay")}
                  disabled={isLocked}
                  className={cn(
                    "h-10 text-sm font-bold rounded-md transition-all border",
                    paymentType === "To Pay"
                      ? "border-red-600 text-red-600 bg-red-50 shadow-sm"
                      : "border-gray-200 text-gray-400 bg-white hover:border-gray-300"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPaymentType("Paid");
                      document.getElementById('payment-paid')?.focus();
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      senderNameRef.current?.focus();
                    }
                  }}
                >
                  To Pay
                </button>
                <button
                  id="payment-paid"
                  onClick={() => setPaymentType("Paid")}
                  disabled={isLocked}
                  className={cn(
                    "h-10 text-sm font-bold rounded-md transition-all border",
                    paymentType === "Paid"
                      ? "border-green-600 text-green-600 bg-green-50 shadow-sm"
                      : "border-gray-200 text-gray-400 bg-white hover:border-gray-300"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setPaymentType("To Pay");
                      document.getElementById('payment-topay')?.focus();
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      senderNameRef.current?.focus();
                    }
                  }}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* RECEIVER DETAILS CARD */}
            <BookingForm
              title="RECEIVER DETAILS"
              type="receiver"
              values={receiver}
              onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
              onNext={() => document.getElementById('parcel-type-0')?.focus()}
              disabled={isLocked}
            />

            {/* PAYMENT SUMMARY CARD */}
            <PaymentBox
              costs={costs}
              onSave={handleSave}
              isLocked={isLocked}
              onWhatsApp={handleWhatsApp}
              onReset={handleReset}
              saveLabel="PRINT & SAVE"
            />
          </div>
        </div>
      </main>

      {/* Hidden Print Receipt Component */}
      <PrintBuilty
        booking={{
          id: '',
          lrNumber: lrNumber,
          fromBranch,
          toBranch,
          date: new Date().toISOString(),
          sender,
          receiver,
          parcels,
          costs,
          paymentType: paymentType as any,
          status: 'Booked',
          remarks
        } as any}
        branches={branchObjects}
      />
    </div>
  );
}
