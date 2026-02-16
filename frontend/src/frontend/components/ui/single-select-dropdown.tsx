"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

export type Option = {
    label: string;
    value: string;
};

interface SingleSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
    id?: string;
}

export function SingleSelect({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    className,
    disabled = false,
    searchable = true,
    id
}: SingleSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

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

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
        setSearch("");
        triggerRef.current?.focus(); // Return focus to trigger
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredOptions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[activeIndex].value);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        }
    };

    // Reset active index when search changes
    React.useEffect(() => {
        setActiveIndex(0);
    }, [search]);

    // Auto-scroll to active item
    React.useEffect(() => {
        if (open) {
            const activeElement = document.getElementById(`option-${activeIndex}`);
            activeElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex, open]);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                id={id}
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                onKeyDown={handleTriggerKeyDown}
                className={cn(
                    "flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 font-bold text-slate-700",
                    className
                )}
                disabled={disabled}
            >
                <span className={cn("truncate", !selectedOption && "text-slate-400 font-medium")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40 text-slate-500 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full min-w-[240px] rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 overflow-hidden ring-1 ring-slate-200/50 backdrop-blur-xl">
                    {searchable && (
                        <div className="flex items-center border-b border-slate-100 px-4 bg-slate-50/80 sticky top-0 z-10">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-40 text-slate-500" />
                            <input
                                className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 font-medium text-slate-700"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="max-h-[320px] overflow-y-auto p-1.5 custom-scrollbar scroll-smooth">
                        {filteredOptions.length === 0 && (
                            <div className="py-10 text-center text-sm text-slate-400 font-medium">No matches found.</div>
                        )}

                        {filteredOptions.map((option, index) => (
                            <div
                                id={`option-${index}`}
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-3 text-sm font-bold outline-none transition-all duration-200 mb-0.5 last:mb-0",
                                    value === option.value
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : index === activeIndex ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:pl-4"
                                )}
                            >
                                <span className="flex-1 truncate">{option.label}</span>
                                {value === option.value && (
                                    <Check className="ml-2 h-4 w-4 text-white" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
