"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { SingleSelect } from "@/frontend/components/ui/single-select-dropdown";
const ITEM_CATEGORIES = [
    "BLACK PARCEL", "WHITE PARCEL", "RED PARCEL", "GREEN PARCEL", "KHAKHI PARCEL", "COLORING PARCEL", "YELLOW PARCEL",
    "KHAKHI BOX", "WHITE BOX", "BLACK BOX", "WHITE KANTAN BOX", "GREEN KANTAN BOX", "COLORING BOX",
    "WHITE KANTAN", "BLACK KANTAN", "KHAKHI KANTAN", "YELLOW KANTAN", "RED KANTAN", "GREEN KANTAN", "COLORING KANTAN",
    "KHAKHI COVER", "WHITE COVER", "GREEN COVER", "COLORING COVER",
    "THELI", "COLORING THELI", "WHITE THELI",
    "ROLL", "DABBA", "PETI", "ACTIVA", "BIKE", "PAIPE", "OTHER"
];
const ITEM_CATEGORY_OPTIONS = ITEM_CATEGORIES.map(cat => ({ label: cat, value: cat }));
export function ParcelList({ parcels, onAdd, onRemove, onChange, onNext, disabled }) {
    const handleKeyDown = (e, field, index) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const row = e.currentTarget.closest('.grid');
            if (!row)
                return;
            if (field === "quantity") {
                const itemSelectBtn = document.getElementById(`parcel-type-${index}`);
                itemSelectBtn === null || itemSelectBtn === void 0 ? void 0 : itemSelectBtn.focus();
            }
            else if (field === "itemType") {
                const rateInput = row.querySelector('input[type="number"]:not([min="1"])');
                rateInput === null || rateInput === void 0 ? void 0 : rateInput.focus();
            }
            else if (field === "rate") {
                if (index === parcels.length - 1) {
                    onNext === null || onNext === void 0 ? void 0 : onNext(); // Usually adds a new row or moves to payment
                }
                else {
                    // Move to next row's quantity
                    const nextRow = row.nextElementSibling;
                    const nextQty = nextRow === null || nextRow === void 0 ? void 0 : nextRow.querySelector('input[type="number"][min="1"]');
                    nextQty === null || nextQty === void 0 ? void 0 : nextQty.focus();
                }
            }
        }
    };
    return (_jsxs(Card, { className: "hover:shadow-xl transition-all border-slate-100 shadow-sm rounded-[24px]", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between py-5 bg-slate-50/50 px-6 border-b border-slate-100 rounded-t-[24px]", children: [_jsxs(CardTitle, { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2", children: [_jsx(Package, { className: "w-4 h-4 text-blue-500" }), " Parcel Details"] }), _jsxs(Button, { onClick: onAdd, disabled: disabled, variant: "outline", size: "sm", className: "gap-2 font-black text-[10px] tracking-widest border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all rounded-xl h-9", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), " ADD ROW"] })] }), _jsxs(CardContent, { className: "p-6 space-y-4", children: [parcels.map((parcel, index) => (_jsxs("div", { className: "grid grid-cols-12 gap-x-4 gap-y-4 md:gap-5 items-end bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all group", children: [_jsxs("div", { className: "col-span-3 md:col-span-2 space-y-2 text-center", children: [_jsx(Label, { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block", children: "Qty" }), _jsx(Input, { type: "number", min: "1", id: `parcel-qty-${index}`, "data-focus": "parcel-qty", value: parcel.quantity, disabled: disabled, onFocus: (e) => e.target.select(), onKeyDown: (e) => handleKeyDown(e, "quantity", index), onChange: (e) => onChange(parcel.id, "quantity", parseInt(e.target.value) || 0), className: "font-black text-center h-12 bg-white border-transparent shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all text-lg" })] }), _jsxs("div", { className: "col-span-9 md:col-span-5 space-y-2", children: [_jsx(Label, { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Item Category" }), _jsx(SingleSelect, { id: `parcel-type-${index}`, value: parcel.itemType, options: ITEM_CATEGORY_OPTIONS, onChange: (val) => {
                                            onChange(parcel.id, "itemType", val);
                                            // Auto-focus rate after selection for speed
                                            setTimeout(() => {
                                                const rateInput = document.getElementById(`parcel-rate-${index}`);
                                                rateInput === null || rateInput === void 0 ? void 0 : rateInput.focus();
                                                rateInput === null || rateInput === void 0 ? void 0 : rateInput.select();
                                            }, 10);
                                        }, disabled: disabled, placeholder: "Select Item", className: "h-12 border-transparent bg-white shadow-sm font-black text-lg" })] }), _jsxs("div", { className: "col-span-9 md:col-span-3 space-y-2 group/rate", children: [_jsx(Label, { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within/rate:text-blue-500", children: "Rate (\u20B9)" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm", children: "\u20B9" }), _jsx(Input, { type: "number", min: "0", id: `parcel-rate-${index}`, "data-focus": "parcel-rate", value: parcel.rate, disabled: disabled, onFocus: (e) => e.target.select(), onKeyDown: (e) => handleKeyDown(e, "rate", index), onChange: (e) => onChange(parcel.id, "rate", parseFloat(e.target.value) || 0), className: "pl-7 font-mono font-black text-right h-12 bg-white border-transparent shadow-sm rounded-xl focus:ring-4 focus:ring-blue-500/5 transition-all text-lg" })] })] }), _jsx("div", { className: "col-span-3 md:col-span-2 flex justify-end pb-1 pr-1", children: parcels.length > 1 && (_jsx(Button, { onClick: () => onRemove(parcel.id), disabled: disabled, variant: "ghost", size: "icon", className: "h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all", title: "Remove Row", children: _jsx(Trash2, { className: "w-5 h-5" }) })) })] }, parcel.id || parcel._id || index))), parcels.length > 0 && (_jsxs("div", { className: "pt-2 px-2 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]", children: [_jsxs("span", { children: ["Total Items: ", parcels.length] }), _jsx("span", { className: "animate-pulse", children: "Tip: Press ENTER to Navigate Fields" })] }))] })] }));
}
