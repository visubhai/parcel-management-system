"use client";

import { Plus, Trash2, Camera } from "lucide-react";
import { ItemType, Parcel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ParcelListProps {
    parcels: Parcel[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof Parcel, value: any) => void;
    disabled?: boolean;
}

export function ParcelList({ parcels, onAdd, onRemove, onChange, disabled }: ParcelListProps) {
    return (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-lg shadow-slate-200/40 mt-4 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    📦 Parcel Details
                </h3>
                <button
                    onClick={onAdd}
                    disabled={disabled}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                >
                    <Plus className="w-3.5 h-3.5" /> ADD ROW
                </button>
            </div>

            <div className="space-y-4">
                {parcels.map((parcel, index) => (
                    <div key={parcel.id} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                        {/* Quantity */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Qty</label>
                            <input
                                type="number"
                                min="1"
                                value={parcel.quantity}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 text-center"
                            />
                        </div>

                        {/* Item Type - Expanded to 6 cols */}
                        <div className="col-span-6">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Type</label>
                            <select
                                value={parcel.itemType}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "itemType", e.target.value as ItemType)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 bg-white"
                            >
                                <option value="White Sack">White Sack</option>
                                <option value="Carton">Carton</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>

                        {/* Rate */}
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Rate</label>
                            <input
                                type="number"
                                min="0"
                                value={parcel.rate}
                                disabled={disabled}
                                onChange={(e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 text-right"
                            />
                        </div>



                        {/* Remove Button */}
                        <div className="col-span-2 flex justify-end pb-2">
                            {parcels.length > 1 && (
                                <button
                                    onClick={() => onRemove(parcel.id)}
                                    disabled={disabled}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                    title="Remove Row"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
