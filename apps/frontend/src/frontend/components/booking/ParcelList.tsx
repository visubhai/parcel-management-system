"use client";

import { Plus, Trash2, Package } from "lucide-react";
import { ItemType, Parcel } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

interface ParcelListProps {
    parcels: Parcel[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof Parcel, value: any) => void;
    onNext?: () => void;
    disabled?: boolean;
}

const ITEM_CATEGORIES = [
    "BLACK PARCEL", "WHITE PARCEL", "RED PARCEL", "GREEN PARCEL", "KHAKHI PARCEL", "COLORING PARCEL", "YELLOW PARCEL",
    "KHAKHI BOX", "WHITE BOX", "BLACK BOX", "WHITE KANTAN BOX", "GREEN KANTAN BOX", "COLORING BOX",
    "WHITE KANTAN", "BLACK KANTAN", "KHAKHI KANTAN", "YELLOW KANTAN", "RED KANTAN", "GREEN KANTAN", "COLORING KANTAN",
    "KHAKHI COVER", "WHITE COVER", "GREEN COVER", "COLORING COVER",
    "THELI", "COLORING THELI", "WHITE THELI",
    "ROLL", "DABBA", "PETI", "ACTIVA", "BIKE", "PAIPE", "OTHER"
];

export function ParcelList({ parcels, onAdd, onRemove, onChange, onNext, disabled }: ParcelListProps) {
    const handleKeyDown = (e: React.KeyboardEvent, field: keyof Parcel, index: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const row = e.currentTarget.closest('.grid');
            if (!row) return;

            if (field === "quantity") {
                const select = row.querySelector('select') as HTMLSelectElement;
                select?.focus();
            } else if (field === "itemType") {
                const rateInput = row.querySelector('input[type="number"]:not([min="1"])') as HTMLInputElement;
                rateInput?.focus();
            } else if (field === "rate") {
                if (index === parcels.length - 1) {
                    onNext?.(); // Usually adds a new row or moves to payment
                } else {
                    // Move to next row's quantity
                    const nextRow = row.nextElementSibling;
                    const nextQty = nextRow?.querySelector('input[type="number"][min="1"]') as HTMLInputElement;
                    nextQty?.focus();
                }
            }
        }
    };

    return (
        <Card className="hover:shadow-xl transition-all border-slate-100 shadow-sm rounded-[24px] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-5 bg-slate-50/50 px-6 border-b border-slate-100">
                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" /> Parcel Details
                </CardTitle>
                <Button
                    onClick={onAdd}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className="gap-2 font-black text-[10px] tracking-widest border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all rounded-xl h-9"
                >
                    <Plus className="w-3.5 h-3.5" /> ADD ROW
                </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
                {parcels.map((parcel, index) => (
                    <div key={parcel.id || (parcel as any)._id || index} className="grid grid-cols-12 gap-5 items-end bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                        {/* Quantity */}
                        <div className="col-span-2 space-y-2 text-center">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Qty</Label>
                            <Input
                                type="number"
                                min="1"
                                id={`parcel-qty-${index}`}
                                data-focus="parcel-qty"
                                value={parcel.quantity}
                                disabled={disabled}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => handleKeyDown(e, "quantity", index)}
                                onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                className="font-black text-center h-12 bg-white border-transparent shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all text-lg"
                            />
                        </div>

                        {/* Item Type */}
                        <div className="col-span-5 space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Category</Label>
                            <select
                                id={`parcel-type-${index}`}
                                data-focus="parcel-type"
                                value={parcel.itemType}
                                disabled={disabled}
                                onKeyDown={(e) => handleKeyDown(e, "itemType", index)}
                                onChange={(e) => onChange(parcel.id, "itemType", e.target.value as ItemType)}
                                className="flex h-12 w-full rounded-xl border border-transparent bg-white px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50 font-bold transition-all appearance-none"
                            >
                                <option value="" disabled>Select Item</option>
                                {ITEM_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rate */}
                        <div className="col-span-3 space-y-2 group/rate">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/rate:text-blue-500">Rate (₹)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                <Input
                                    type="number"
                                    min="0"
                                    id={`parcel-rate-${index}`}
                                    data-focus="parcel-rate"
                                    value={parcel.rate}
                                    disabled={disabled}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => handleKeyDown(e, "rate", index)}
                                    onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                    className="pl-7 font-mono font-black text-right h-12 bg-white border-transparent shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all text-lg"
                                />
                            </div>
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-2 flex justify-end pb-1 pr-1">
                            {parcels.length > 1 && (
                                <Button
                                    onClick={() => onRemove(parcel.id)}
                                    disabled={disabled}
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Remove Row"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {parcels.length > 0 && (
                    <div className="pt-2 px-2 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                        <span>Total Items: {parcels.length}</span>
                        <span className="animate-pulse">Tip: Press ENTER to Navigate Fields</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
