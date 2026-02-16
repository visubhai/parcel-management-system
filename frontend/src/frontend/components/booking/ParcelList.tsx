"use client";

import { Package, Plus, Trash2, Layers, ShoppingBag } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Parcel } from "@/shared/types";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { SingleSelect } from "@/frontend/components/ui/single-select-dropdown";

interface ParcelListProps {
    parcels: Parcel[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof Parcel, value: any) => void;
    onNext?: () => void;
    disabled?: boolean;
    remarks?: string;
    onRemarksChange?: (val: string) => void;
    variant?: 'default' | 'enterprise' | 'fintech' | 'modern';
}

const ITEM_CATEGORIES = [
    "BLACK PARCEL", "WHITE PARCEL", "RED PARCEL", "GREEN PARCEL", "KHAKHI PARCEL", "COLORING PARCEL", "YELLOW PARCEL",
    "KHAKHI BOX", "WHITE BOX", "BLACK BOX", "WHITE KANTAN BOX", "GREEN KANTAN BOX", "COLORING BOX",
    "WHITE KANTAN", "BLACK KANTAN", "KHAKHI KANTAN", "YELLOW KANTAN", "RED KANTAN", "GREEN KANTAN", "COLORING KANTAN",
    "KHAKHI COVER", "WHITE COVER", "GREEN COVER", "COLORING COVER",
    "THELI", "COLORING THELI", "WHITE THELI",
    "ROLL", "DABBA", "PETI", "ACTIVA", "BIKE", "PAIPE", "OTHER"
];

const ITEM_CATEGORY_OPTIONS = ITEM_CATEGORIES.map(cat => ({ label: cat, value: cat }));

export function ParcelList({
    parcels,
    onAdd,
    onRemove,
    onChange,
    onNext,
    disabled,
    remarks,
    onRemarksChange,
    variant = 'default'
}: ParcelListProps) {
    const parcel = parcels[0] || { quantity: 1, itemType: "OTHER", rate: 0 };
    const parcelId = parcel.id || (parcel as any)._id || 'default';

    const handleKeyDown = (e: React.KeyboardEvent, field: string, index: number = 0) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (field === "quantity") {
                document.getElementById(`parcel-rate-0`)?.focus();
            } else if (field === "rate") {
                document.getElementById(`remarks-input`)?.focus();
            } else if (field === "remarks") {
                onNext?.();
            }
        }
    };

    if (variant === 'enterprise') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} className="text-slate-500" />
                        Parcel Manifest
                    </h3>
                    <Button
                        onClick={onAdd}
                        disabled={disabled}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold"
                    >
                        <Plus className="w-3 h-3" /> Add Item
                    </Button>
                </div>

                <div className="border border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm flex-1 flex flex-col">
                    {/* Header Row */}
                    <div className="flex bg-slate-100 border-b border-slate-300 text-[11px] font-black text-slate-700 uppercase tracking-wider h-9 items-center w-full">
                        <div className="w-[15%] text-center border-r border-slate-300 h-full flex items-center justify-center">Qty</div>
                        <div className="w-[60%] px-3 border-r border-slate-300 h-full flex items-center">Item Description</div>
                        <div className="w-[25%] px-3 text-right h-full flex items-center justify-end">Rate (₹)</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-200 bg-white">
                        {parcels.map((parcel, index) => (
                            <div key={parcel.id || (parcel as any)._id || index} className="flex group hover:bg-sky-50 transition-colors h-10 items-center w-full relative">
                                <div className="w-[15%] border-r border-slate-300 h-full p-0">
                                    <input
                                        type="number"
                                        min="1"
                                        id={`parcel-qty-${index}`}
                                        value={parcel.quantity}
                                        disabled={disabled}
                                        onFocus={(e) => e.target.select()}
                                        onKeyDown={(e) => handleKeyDown(e, "quantity", index)}
                                        onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                        className="w-full h-full text-center font-mono font-bold text-slate-900 bg-transparent focus:bg-sky-100 outline-none text-sm p-0 m-0 border-none focus:ring-inset focus:ring-2 focus:ring-blue-500 rounded-none transition-all"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="w-[60%] border-r border-slate-300 h-full p-0 relative">
                                    <SingleSelect
                                        id={`parcel-type-${index}`}
                                        value={parcel.itemType}
                                        options={ITEM_CATEGORY_OPTIONS}
                                        onChange={(val) => {
                                            onChange(parcel.id, "itemType", val);
                                            setTimeout(() => {
                                                const rateInput = document.getElementById(`parcel-rate-${index}`) as HTMLInputElement;
                                                rateInput?.focus();
                                                rateInput?.select();
                                            }, 10);
                                        }}
                                        disabled={disabled}
                                        placeholder="Select Item"
                                        className="h-full border-none font-bold text-slate-800 text-sm w-full shadow-none bg-transparent focus:bg-sky-100 rounded-none px-3 transition-all"
                                    />
                                </div>
                                <div className="w-[25%] h-full p-0 relative">
                                    <div className="relative h-full">
                                        <input
                                            type="number"
                                            min="0"
                                            id={`parcel-rate-${index}`}
                                            value={parcel.rate}
                                            disabled={disabled}
                                            onFocus={(e) => e.target.select()}
                                            onKeyDown={(e) => handleKeyDown(e, "rate", index)}
                                            onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                            className="w-full h-full text-right pr-3 font-mono font-bold text-slate-900 bg-transparent focus:bg-sky-100 outline-none text-sm p-0 m-0 border-none focus:ring-inset focus:ring-2 focus:ring-blue-500 rounded-none transition-all"
                                            autoComplete="off"
                                        />
                                    </div>

                                    {parcels.length > 1 && (
                                        <button
                                            onClick={() => onRemove(parcel.id)}
                                            disabled={disabled}
                                            className="absolute right-0 top-0 bottom-0 text-slate-300 hover:text-red-600 hover:bg-red-50 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                                            tabIndex={-1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {parcels.length > 0 && (
                    <div className="mt-1.5 flex justify-end">
                        <div className="bg-slate-100 px-3 py-1 rounded text-[10px] text-slate-500 font-bold uppercase tracking-wider border border-slate-200">
                            Count: {parcels.length}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'fintech') {
        const totalQty = parcels.reduce((acc, p) => acc + p.quantity, 0);
        const totalAmount = parcels.reduce((acc, p) => acc + (p.quantity * p.rate), 0);

        return (
            <div className="h-full flex flex-col space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-0 border-b border-slate-200 pb-2 px-2">
                    <div className="col-span-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qty</div>
                    <div className="col-span-7 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</div>
                    <div className="col-span-3 text-right pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</div>
                </div>

                <div className="space-y-2">
                    {parcels.map((parcel, index) => (
                        <div key={parcel.id || (parcel as any)._id || index} className="fintech-row grid grid-cols-12 gap-3 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group relative">
                            {/* Qty */}
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    min="1"
                                    id={`parcel-qty-${index}`}
                                    value={parcel.quantity}
                                    disabled={disabled}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKeyDown(e, "quantity", index)}
                                    onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                    className="w-full h-10 text-center font-bold text-slate-900 bg-slate-50 focus:bg-white border focus:border-blue-500 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Item */}
                            <div className="col-span-7">
                                <SingleSelect
                                    id={`parcel-type-${index}`}
                                    value={parcel.itemType}
                                    options={ITEM_CATEGORY_OPTIONS}
                                    onChange={(val) => {
                                        onChange(parcel.id, "itemType", val);
                                        setTimeout(() => {
                                            const rateInput = document.getElementById(`parcel-rate-${index}`) as HTMLInputElement;
                                            rateInput?.focus();
                                            rateInput?.select();
                                        }, 10);
                                    }}
                                    disabled={disabled}
                                    placeholder="Select Item"
                                    className="h-10 border bg-slate-50 focus:bg-white font-bold text-slate-800 text-sm w-full shadow-none rounded-md px-3 transition-colors focus:border-blue-500"
                                />
                            </div>

                            {/* Rate */}
                            <div className="col-span-3 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    id={`parcel-rate-${index}`}
                                    value={parcel.rate}
                                    disabled={disabled}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKeyDown(e, "rate", index)}
                                    onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                    className="w-full h-10 text-right pr-4 pl-6 font-bold text-slate-900 bg-slate-50 focus:bg-white border focus:border-blue-500 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg font-mono"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Floating Delete - visible on hover */}
                            {parcels.length > 1 && (
                                <button
                                    onClick={() => onRemove(parcel.id)}
                                    disabled={disabled}
                                    className="absolute -right-3 -top-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                    tabIndex={-1}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer / Add Button */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4 text-xs font-bold text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded">Qty: {totalQty}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Total: ₹{totalAmount}</span>
                    </div>
                    <Button
                        onClick={onAdd}
                        disabled={disabled}
                        size="sm"
                        className="h-8 bg-slate-800 text-white hover:bg-slate-700 font-bold uppercase tracking-wider text-[10px] gap-2 rounded-md shadow-md shadow-slate-200"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Row
                    </Button>
                </div>
            </div>
        )
    }

    if (variant === 'modern') {
        return (
            <div className="h-full flex flex-col space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-2">
                    <div className="col-span-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1"><Layers size={10} /> Qty</div>
                    <div className="col-span-7 pl-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><ShoppingBag size={10} /> Item Description</div>
                    <div className="col-span-3 text-right pr-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate (₹)</div>
                </div>

                <div className="space-y-3">
                    {parcels.map((parcel, index) => (
                        <div key={parcel.id || (parcel as any)._id || index} className="modern-row grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group relative">
                            {/* Qty */}
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    min="1"
                                    id={`parcel-qty-${index}`}
                                    value={parcel.quantity}
                                    disabled={disabled}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKeyDown(e, "quantity", index)}
                                    onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                    className="w-full h-10 text-center font-bold text-slate-700 bg-slate-50 focus:bg-white border-0 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Item */}
                            <div className="col-span-7">
                                <SingleSelect
                                    id={`parcel-type-${index}`}
                                    value={parcel.itemType}
                                    options={ITEM_CATEGORY_OPTIONS}
                                    onChange={(val) => {
                                        onChange(parcel.id, "itemType", val);
                                        setTimeout(() => {
                                            const rateInput = document.getElementById(`parcel-rate-${index}`) as HTMLInputElement;
                                            rateInput?.focus();
                                            rateInput?.select();
                                        }, 10);
                                    }}
                                    disabled={disabled}
                                    placeholder="Select Item"
                                    className="h-10 border-0 bg-slate-50 focus:bg-white font-bold text-slate-700 text-sm w-full shadow-none rounded-lg px-3 transition-colors"
                                />
                            </div>

                            {/* Rate */}
                            <div className="col-span-3 relative">
                                <input
                                    type="number"
                                    min="0"
                                    id={`parcel-rate-${index}`}
                                    value={parcel.rate}
                                    disabled={disabled}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKeyDown(e, "rate", index)}
                                    onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                    className="w-full h-10 text-right pr-4 font-bold text-slate-700 bg-slate-50 focus:bg-white border-0 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Floating Delete */}
                            {parcels.length > 1 && (
                                <button
                                    onClick={() => onRemove(parcel.id)}
                                    disabled={disabled}
                                    className="absolute -right-2 -top-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    onClick={onAdd}
                    disabled={disabled}
                    variant="ghost"
                    className="w-full h-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" /> Add Another Item
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all focus-within:border-blue-500/50">
            <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-blue-600" />
                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">
                    PARCEL INFO
                </h3>
            </div>

            <div className="space-y-4">
                {/* Item Description */}
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ITEM DESCRIPTION</Label>
                    <SingleSelect
                        id="parcel-type-0"
                        value={parcel.itemType}
                        options={ITEM_CATEGORY_OPTIONS}
                        onChange={(val) => {
                            onChange(parcelId, "itemType", val);
                            setTimeout(() => document.getElementById('parcel-qty-0')?.focus(), 10);
                        }}
                        disabled={disabled}
                        placeholder="Select Item..."
                        className="h-10 border-gray-200 bg-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Quantity */}
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QUANTITY</Label>
                        <Input
                            type="number"
                            id="parcel-qty-0"
                            value={parcel.quantity}
                            disabled={disabled}
                            onChange={(e) => onChange(parcelId, "quantity", parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => handleKeyDown(e, "quantity")}
                            className="h-9 text-sm font-medium border-gray-200 focus:border-blue-500 rounded-md shadow-none px-3"
                            placeholder="Qty"
                        />
                    </div>

                    {/* Rate */}
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RATE (₹)</Label>
                        <Input
                            type="number"
                            id="parcel-rate-0"
                            value={parcel.rate}
                            disabled={disabled}
                            onChange={(e) => onChange(parcelId, "rate", parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => handleKeyDown(e, "rate")}
                            className="h-9 text-sm font-medium border-gray-200 focus:border-blue-500 rounded-md shadow-none px-3"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">REMARKS / NOTES</Label>
                    <Input
                        type="text"
                        id="remarks-input"
                        value={remarks}
                        disabled={disabled}
                        onChange={(e) => onRemarksChange?.(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "remarks")}
                        className="h-9 text-sm font-medium border-gray-200 focus:border-blue-500 rounded-md shadow-none px-3"
                        placeholder="Optional remarks..."
                    />
                </div>
            </div>
        </div>
    );
}
