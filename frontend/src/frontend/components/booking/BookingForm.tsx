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
    variant?: 'default' | 'minimal' | 'enterprise' | 'modern' | 'fintech';
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
    inputRef,
    variant = 'default'
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
        // Limit to exactly 10 digits
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

    const getContainerClasses = () => {
        if (variant === 'minimal') return "bg-transparent border-0 p-0 shadow-none hover:shadow-none";
        if (variant === 'enterprise') return "bg-transparent p-4 h-full";
        if (variant === 'modern') return "bg-transparent h-full";
        if (variant === 'fintech') return "h-full flex flex-col justify-center";
        return `bg-card text-card-foreground p-5 rounded-[24px] border-2 ${isFrequent ? 'border-green-500/30 bg-green-50/10' : 'border-slate-100'} shadow-sm relative hover:shadow-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5`;
    };

    const getLabelClasses = () => {
        if (variant === 'enterprise') return "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block flex justify-between";
        if (variant === 'modern') return "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1";
        if (variant === 'fintech') return "text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1 block ml-0.5";
        return "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
    }

    const getInputClasses = () => {
        if (variant === 'enterprise') return "h-9 text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-3 transition-all shadow-sm placeholder:text-slate-300 w-full";
        if (variant === 'modern') return "h-11 text-sm font-bold text-slate-800 bg-slate-100/50 border-0 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 transition-all w-full placeholder:text-slate-400 shadow-sm";
        if (variant === 'fintech') return "h-10 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 rounded-lg px-3 transition-all w-full placeholder:text-slate-400 shadow-sm";
        return "h-12 text-base font-bold bg-slate-50 border-transparent focus:bg-white transition-all rounded-xl w-full px-4";
    }

    return (
        <div className={`flex flex-col group ${getContainerClasses()}`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${variant === 'enterprise' || variant === 'fintech' ? 'mb-3' : 'mb-4'}`}>
                <div className="flex items-center gap-2">
                    {variant !== 'enterprise' && variant !== 'modern' && variant !== 'fintech' && (
                        <div className={`p-2 rounded-lg ${isFrequent ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <User className="w-4 h-4" />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {variant === 'enterprise' && <User size={14} className="text-slate-400" />}
                        {variant === 'modern' && (
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${type === 'sender' ? 'bg-indigo-50 text-indigo-600' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                                <User size={12} strokeWidth={2.5} />
                            </div>
                        )}
                        {variant === 'fintech' && (
                            <div className={`w-2 h-2 rounded-full ${type === 'sender' ? 'bg-blue-600 shadow-blue-500/50 shadow-sm' : 'bg-indigo-600 shadow-indigo-500/50 shadow-sm'}`} />
                        )}
                        <h3 className={`${variant === 'enterprise' ? 'text-xs text-slate-800' : variant === 'fintech' ? 'text-xs font-bold text-slate-700 uppercase tracking-widest' : 'text-[10px] text-slate-400'} font-black uppercase tracking-[0.2em]`}>
                            {title}
                        </h3>
                    </div>
                </div>

                {isFrequent && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        <Star size={8} className="fill-green-600" /> Frequent
                    </span>
                )}

                {variant === 'fintech' && (
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer group/chk">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 cursor-pointer" />
                            <span className="text-[10px] font-bold text-slate-400 group-hover/chk:text-blue-600 transition-colors uppercase tracking-wider">Save</span>
                        </label>
                        {type === 'receiver' && (
                            <button
                                type="button"
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded transition-all uppercase tracking-wider"
                                onClick={() => {
                                    // Hacky but works for the visual mockup quickly
                                }}
                            >
                                Copy Sender
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className={`grid ${variant === 'enterprise' ? 'grid-cols-12 gap-3' : 'grid-cols-1 md:grid-cols-12 gap-4'}`}>
                {/* Name Input */}
                <div className={variant === 'enterprise' ? "col-span-12 md:col-span-7 space-y-0" : variant === 'fintech' ? "col-span-12 md:col-span-7 space-y-1" : "col-span-1 space-y-1"}>
                    <Label className={getLabelClasses()}>Name / Company</Label>
                    <div className="relative">
                        <input
                            type="text"
                            id={`${type}-name`}
                            data-focus={`${type}-name`}
                            ref={inputRef}
                            value={values.name}
                            disabled={disabled}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, "name")}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className={getInputClasses()}
                            placeholder={variant === 'fintech' ? "Search or Type Name..." : "Type to search..."}
                            autoComplete="off"
                        />
                        {showSuggestions && !disabled && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 left-0 ring-1 ring-black/5">
                                {MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(values.name.toLowerCase())).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile */}
                <div className={variant === 'enterprise' ? "col-span-12 md:col-span-5 space-y-0" : variant === 'fintech' ? "col-span-12 md:col-span-5 space-y-1 group/mobile" : "col-span-1 space-y-1 group/mobile"}>
                    <Label className={getLabelClasses()}>Mobile Number</Label>
                    <div className="relative w-full">
                        {(variant !== 'enterprise' && variant !== 'modern' && variant !== 'fintech') && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors pointer-events-none">
                                <Phone size={16} />
                            </div>
                        )}
                        <input
                            type="tel"
                            id={`${type}-mobile`}
                            data-focus={`${type}-mobile`}
                            value={values.mobile}
                            disabled={disabled}
                            onKeyDown={(e) => handleKeyDown(e, "mobile")}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            className={variant === 'enterprise' || variant === 'modern' || variant === 'fintech' ? getInputClasses() : `pl-12 ${getInputClasses()}`}
                            placeholder="10 Digits"
                            autoComplete="off"
                        />
                        {variant === 'modern' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within/mobile:text-indigo-500 transition-colors">
                                <Phone size={14} className="opacity-50" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
