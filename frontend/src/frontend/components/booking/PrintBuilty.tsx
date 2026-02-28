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
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-hidden text-black font-sans leading-tight">
            {/* Spacer for pre-printed header */}
            <div style={{ height: "1in" }}></div>

            {/* Printable Area Container */}
            <div className="px-2 relative h-[2.5in]" style={{ fontFamily: "Arial, sans-serif", width: "100%" }}>

                {/* Top Row: LR and Date */}
                <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-500">L.R. Number</span>
                        <span className="text-2xl font-black tracking-widest">{booking.lrNumber}</span>
                    </div>
                    <div className="flex flex-col items-center mx-auto">
                        <span className="text-xl font-bold uppercase border-2 border-black px-4 py-0.5 rounded-md">{booking.paymentType}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-500">Booking Date</span>
                        <span className="text-sm font-bold">
                            {new Date(booking.date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* From / To Branch Row */}
                <div className="flex mb-3 text-xs">
                    <div className="w-1/2 pr-2 border-r border-gray-300">
                        <p className="font-bold uppercase text-gray-500 text-[10px]">From Branch</p>
                        <p className="font-bold text-base">{fromBranchName?.replace("Branch", "").trim() || 'Head Office'}</p>
                        {fromBranchDetails?.address && <p className="text-[10px] text-gray-600 mt-0.5 truncate leading-tight w-full" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{fromBranchDetails.address}</p>}
                        {fromBranchDetails?.phone && <p className="text-[10px] text-gray-800 mt-[2px] font-mono font-bold">✆ +91 {fromBranchDetails.phone}</p>}
                    </div>
                    <div className="w-1/2 pl-2">
                        <p className="font-bold uppercase text-gray-500 text-[10px]">To Branch</p>
                        <p className="font-bold text-base">{toBranchName?.replace("Branch", "").trim()}</p>
                        {toBranchDetails?.address && <p className="text-[10px] text-gray-600 mt-0.5 truncate leading-tight w-full" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{toBranchDetails.address}</p>}
                        {toBranchDetails?.phone && <p className="text-[10px] text-gray-800 mt-[2px] font-mono font-bold">✆ +91 {toBranchDetails.phone}</p>}
                    </div>
                </div>

                {/* Sender / Receiver Row (Grid) */}
                <div className="grid grid-cols-2 gap-4 mb-3 border border-black rounded-lg">
                    {/* Sender */}
                    <div className="p-2 border-r border-black">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[10px] font-bold uppercase opacity-60">Sender</span>
                            <span className="text-[10px] font-mono">{booking.sender.mobile}</span>
                        </div>
                        <p className="font-bold text-sm truncate uppercase">{booking.sender.name}</p>
                    </div>
                    {/* Receiver */}
                    <div className="p-2">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[10px] font-bold uppercase opacity-60">Receiver</span>
                            <span className="text-[10px] font-mono">{booking.receiver.mobile}</span>
                        </div>
                        <p className="font-bold text-sm truncate uppercase">{booking.receiver.name}</p>
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
                            {booking.parcels.slice(0, 3).map((p, i) => (
                                <div key={i} className="flex text-xs py-1 border-b border-gray-200 last:border-0">
                                    <div className="w-12 text-center border-r border-gray-200 font-bold">{p.quantity}</div>
                                    <div className="flex-1 px-2 border-r border-gray-200 truncate">{p.itemType}</div>
                                    <div className="w-16 text-center">{p.weight || '-'}</div>
                                </div>
                            ))}
                            {booking.remarks && (
                                <div className="text-[10px] italic p-1 border-t border-gray-200 mt-auto bg-gray-50 truncate">
                                    Note: {booking.remarks}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="w-[40%] border border-black rounded-lg p-2 flex flex-col justify-between">
                        <div className="space-y-0.5 text-xs">
                            <div className="flex justify-between"><span className="opacity-60">Freight</span> <span className="font-mono">{booking.costs.freight}</span></div>
                            <div className="flex justify-between"><span className="opacity-60">Handling</span> <span className="font-mono">{booking.costs.handling}</span></div>
                            <div className="flex justify-between"><span className="opacity-60">Hamali</span> <span className="font-mono">{booking.costs.hamali}</span></div>
                        </div>
                        <div className="border-t border-black pt-1 flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase">Total</span>
                            <span className="text-xl font-black text-black leading-none">₹{booking.costs.total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
