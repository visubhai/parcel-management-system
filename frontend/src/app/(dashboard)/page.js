"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { BookingForm } from "@/frontend/components/booking/BookingForm";
import { ParcelList } from "@/frontend/components/booking/ParcelList";
import { PaymentBox } from "@/frontend/components/booking/PaymentBox";
import { Printer, Zap, CheckCircle2 } from "lucide-react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { parcelService } from "@/frontend/services/parcelService";
import { useToast } from "@/frontend/components/ui/toast";
import { mutate } from "swr";
import { openWhatsApp } from "@/frontend/lib/whatsapp";
import { PrintBuilty } from "@/frontend/components/booking/PrintBuilty";
import { useRouter } from "next/navigation";
// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);
export default function BookingDashboard() {
    // Services & State
    const { currentUser } = useBranchStore();
    const { branchObjects } = useBranches();
    const { addToast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // Local State
    const [lrNumber, setLrNumber] = useState("Loading...");
    const [isLocked, setIsLocked] = useState(false);
    // Initialize with sensible defaults.
    const [fromBranch, setFromBranch] = useState("");
    const [toBranch, setToBranch] = useState("");
    // Refs for focusing
    const senderNameRef = useRef(null);
    // Fetch Next LR
    const fetchNextLR = async () => {
        if (fromBranch && !isLocked) {
            const { data } = await parcelService.getNextLR(fromBranch);
            if (data === null || data === void 0 ? void 0 : data.nextLR) {
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
        if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branchId) {
            setFromBranch(currentUser.branchId);
        }
        else if (branchObjects.length > 0) {
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
                if (alternate)
                    setToBranch(alternate._id);
            }
        }
    }, [branchObjects, fromBranch, toBranch]);
    const [sender, setSender] = useState({ name: "", mobile: "" });
    const [receiver, setReceiver] = useState({ name: "", mobile: "" });
    const [parcels, setParcels] = useState([
        { id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }
    ]);
    const [costs, setCosts] = useState({
        freight: 0,
        handling: 10,
        hamali: 0,
        total: 10
    });
    const [paymentType, setPaymentType] = useState("Paid");
    const [remarks, setRemarks] = useState("");
    // Recent Bookings
    const [recentBookings, setRecentBookings] = useState([]);
    const fetchRecent = async () => {
        if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branchId) {
            const { data } = await parcelService.getOutgoingParcels(currentUser.branchId);
            if (data) {
                setRecentBookings(data.slice(0, 5));
            }
        }
    };
    useEffect(() => {
        fetchRecent();
    }, [currentUser === null || currentUser === void 0 ? void 0 : currentUser.branchId]);
    // Auto-calculate Freight (Forward Sync: Parcels -> Total)
    useEffect(() => {
        if (isLocked)
            return;
        const totalFreight = parcels.reduce((sum, p) => sum + (p.quantity * (p.rate || 0)), 0);
        // Only update if there is a real difference to avoid infinite loops with backward sync
        if (Math.abs(costs.freight - totalFreight) > 0.01) {
            setCosts(prev => (Object.assign(Object.assign({}, prev), { freight: totalFreight, total: totalFreight + prev.handling + prev.hamali })));
        }
    }, [parcels, isLocked, costs.freight, costs.handling, costs.hamali]);
    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Save: Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (!isLocked && !isSubmitting)
                    handleSave();
            }
            // New: Ctrl/Cmd + N
            if ((e.ctrlKey || e.metaKey) && e.key === "n") {
                e.preventDefault();
                if (isLocked)
                    handleReset();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLocked, isSubmitting, sender, receiver, parcels, costs, paymentType, fromBranch, toBranch, remarks]);
    // Handlers
    const handleAddParcel = () => {
        setParcels([...parcels, { id: generateId(), quantity: 1, itemType: "White Sack", weight: 0, rate: 0 }]);
    };
    const handleRemoveParcel = (id) => {
        setParcels(parcels.filter(p => p.id !== id));
    };
    const handleParcelChange = (id, field, value) => {
        setParcels(parcels.map(p => p.id === id ? Object.assign(Object.assign({}, p), { [field]: value }) : p));
    };
    const handleSave = async () => {
        if (costs.total <= 0 || !sender.name || !receiver.name) {
            addToast("Please fill in sender, receiver, and at least one item.", "error");
            return;
        }
        setIsSubmitting(true);
        const bookingData = {
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
        const { data: createdParcel, error } = await parcelService.createBooking(bookingData, (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) || '');
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
        setTimeout(() => { var _a; return (_a = senderNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 pb-20 print:hidden", children: [_jsxs("div", { className: "bg-slate-900 text-white p-3 rounded-b-2xl mb-6 flex flex-wrap items-center justify-between shadow-xl shadow-slate-900/10 -mt-6 relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" }), _jsx("div", { className: "absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" })] }), _jsxs("div", { className: "relative z-10 flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20", children: [_jsx(Zap, { size: 14, className: "text-yellow-400 fill-yellow-400" }), "Live: ", (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch) || 'Global'] }), _jsxs("div", { className: "text-sm font-medium opacity-80 border-l border-white/20 pl-4", children: ["Operator: ", _jsx("span", { className: "font-bold", children: currentUser === null || currentUser === void 0 ? void 0 : currentUser.name })] })] }), _jsx("div", { className: "flex items-center gap-6 relative z-10", children: _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "opacity-60 mr-1 italic", children: "Shortcuts:" }), _jsx("kbd", { className: "px-1.5 py-0.5 bg-black/20 rounded border border-white/10 text-[10px]", children: "Ctrl+S" }), " Save & Print", _jsx("span", { className: "mx-2 opacity-30", children: "|" }), _jsx("kbd", { className: "px-1.5 py-0.5 bg-black/20 rounded border border-white/10 text-[10px]", children: "Ctrl+N" }), " New LR"] }) })] }), _jsxs("div", { className: "flex items-center justify-between mb-8 group", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors", children: "Booking Desk" }), _jsx("p", { className: "text-slate-500 font-medium", children: "Streamlining branch shipments" })] }), _jsxs("div", { className: `transition-all duration-500 transform ${isLocked ? 'scale-110' : ''} bg-white ring-4 ${isLocked ? 'ring-green-400/20' : 'ring-slate-100'} px-6 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-4`, children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black", children: "LR Number" }), _jsx("span", { className: `text-2xl font-mono font-black ${isLocked ? 'text-green-600' : 'text-blue-600'}`, children: lrNumber })] }), isLocked && _jsx(CheckCircle2, { className: "text-green-500 animate-bounce", size: 28 })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsx(BookingForm, { title: "Sender DETAILS (BHEJNAR)", type: "sender", values: sender, onChange: (field, val) => setSender(Object.assign(Object.assign({}, sender), { [field]: val })), onNext: () => {
                                    const nextInput = document.getElementById('receiver-name');
                                    nextInput === null || nextInput === void 0 ? void 0 : nextInput.focus();
                                }, disabled: isLocked, branch: fromBranch, onBranchChange: setFromBranch, branchLabel: "FROM", availableBranches: branchObjects, inputRef: senderNameRef }), _jsx(BookingForm, { title: "Receiver DETAILS (MELVNAR)", type: "receiver", values: receiver, onChange: (field, val) => setReceiver(Object.assign(Object.assign({}, receiver), { [field]: val })), onNext: () => {
                                    const nextInput = document.getElementById('parcel-qty-0');
                                    nextInput === null || nextInput === void 0 ? void 0 : nextInput.focus();
                                }, disabled: isLocked, branch: toBranch, onBranchChange: setToBranch, branchLabel: "TO", availableBranches: branchObjects }), _jsx(ParcelList, { parcels: parcels, onAdd: handleAddParcel, onRemove: handleRemoveParcel, onChange: handleParcelChange, onNext: () => {
                                    const nextInput = document.getElementById('freight-input');
                                    nextInput === null || nextInput === void 0 ? void 0 : nextInput.focus();
                                }, disabled: isLocked }), _jsxs("div", { className: "bg-card text-card-foreground p-5 rounded-[24px] border-2 border-slate-100 shadow-sm", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block", children: "Remarks / Comments" }), _jsx("textarea", { value: remarks, onChange: (e) => setRemarks(e.target.value), disabled: isLocked, className: "w-full bg-slate-50 border-transparent focus:bg-white rounded-xl p-3 min-h-[80px] text-sm font-semibold", placeholder: "Any special instructions..." })] })] }), _jsx("div", { className: "lg:col-span-1 space-y-6", children: _jsxs("div", { className: "sticky top-24", children: [_jsx(PaymentBox, { costs: costs, paymentType: paymentType, onChange: (field, val) => {
                                        if (field === 'paymentType')
                                            setPaymentType(val);
                                        else {
                                            const numVal = val;
                                            setCosts(prev => {
                                                const updated = Object.assign(Object.assign({}, prev), { [field]: numVal });
                                                return Object.assign(Object.assign({}, updated), { total: updated.freight + updated.handling + updated.hamali });
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
                                                        }
                                                        else {
                                                            // Equal distribution if all rates are 0
                                                            newRate = numVal / totalQty;
                                                        }
                                                        // Round to 2 decimals for clean pricing
                                                        return Object.assign(Object.assign({}, p), { rate: Math.round(newRate * 100) / 100 });
                                                    });
                                                    setParcels(newParcels);
                                                }
                                            }
                                        }
                                    }, onSave: handleSave, isLocked: isLocked, onWhatsApp: () => {
                                        var _a, _b;
                                        return openWhatsApp({
                                            mobile: receiver.mobile || sender.mobile,
                                            lrNumber: lrNumber,
                                            status: "Booked",
                                            fromBranch: ((_a = branchObjects.find(b => b._id === fromBranch)) === null || _a === void 0 ? void 0 : _a.name) || "",
                                            toBranch: ((_b = branchObjects.find(b => b._id === toBranch)) === null || _b === void 0 ? void 0 : _b.name) || "",
                                            receiverName: receiver.name || sender.name,
                                            amount: costs.total,
                                            paymentStatus: paymentType
                                        }, addToast);
                                    }, onReset: handleReset }), showSuccess && (_jsxs("div", { className: "mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2", children: [_jsx(Printer, { size: 18, className: "animate-pulse" }), "Printing receipt... Please wait."] }))] }) })] }), _jsxs("div", { className: "mt-8", children: [_jsx("h3", { className: "text-sm font-bold text-slate-500 uppercase tracking-widest mb-4", children: "Recent Bookings" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: recentBookings.length > 0 ? (recentBookings.map((booking) => {
                            var _a, _b, _c;
                            return (_jsxs("button", { onClick: () => router.push(`/reports?lrNumber=${booking.lrNumber}&edit=true`), className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left w-full group", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors", children: booking.lrNumber }), _jsx("span", { className: "text-[10px] font-bold text-slate-400", children: new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), _jsx("div", { className: "text-sm font-bold text-slate-700 truncate capitalize", children: (_a = booking.receiver) === null || _a === void 0 ? void 0 : _a.name }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsxs("span", { className: "text-xs font-medium text-slate-500", children: [(_b = booking.parcels) === null || _b === void 0 ? void 0 : _b.length, " Items"] }), _jsxs("span", { className: "text-xs font-black text-slate-800", children: ["\u20B9", (_c = booking.costs) === null || _c === void 0 ? void 0 : _c.total] })] })] }, booking.id || booking._id));
                        })) : (_jsx("div", { className: "col-span-full py-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl", children: "No recent bookings found today." })) })] }), _jsx(PrintBuilty, { booking: {
                    id: '',
                    lrNumber: lrNumber,
                    fromBranch: fromBranch,
                    toBranch: toBranch,
                    date: new Date().toISOString(),
                    sender: sender,
                    receiver: receiver,
                    parcels: parcels,
                    costs: costs,
                    paymentType: paymentType,
                    status: 'Booked',
                    remarks: remarks
                }, branches: branchObjects })] }));
}
