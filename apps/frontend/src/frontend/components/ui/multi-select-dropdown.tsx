"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { Badge } from "@/frontend/components/ui/badge";

export type Option = {
    label: string;
    value: string;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
    disabled = false
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    const toggleSelectAll = () => {
        if (selected.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(opt => opt.value));
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                className={cn(
                    "flex min-h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                disabled={disabled}
            >
                <div className="flex flex-wrap gap-1">
                    {selected.length === 0 && (
                        <span className="text-slate-500 font-medium">{placeholder}</span>
                    )}
                    {selected.length > 0 && selected.length <= 2 ? (
                        selected.map((item) => {
                            const option = options.find((o) => o.value === item);
                            return (
                                <Badge
                                    variant="secondary"
                                    key={item}
                                    className="mr-1 mb-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent rounded-md px-1.5 py-0.5 font-bold"
                                >
                                    {option?.label || item}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-blue-200 p-0.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(item);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-blue-500 hover:text-blue-700" />
                                    </div>
                                </Badge>
                            );
                        })
                    ) : selected.length > 2 ? (
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent rounded-md px-2 py-0.5 font-bold">
                            {selected.length} selected
                        </Badge>
                    ) : null}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full min-w-[200px] rounded-xl border border-slate-100 bg-white shadow-xl animate-in fade-in zoom-in-95 overflow-hidden">
                    <div className="flex items-center border-b border-slate-50 px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[200px] overflow-auto p-1">
                        {filteredOptions.length === 0 && (
                            <div className="py-6 text-center text-sm text-slate-500">No results found.</div>
                        )}

                        {filteredOptions.length > 0 && (
                            <div
                                onClick={toggleSelectAll}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-bold outline-none hover:bg-slate-50 transition-colors",
                                    selected.length === options.length ? "bg-slate-50" : ""
                                )}
                            >
                                <div
                                    className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300",
                                        selected.length === options.length
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "opacity-50"
                                    )}
                                >
                                    <Check className="h-3 w-3" />
                                </div>
                                <span className="text-slate-600">Select All</span>
                            </div>
                        )}

                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    if (selected.includes(option.value)) {
                                        handleUnselect(option.value);
                                    } else {
                                        onChange([...selected, option.value]);
                                    }
                                }}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-medium outline-none hover:bg-slate-50 transition-colors",
                                    selected.includes(option.value) ? "bg-blue-50/50 text-blue-700" : "text-slate-700"
                                )}
                            >
                                <div
                                    className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300",
                                        selected.includes(option.value)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "opacity-50"
                                    )}
                                >
                                    <Check className="h-3 w-3 font-bold" />
                                </div>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
