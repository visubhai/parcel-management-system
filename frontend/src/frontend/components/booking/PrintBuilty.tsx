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
        <div className="hidden print:flex fixed inset-0 bg-white z-[9999] overflow-hidden text-black font-sans box-border items-start justify-start">
            {/* Spacer for pre-printed header - only if needed, usually for thermal rolls we shouldn't have top margins unless there's a specific pre-print pad */}
            {/* If the user uses a strictly blank 21x7 sticker, we don't need top padding. I will add a 0.5cm top padding for safe bleed. */}

            <div
                className="relative flex flex-col"
                style={{
                    fontFamily: "Arial, sans-serif",
                    width: "21cm",
                    height: "7cm",
                    padding: "0.2cm 0.5cm", // Adjust padding for optimal bleed
                    boxSizing: "border-box"
                }}
            >
                {/* GLOBAL BORDER WRAPPER FOR PROFESSIONAL LOOK */}
                <div className="border-[2px] border-black border-solid w-full h-full flex flex-col bg-white">

                    {/* ROW 1: HEADER (LR, DATE, PAYMENT) */}
                    <div className="flex border-b-[2px] border-black border-solid items-center h-[20%] shrink-0 px-2 bg-gray-50/50">
                        <div className="w-[35%] flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase leading-tight">L.R. Number</span>
                            <span className="text-2xl font-black tracking-widest leading-none mt-0.5">{booking.lrNumber}</span>
                        </div>
                        <div className="w-[30%] flex justify-center items-center">
                            <span className="text-[14px] font-black uppercase border-[2px] border-black border-solid px-4 py-0.5 rounded-sm tracking-widest bg-white">
                                {booking.paymentType}
                            </span>
                        </div>
                        <div className="w-[35%] flex flex-col justify-center items-end text-right">
                            <span className="text-[10px] font-black uppercase leading-tight">Booking Date</span>
                            <span className="text-[13px] font-bold leading-none mt-0.5">
                                {new Date(booking.date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>

                    {/* ROW 2: PARTIES & ROUTING */}
                    <div className="flex border-b-[2px] border-black border-solid h-[45%] shrink-0">

                        {/* CONSIGNOR (SENDER) */}
                        <div className="w-[33.33%] border-r-[2px] border-black border-solid p-1.5 flex flex-col relative overflow-hidden">
                            <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 inline-block w-max rounded-sm mb-1 leading-none">CONSIGNOR (SENDER)</span>
                            <span className="text-[13px] font-black uppercase truncate leading-tight mt-0.5">{booking.sender.name}</span>
                            <span className="text-[12px] font-bold font-mono tracking-tight mt-auto">✆ +91 {booking.sender.mobile}</span>
                        </div>

                        {/* CONSIGNEE (RECEIVER) */}
                        <div className="w-[33.33%] border-r-[2px] border-black border-solid p-1.5 flex flex-col relative overflow-hidden">
                            <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 inline-block w-max rounded-sm mb-1 leading-none">CONSIGNEE (RECEIVER)</span>
                            <span className="text-[13px] font-black uppercase truncate leading-tight mt-0.5">{booking.receiver.name}</span>
                            <span className="text-[12px] font-bold font-mono tracking-tight mt-auto">✆ +91 {booking.receiver.mobile}</span>
                        </div>

                        {/* ROUTING (FROM -> TO) */}
                        <div className="w-[33.33%] flex flex-col overflow-hidden">
                            <div className="h-1/2 border-b border-black border-dotted px-1.5 py-1 flex flex-col justify-center bg-gray-50/30">
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-black uppercase opacity-70 w-8">FROM:</span>
                                    <span className="text-[12px] font-black uppercase truncate">{fromBranchName?.replace("Branch", "").trim() || 'Head Office'}</span>
                                </div>
                                <div className="pl-9 text-[9px] leading-tight text-gray-700 font-medium flex flex-col">
                                    {fromBranchDetails?.address && <span className="line-clamp-1">{fromBranchDetails.address}</span>}
                                    {fromBranchDetails?.phone && <span className="font-bold text-black text-[10px] mt-0.5">✆ {fromBranchDetails.phone}</span>}
                                </div>
                            </div>
                            <div className="h-1/2 px-1.5 py-1 flex flex-col justify-center">
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-black uppercase opacity-70 w-8">TO:</span>
                                    <span className="text-[12px] font-black uppercase truncate">{toBranchName?.replace("Branch", "").trim()}</span>
                                </div>
                                <div className="pl-9 text-[9px] leading-tight text-gray-700 font-medium flex flex-col">
                                    {toBranchDetails?.address && <span className="line-clamp-1">{toBranchDetails.address}</span>}
                                    {toBranchDetails?.phone && <span className="font-bold text-black text-[10px] mt-0.5">✆ {toBranchDetails.phone}</span>}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ROW 3: ITEMS AND FINANCIALS */}
                    <div className="flex flex-1 min-h-0 bg-white">

                        {/* PARCELS */}
                        <div className="w-[66.66%] border-r-[2px] border-black border-solid flex flex-col relative">
                            <div className="flex border-b-[2px] border-black border-solid text-[9px] font-black bg-gray-100">
                                <div className="w-12 text-center border-r-[2px] border-black border-solid py-0.5">QTY</div>
                                <div className="flex-1 px-2 py-0.5">DESCRIPTION (ITEM DETAILS)</div>
                            </div>
                            <div className="flex-1 overflow-hidden px-1 py-0.5">
                                {booking.parcels.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex text-[11px] items-center mb-0.5">
                                        <div className="w-11 text-center font-black pr-1">{p.quantity}</div>
                                        <div className="flex-1 px-2 truncate font-bold font-mono tracking-tighter uppercase">{p.itemType}</div>
                                    </div>
                                ))}
                                {booking.parcels.length > 3 && (
                                    <div className="text-[10px] font-bold italic text-gray-600 px-2">+ {booking.parcels.length - 3} more items...</div>
                                )}
                            </div>
                            {booking.remarks && (
                                <div className="text-[10px] border-t border-black border-dashed p-1 truncate flex items-center shrink-0 font-bold bg-white z-10">
                                    <span className="mr-1 underline">Remarks:</span> {booking.remarks}
                                </div>
                            )}
                        </div>

                        {/* FINANCIALS */}
                        <div className="w-[33.33%] flex flex-col text-[11px] font-bold p-1 shrink-0 relative">
                            <div className="flex justify-between items-center bg-gray-50 px-1"><span className="opacity-70">Freight</span> <span className="font-mono">{(booking.costs.freight || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between items-center px-1"><span className="opacity-70">Handling</span> <span className="font-mono">{(booking.costs.handling || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between items-center bg-gray-50 px-1"><span className="opacity-70">Hamali</span> <span className="font-mono">{(booking.costs.hamali || 0).toFixed(2)}</span></div>

                            <div className="absolute bottom-0 left-0 right-0 border-t-[2px] border-black border-solid p-1 flex justify-between items-end bg-gray-100">
                                <span className="text-[10px] font-black uppercase mb-[1px]">Total ₹</span>
                                <span className="text-[18px] font-black leading-none">{(booking.costs.total || 0).toFixed(2)}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
