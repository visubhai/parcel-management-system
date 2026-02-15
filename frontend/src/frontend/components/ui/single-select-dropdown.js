"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function SingleSelect({ options, value, onChange, placeholder = "Select option...", className, disabled = false, searchable = true, id }) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const containerRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
    const selectedOption = options.find(opt => opt.value === value);
    const handleSelect = (val) => {
        var _a;
        onChange(val);
        setOpen(false);
        setSearch("");
        (_a = triggerRef.current) === null || _a === void 0 ? void 0 : _a.focus(); // Return focus to trigger
    };
    const handleTriggerKeyDown = (e) => {
        if (disabled)
            return;
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
        }
    };
    const handleInputKeyDown = (e) => {
        var _a;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredOptions.length);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[activeIndex].value);
            }
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            (_a = triggerRef.current) === null || _a === void 0 ? void 0 : _a.focus();
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
            activeElement === null || activeElement === void 0 ? void 0 : activeElement.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex, open]);
    return (_jsxs("div", { className: "relative w-full", ref: containerRef, children: [_jsxs("button", { id: id, ref: triggerRef, type: "button", onClick: () => !disabled && setOpen(!open), onKeyDown: handleTriggerKeyDown, className: cn("flex min-h-[48px] w-full items-center justify-between rounded-xl border border-transparent bg-white px-3 py-2 text-sm shadow-sm hover:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-bold text-slate-700", className), disabled: disabled, children: [_jsx("span", { className: cn("truncate", !selectedOption && "text-slate-400 font-medium"), children: selectedOption ? selectedOption.label : placeholder }), _jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" })] }), open && (_jsxs("div", { className: "absolute z-50 mt-2 w-full min-w-[200px] rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden ring-1 ring-slate-200", children: [searchable && (_jsxs("div", { className: "flex items-center border-b border-slate-50 px-3 bg-slate-50/50", children: [_jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" }), _jsx("input", { className: "flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 font-medium disabled:cursor-not-allowed disabled:opacity-50 text-slate-700", placeholder: "Search category...", value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: handleInputKeyDown, autoFocus: true })] })), _jsxs("div", { className: "max-h-[300px] overflow-y-auto p-1 custom-scrollbar scroll-smooth", children: [filteredOptions.length === 0 && (_jsx("div", { className: "py-8 text-center text-sm text-slate-400 font-medium", children: "No results found." })), filteredOptions.map((option, index) => (_jsxs("div", { id: `option-${index}`, onClick: () => handleSelect(option.value), className: cn("relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all duration-200", value === option.value
                                    ? "bg-blue-50 text-blue-700"
                                    : index === activeIndex ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"), children: [_jsx("span", { className: "flex-1 truncate", children: option.label }), value === option.value && (_jsx(Check, { className: "ml-2 h-4 w-4 text-blue-600" }))] }, option.value)))] })] }))] }));
}
