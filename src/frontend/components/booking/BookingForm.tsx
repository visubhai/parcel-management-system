"use client";

import { useState } from "react";
import { User, Phone, MapPin } from "lucide-react";
import { BranchObj } from "@/frontend/hooks/useBranches";

interface ContactFormProps {
    title: string;
    type: "sender" | "receiver";
    values: { name: string; mobile: string };
    onChange: (field: string, value: string) => void;
    disabled?: boolean;
    // Props for Branch Selection
    branch?: string; // Branch ID
    onBranchChange?: (branchId: string) => void;
    branchLabel?: string;
    availableBranches?: BranchObj[];
}

const MOCK_SUGGESTIONS = [
    "Raj Traders",
    "Shiv Textiles",
    "A1 Services",
    "Om Logistics",
    "Metro Distributors"
];

import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

// ... (keep MOCK_SUGGESTIONS)

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
        <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-sm relative hover:shadow-md transition-all flex flex-col group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    <User className="w-4 h-4" /> {title}
                </h3>

                {branch && onBranchChange && (
                    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-2 py-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">{branchLabel || "Branch"}:</span>
                        <select
                            value={branch}
                            disabled={disabled}
                            onChange={(e) => onBranchChange(e.target.value)}
                            className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-0 border-none p-0 w-24"
                        >
                            {availableBranches ? availableBranches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            )) : (
                                <option value="" disabled>Loading branches...</option>
                            )}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Name Input */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Name / Company</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={values.name}
                            disabled={disabled}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="font-semibold"
                            placeholder="Rahul Transport Services"
                        />
                        {showSuggestions && !disabled && (
                            <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-40 overflow-auto">
                                {MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(values.name.toLowerCase())).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
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
                    <Label className="text-xs text-muted-foreground">Mobile</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            value={values.mobile}
                            disabled={disabled}
                            onChange={(e) => onChange("mobile", e.target.value)}
                            className="pl-9 font-semibold"
                            placeholder="9876543210"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
