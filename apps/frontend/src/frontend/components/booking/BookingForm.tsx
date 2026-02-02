"use client";

import { useState } from "react";
import { User, Phone, MapPin, Star } from "lucide-react";
import { BranchObj } from "@/frontend/hooks/useBranches";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

interface ContactFormProps {
    title: string;
    type: "sender" | "receiver";
    values: { name: string; mobile: string };
    onChange: (field: string, value: string) => void;
    onNext?: () => void;
    disabled?: boolean;
    branch?: string;
    onBranchChange?: (branchId: string) => void;
    branchLabel?: string;
    availableBranches?: BranchObj[];
    inputRef?: React.Ref<HTMLInputElement>;
}

const MOCK_SUGGESTIONS = [
    "Raj Traders",
    "Shiv Textiles",
    "A1 Services",
    "Om Logistics",
    "Metro Distributors"
];

export function BookingForm({
    title,
    type,
    values,
    onChange,
    onNext,
    disabled,
    branch,
    onBranchChange,
    branchLabel,
    availableBranches,
    inputRef
}: ContactFormProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const isFrequent = MOCK_SUGGESTIONS.includes(values.name);

    const handleNameChange = (val: string) => {
        onChange("name", val);
        setShowSuggestions(val.length > 0);
    };

    const selectSuggestion = (name: string) => {
        onChange("name", name);
        setShowSuggestions(false);
    };

    const handleMobileChange = (val: string) => {
        // Only allow numbers
        const numericVal = val.replace(/\D/g, "");
        // Limit to 10 digits
        if (numericVal.length <= 10) {
            onChange("mobile", numericVal);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: "name" | "mobile") => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (field === "name") {
                const mobileInput = e.currentTarget.closest('div')?.parentElement?.parentElement?.querySelector('input[type="tel"]') as HTMLInputElement;
                mobileInput?.focus();
            } else if (field === "mobile") {
                onNext?.();
            }
        }
    };

    return (
        <div className={`bg-card text-card-foreground p-5 rounded-[24px] border-2 ${isFrequent ? 'border-green-500/30 bg-green-50/10' : 'border-slate-100'} shadow-sm relative hover:shadow-xl transition-all flex flex-col group focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5`}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isFrequent ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {title}
                        </h3>
                        {isFrequent && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                                <Star size={10} className="fill-green-600" /> Frequent Customer
                            </span>
                        )}
                    </div>
                </div>

                {branch && onBranchChange && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm group-hover:border-blue-200 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">{branchLabel || "Branch"}:</span>
                        <select
                            value={branch}
                            disabled={disabled}
                            onChange={(e) => onBranchChange(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer focus:ring-0 border-none p-0 min-w-[100px]"
                        >
                            {availableBranches?.length ? availableBranches.map((b, index) => {
                                const id = typeof b === 'string' ? b : (b._id || (b as any).id || index);
                                const name = typeof b === 'string' ? b : b.name;
                                return <option key={id} value={id}>{name}</option>;
                            }) : (
                                <option value="" disabled>Loading...</option>
                            )}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Input */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name / Company</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            id={`${type}-name`}
                            data-focus={`${type}-name`}
                            ref={inputRef}
                            value={values.name}
                            disabled={disabled}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, "name")}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="h-12 text-base font-bold bg-slate-50 border-transparent focus:bg-white transition-all rounded-xl"
                            placeholder="Type name..."
                        />
                        {showSuggestions && !disabled && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                                {MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(values.name.toLowerCase())).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</Label>
                    <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                            <Phone size={16} />
                        </div>
                        <Input
                            type="tel"
                            id={`${type}-mobile`}
                            data-focus={`${type}-mobile`}
                            value={values.mobile}
                            disabled={disabled}
                            onKeyDown={(e) => handleKeyDown(e, "mobile")}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            className="h-12 pl-12 text-base font-mono font-bold bg-slate-50 border-transparent focus:bg-white transition-all rounded-xl"
                            placeholder="00000 00000"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
