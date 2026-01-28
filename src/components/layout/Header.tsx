"use client";

import { useEffect, useState } from "react";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { useBranchStore } from "@/lib/store";
import { Branch } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header() {
    const { currentBranch, setBranch, searchQuery, setSearchQuery, currentUser, logout, branches } = useBranchStore();
    const [time, setTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleBranchSelect = (branch: Branch) => {
        setBranch(branch);
        setIsDropdownOpen(false);
    };

    return (
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm transition-all">
            {/* Left: Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by LR Number..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-6">
                {/* Clock */}
                <div className="font-mono text-xl text-slate-700 tracking-wider">
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                </div>

                {/* Branch Switcher (Only for Super Admin) */}
                {currentUser?.role === 'SUPER_ADMIN' ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                        >
                            <span className={cn("w-2 h-2 rounded-full", currentBranch === 'Branch A' ? "bg-green-500" : "bg-purple-500")} />
                            {currentBranch}
                            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 z-20">
                                    {branches.map((b) => (
                                        <button
                                            key={b}
                                            onClick={() => handleBranchSelect(b)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-100 bg-slate-50/50 text-sm font-medium text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {currentBranch}
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
