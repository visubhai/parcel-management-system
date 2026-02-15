"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { User, Phone, MapPin, Star } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
const MOCK_SUGGESTIONS = [
    "Raj Traders",
    "Shiv Textiles",
    "A1 Services",
    "Om Logistics",
    "Metro Distributors"
];
export function BookingForm({ title, type, values, onChange, onNext, disabled, branch, onBranchChange, branchLabel, availableBranches, inputRef, variant = 'default' }) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const isFrequent = MOCK_SUGGESTIONS.includes(values.name);
    const handleNameChange = (val) => {
        onChange("name", val);
        setShowSuggestions(val.length > 0);
    };
    const selectSuggestion = (name) => {
        onChange("name", name);
        setShowSuggestions(false);
    };
    const handleMobileChange = (val) => {
        // Only allow numbers
        const numericVal = val.replace(/\D/g, "");
        // Limit to exactly 10 digits
        if (numericVal.length <= 10) {
            onChange("mobile", numericVal);
        }
    };
    const handleKeyDown = (e, field) => {
        var _a, _b, _c;
        if (e.key === "Enter") {
            e.preventDefault();
            if (field === "name") {
                const mobileInput = (_c = (_b = (_a = e.currentTarget.closest('div')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.querySelector('input[type="tel"]');
                mobileInput === null || mobileInput === void 0 ? void 0 : mobileInput.focus();
            }
            else if (field === "mobile") {
                onNext === null || onNext === void 0 ? void 0 : onNext();
            }
        }
    };
    const containerClasses = variant === 'minimal'
        ? "bg-transparent border-0 p-0 shadow-none hover:shadow-none"
        : `bg-card text-card-foreground p-5 rounded-[24px] border-2 ${isFrequent ? 'border-green-500/30 bg-green-50/10' : 'border-slate-100'} shadow-sm relative hover:shadow-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5`;
    return (_jsxs("div", { className: `flex flex-col group ${containerClasses}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${isFrequent ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`, children: _jsx(User, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]", children: title }), isFrequent && (_jsxs("span", { className: "flex items-center gap-1 text-[10px] font-black text-green-600 uppercase", children: [_jsx(Star, { size: 10, className: "fill-green-600" }), " Frequent Customer"] }))] })] }), branch && onBranchChange && (_jsxs("div", { className: "flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm group-hover:border-blue-200 transition-colors", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-500" }), _jsxs("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: [branchLabel || "Branch", ":"] }), _jsx("select", { value: branch, disabled: disabled, onChange: (e) => onBranchChange(e.target.value), className: "bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer focus:ring-0 border-none p-0 min-w-[100px]", children: (availableBranches === null || availableBranches === void 0 ? void 0 : availableBranches.length) ? availableBranches.map((b, index) => {
                                    const id = typeof b === 'string' ? b : (b._id || b.id || index);
                                    const name = typeof b === 'string' ? b : b.name;
                                    return _jsx("option", { value: id, children: name }, id);
                                }) : (_jsx("option", { value: "", disabled: true, children: "Loading..." })) })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Name / Company" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { type: "text", id: `${type}-name`, "data-focus": `${type}-name`, ref: inputRef, value: values.name, disabled: disabled, onChange: (e) => handleNameChange(e.target.value), onKeyDown: (e) => handleKeyDown(e, "name"), onBlur: () => setTimeout(() => setShowSuggestions(false), 200), className: "h-12 text-base font-bold bg-slate-50 border-transparent focus:bg-white transition-all rounded-xl w-full", placeholder: "Type name..." }), showSuggestions && !disabled && (_jsx("div", { className: "absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95", children: MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(values.name.toLowerCase())).map((s) => (_jsx("button", { type: "button", onClick: () => selectSuggestion(s), className: "w-full text-left px-4 py-3 text-sm font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0", children: s }, s))) }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Mobile Contact" }), _jsxs("div", { className: "relative group/input w-full", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors pointer-events-none", children: _jsx(Phone, { size: 16 }) }), _jsx(Input, { type: "tel", id: `${type}-mobile`, "data-focus": `${type}-mobile`, value: values.mobile, disabled: disabled, onKeyDown: (e) => handleKeyDown(e, "mobile"), onChange: (e) => handleMobileChange(e.target.value), className: "h-12 pl-12 text-base font-bold bg-slate-50 border-transparent focus:bg-white transition-all rounded-xl w-full", placeholder: "00000 00000" })] })] })] })] }));
}
