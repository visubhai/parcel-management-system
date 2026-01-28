"use client";

import { useState } from "react";
import { Branch } from "@/lib/types";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactFormProps {
    title: string;
    type: "sender" | "receiver";
    values: { name: string; mobile: string };
    onChange: (field: string, value: string) => void;
    disabled?: boolean;
    // New Props for Branch Selection
    // New Props for Branch Selection
    branch?: Branch;
    onBranchChange?: (branch: Branch) => void;
    branchLabel?: string;
    availableBranches?: Branch[];
}

const MOCK_SUGGESTIONS = [
    "Raj Traders",
    "Shiv Textiles",
    "A1 Services",
    "Om Logistics",
    "Metro Distributors"
];

export function BookingForm({ title, type, values, onChange, disabled, branch, onBranchChange, branchLabel, availableBranches }: ContactFormProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleNameChange = (val: string) => {
        onChange("name", val);
        setShowSuggestions(val.length > 0);
    };

    const selectSuggestion = (name: string) => {
        onChange("name", name);
        setShowSuggestions(false);
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-lg shadow-slate-200/40 relative hover:shadow-xl transition-all flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> {title}
                </h3>

                {branch && onBranchChange && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 hidden sm:inline">{branchLabel || "Branch"}:</span>
                        <select
                            value={branch}
                            disabled={disabled}
                            onChange={(e) => onBranchChange(e.target.value as Branch)}
                            className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer focus:ring-0 border-none p-0 w-24"
                        >
                            {availableBranches ? availableBranches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            )) : (
                                <>
                                    <option value="Branch A">Branch A</option>
                                    <option value="Branch B">Branch B</option>
                                </>
                            )}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Name Input with Autocomplete */}
                <div className="relative">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Name / Company</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={values.name}
                            disabled={disabled}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="w-full pl-3 pr-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="Rahul Transport Services"
                        />
                        {showSuggestions && !disabled && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-auto">
                                {MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(values.name.toLowerCase())).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Mobile</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={values.mobile}
                            disabled={disabled}
                            onChange={(e) => onChange("mobile", e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="9876543210"
                        />
                    </div>
                </div>


            </div>
        </div>
    );
}
