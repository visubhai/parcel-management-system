import React from 'react';
import { Booking, Branch } from "@/shared/types";

interface PrintBuiltyProps {
    booking: Booking;
    branches: any[];
}

export const PrintBuilty = ({ booking, branches }: PrintBuiltyProps) => {
    const getBranchDetails = (branchVal: any) => {
        if (!branchVal) return null;
        if (typeof branchVal !== 'string' && branchVal.name) return branchVal;

        const id = typeof branchVal === 'string' ? branchVal : (branchVal._id || branchVal.id);

        const found = branches?.find(b => {
            if (!b) return false;
            if (typeof b === 'string') return b === id;
            const bId = b._id || b.id || b.name; // Try multiple keys
            return bId === id;
        });

        return found && typeof found !== 'string' ? found : null;
    };

    const fromBranchDetails = getBranchDetails(booking.fromBranch);
    const toBranchDetails = getBranchDetails(booking.toBranch);

    // Fallbacks just in case
    const fromBranchName = fromBranchDetails?.name || (typeof booking.fromBranch === 'string' ? booking.fromBranch : "Unknown Branch");
    const toBranchName = toBranchDetails?.name || (typeof booking.toBranch === 'string' ? booking.toBranch : "Unknown Branch");

    return (
        <div className="hidden print:flex fixed inset-0 bg-white z-[9999] overflow-hidden text-black font-sans leading-tight items-start justify-start">
            {/* Printable Area Container: 21cm width x 7cm height */}
            <div
                className="relative flex flex-col justify-between"
                style={{
                    fontFamily: "Arial, sans-serif",
                    width: "21cm",
                    height: "7cm",
                    padding: "0.5cm" // Small padding to keep text off the absolute physical edge
                }}
            >
                {/* Top Row: LR and Date */}
                <div className="flex justify-between items-end mb-2 border-b-2 border-black pb-1 shrink-0">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-gray-500 leading-none mb-0.5">L.R. Number</span>
                        <span className="text-xl font-black tracking-widest leading-none">{booking.lrNumber}</span>
                    </div>
                    <div className="flex flex-col items-center mx-auto">
                        <span className="text-[11px] font-bold uppercase border border-black px-2 py-0.5 rounded-sm line-clamp-1">{booking.paymentType}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-bold text-gray-500 leading-none mb-0.5">Booking Date</span>
                        <span className="text-[11px] font-bold leading-none">
                            {new Date(booking.date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* Main Content Area - Split Left (Routing) and Right (Parcels/Financials) */}
                <div className="flex gap-2 h-full min-h-0 overflow-hidden text-[10px]">

                    {/* Left Column: Routing & Parties */}
                    <div className="w-[45%] flex flex-col justify-between gap-1 overflow-hidden">

                        {/* From / To Branch Row */}
                        <div className="flex border border-black rounded-sm overflow-hidden shrink-0">
                            <div className="w-1/2 p-1 border-r border-black font-mono">
                                <p className="font-bold uppercase opacity-60 text-[8px] leading-none mb-0.5">From Branch</p>
                                <p className="font-bold text-[10px] leading-tight truncate">{fromBranchName?.replace("Branch", "").trim() || 'Head Office'}</p>
                                {fromBranchDetails?.phone && <p className="text-[8px] mt-0.5 font-bold truncate">✆ {fromBranchDetails.phone}</p>}
                            </div>
                            <div className="w-1/2 p-1 font-mono">
                                <p className="font-bold uppercase opacity-60 text-[8px] leading-none mb-0.5">To Branch</p>
                                <p className="font-bold text-[10px] leading-tight truncate">{toBranchName?.replace("Branch", "").trim()}</p>
                                {toBranchDetails?.phone && <p className="text-[8px] mt-0.5 font-bold truncate">✆ {toBranchDetails.phone}</p>}
                            </div>
                        </div>

                        {/* Sender / Receiver Row */}
                        <div className="flex border border-black rounded-sm overflow-hidden h-full min-h-0">
                            {/* Sender */}
                            <div className="w-1/2 p-1 border-r border-black flex flex-col">
                                <span className="text-[8px] font-bold uppercase opacity-60 leading-none">Sender</span>
                                <span className="text-[9px] font-mono font-bold leading-tight truncate mt-0.5">{booking.sender.mobile}</span>
                                <p className="font-bold text-[10px] uppercase truncate mt-0.5 line-clamp-2 leading-tight flex-1" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                                    {booking.sender.name}
                                </p>
                            </div>
                            {/* Receiver */}
                            <div className="w-1/2 p-1 flex flex-col">
                                <span className="text-[8px] font-bold uppercase opacity-60 leading-none">Receiver</span>
                                <span className="text-[9px] font-mono font-bold leading-tight truncate mt-0.5">{booking.receiver.mobile}</span>
                                <p className="font-bold text-[10px] uppercase truncate mt-0.5 line-clamp-2 leading-tight flex-1" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                                    {booking.receiver.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Parcels & Finances */}
                    <div className="w-[55%] flex gap-1 h-full min-h-0">

                        {/* Parcel Table */}
                        <div className="w-[60%] border border-black rounded-sm overflow-hidden flex flex-col">
                            <div className="flex bg-gray-100 border-b border-black text-[8px] font-bold uppercase py-0.5 shrink-0">
                                <div className="w-8 text-center border-r border-black">Qty</div>
                                <div className="flex-1 px-1">Item Details</div>
                            </div>
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {booking.parcels.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex text-[9px] border-b border-gray-200 last:border-0 min-h-[14px] items-center">
                                        <div className="w-8 text-center border-r border-gray-200 font-bold shrink-0">{p.quantity}</div>
                                        <div className="flex-1 px-1 truncate font-mono tracking-tight">{p.itemType}</div>
                                    </div>
                                ))}
                                {booking.remarks && (
                                    <div className="text-[8px] italic p-1 border-t border-black mt-auto bg-gray-50 truncate shrink-0">
                                        Note: {booking.remarks}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="w-[40%] border border-black rounded-sm p-1 flex flex-col justify-between shrink-0">
                            <div className="space-y-0 text-[9px]">
                                <div className="flex justify-between items-center"><span className="opacity-70 text-[8px] uppercase font-bold">Freight</span> <span className="font-mono font-bold">{booking.costs.freight}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-70 text-[8px] uppercase font-bold">Handling</span> <span className="font-mono font-bold">{booking.costs.handling}</span></div>
                                <div className="flex justify-between items-center"><span className="opacity-70 text-[8px] uppercase font-bold">Hamali</span> <span className="font-mono font-bold">{booking.costs.hamali}</span></div>
                            </div>
                            <div className="border-t-2 border-black pt-0.5 mt-0.5 flex flex-col justify-between items-end">
                                <span className="text-[8px] font-bold uppercase leading-none opacity-80 w-full text-left">Total</span>
                                <span className="text-lg font-black text-black leading-none mt-0.5">₹{booking.costs.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
