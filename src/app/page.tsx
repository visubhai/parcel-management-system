"use client";

import { useState, useEffect } from "react";
import { useBranchStore } from "@/lib/store";
import { BookingForm } from "@/components/booking/BookingForm";
import { ParcelList } from "@/components/booking/ParcelList";
import { PaymentBox } from "@/components/booking/PaymentBox";
import { Booking, Parcel, PaymentStatus, Branch } from "@/lib/types";
// import { v4 as uuidv4 } from "uuid"; // We might not have uuid installed, I'll use a simple random string generator or date
import { Printer } from "lucide-react";

// Simple ID generator if uuid is not available
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function BookingDashboard() {
  const { currentBranch, addBooking, branches, fetchBranches } = useBranchStore();

  // Load branches on mount
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Local State
  const [lrNumber, setLrNumber] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [fromBranch, setFromBranch] = useState<Branch>(currentBranch);
  const [toBranch, setToBranch] = useState<Branch>(currentBranch === "Branch A" ? "Branch B" : (branches[0] || "Branch A"));

  const [sender, setSender] = useState({ name: "", mobile: "" });
  const [receiver, setReceiver] = useState({ name: "", mobile: "" });

  const [parcels, setParcels] = useState<Parcel[]>([
    { id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }
  ]);

  const [costs, setCosts] = useState({
    freight: 0,
    handling: 10, // Builty Charge fixed at 10
    hamali: 0,    // Hamali fixed at 0
    total: 10
  });

  const [paymentType, setPaymentType] = useState<PaymentStatus>("Paid");

  // Update initial From Branch when global branch changes
  useEffect(() => {
    if (!isLocked) {
      setFromBranch(currentBranch);
    }
  }, [currentBranch, isLocked]);

  // Effect to update LR Number when From Branch changes
  useEffect(() => {
    // In a real app, fetch the next sequence from DB for the specific branch
    const randomSeq = Math.floor(1000 + Math.random() * 9000); // Mock sequence
    const prefix = fromBranch.substring(0, 1).toUpperCase();
    setLrNumber(`${prefix}/${randomSeq}`);

    // Auto-adjust Destination if it conflicts
    if (fromBranch === toBranch) {
      // Find distinct branch
      const otherOptions = branches.filter(b => b !== fromBranch);
      if (otherOptions.length > 0) {
        setToBranch(otherOptions[0]);
      }
    }
  }, [fromBranch, toBranch, isLocked, branches]);

  // Auto-calculate Freight when parcels change
  useEffect(() => {
    if (isLocked) return;
    const totalFreight = parcels.reduce((sum, p) => sum + (p.quantity * (p.rate || 0)), 0);
    setCosts(prev => ({
      ...prev,
      freight: totalFreight,
      total: totalFreight + prev.handling + prev.hamali
    }));
  }, [parcels, isLocked]);

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
    if (costs.total <= 0) return;

    const newBooking: Booking = {
      id: generateId(), // ID will be ignored/replaced by DB? or should we omit?
      // Store expects partial, but types says Booking. 
      // DB generates ID. Store maps to DB. 
      // We keep generateId() for local until refresh?
      // Actually store.createBooking ignores the ID passed in and generates new one from DB.
      lrNumber,
      fromBranch,
      toBranch,
      date: new Date().toISOString(),
      sender,
      receiver,
      parcels,
      costs,
      paymentType,
      status: "In Transit"
    };

    await addBooking(newBooking);
    setIsLocked(true);

    // Simulate Print
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleReset = () => {
    setIsLocked(false);
    setSender({ name: "", mobile: "" });
    setReceiver({ name: "", mobile: "" });
    setParcels([{ id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]);
    setCosts({ freight: 0, handling: 10, hamali: 0, total: 10 });
    setPaymentType("Paid");
    // Generate new LR
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = fromBranch.substring(0, 1).toUpperCase();
    setLrNumber(`${prefix}/${randomSeq}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ... (keep header) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Booking</h1>
          <p className="text-slate-500 text-sm">Create a new parcel booking</p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">LR Number</span>
          <span className="text-xl font-mono font-bold text-blue-600">{lrNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <BookingForm
            title="Sender Details"
            type="sender"
            values={sender}
            onChange={(field, val) => setSender({ ...sender, [field]: val })}
            disabled={isLocked}
            branch={fromBranch}
            onBranchChange={setFromBranch}
            branchLabel="Dispatch Branch"
            availableBranches={branches}
          />

          <BookingForm
            title="Receiver Details"
            type="receiver"
            values={receiver}
            onChange={(field, val) => setReceiver({ ...receiver, [field]: val })}
            disabled={isLocked}
            branch={toBranch}
            onBranchChange={setToBranch}
            branchLabel="Dest. Branch"
            availableBranches={branches}
          />

          <ParcelList
            parcels={parcels}
            onAdd={handleAddParcel}
            onRemove={handleRemoveParcel}
            onChange={handleParcelChange}
            disabled={isLocked}
          />
        </div>

        {/* Right Panel: Payment */}
        <div className="lg:col-span-1">
          <PaymentBox
            costs={costs}
            paymentType={paymentType}
            onChange={(field, val) => {
              if (field === 'paymentType') setPaymentType(val);
              else {
                setCosts(prev => {
                  const updated = { ...prev, [field]: val };
                  return { ...updated, total: updated.freight + updated.handling + updated.hamali };
                });
              }
            }}
            onSave={handleSave}
            isLocked={isLocked}
          />

          {isLocked && (
            <button
              onClick={handleReset}
              className="w-full mt-4 py-2 text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Start New Booking
            </button>
          )}
        </div>
      </div>

      {/* Hidden Print Receipt */}
      <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-50 p-8">
        <div className="text-center mb-8 border-b pb-4 border-slate-900">
          <h1 className="text-3xl font-bold mb-2">ABCD Logistics</h1>
          <p className="text-sm">Transport & Parcel Services</p>
          <p className="text-sm mt-1">{currentBranch}</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-slate-500">LR Number</p>
            <p className="text-xl font-bold font-mono">{lrNumber}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="font-bold border-b border-slate-300 mb-2 pb-1">Sender</p>
            <p>{sender.name}</p>
            <p>{sender.mobile}</p>
          </div>
          <div>
            <p className="font-bold border-b border-slate-300 mb-2 pb-1">Receiver</p>
            <p>{receiver.name}</p>
            <p>{receiver.mobile}</p>
          </div>
        </div>

        <table className="w-full mb-8 text-left">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="pb-2">Qty</th>
              <th className="pb-2">Item</th>

            </tr>
          </thead>
          <tbody>
            {parcels.map((p, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2">{p.quantity}</td>
                <td className="py-2">{p.itemType}</td>

              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-slate-900 pt-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold uppercase">{paymentType}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">₹ {costs.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-slate-400">
          <p>Thank you for shipping with ABCD Logistics</p>
        </div>
      </div>
    </div>
  );
}
