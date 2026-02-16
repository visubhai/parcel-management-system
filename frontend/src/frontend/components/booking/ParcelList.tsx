"use client";

import { Package } from "lucide-react";
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
    onChange,
    onNext,
    disabled,
    remarks,
    onRemarksChange
}: ParcelListProps) {
    const parcel = parcels[0] || { quantity: 1, itemType: "OTHER", rate: 0 };
    const parcelId = parcel.id || (parcel as any)._id || 'default';

    const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
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
