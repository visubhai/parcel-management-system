"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown, User, LogOut, Settings, Building2 } from "lucide-react";
import { useBranchStore } from "@/frontend/lib/store";
import { useBranches } from "@/frontend/hooks/useBranches";
import { authService } from "@/frontend/services/authService";
import { parcelService } from "@/frontend/services/parcelService";
import { useRouter } from "next/navigation";
import { cn } from "@/frontend/lib/utils";
import { useDebounce } from "../../hooks/useDebounce";
import { Booking } from "@/shared/types";

export function Header() {
    const { currentUser, searchQuery, setSearchQuery, setCurrentUser } = useBranchStore();
    const router = useRouter();

    // Local state for header clock
    const [time, setTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Booking[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 300);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearch.length < 3) {
                setSearchResults([]);
                setShowSearchResults(false);
                return;
            }

            setIsSearching(true);
            const { data, error } = await parcelService.getBookingsForReports('', '', debouncedSearch);
            setIsSearching(false);

            if (data) {
                setSearchResults(data);
                setShowSearchResults(true);
            }
        };

        performSearch();
    }, [debouncedSearch]);

    const handleLogout = async () => {
        await authService.logout();
        setCurrentUser(null);
        router.refresh();
        router.push("/login");
    };

    // Branch logic (Simplified: Show current user's branch)
    const displayBranch = currentUser?.branch || "All Branches";

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500">
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
                        placeholder="Search LR number (min 3 chars)..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                            <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">Search Results</span>
                                <button onClick={() => setShowSearchResults(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                                    <Menu className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-8 text-center">
                                        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
                                        <p className="text-xs text-slate-400 mt-2 font-medium">Searching...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((booking) => (
                                        <button
                                            key={booking.id}
                                            onClick={() => {
                                                setShowSearchResults(false);
                                                router.push(`/reports?lrNumber=${booking.lrNumber}`);
                                            }}
                                            className="w-full p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors text-left border-b border-slate-50/50 last:border-0"
                                        >
                                            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <Search className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-bold text-slate-800 truncate">{booking.lrNumber}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                                        booking.status === 'DELIVERED' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                                    )}>{booking.status}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                                    <span className="font-medium text-slate-600 truncate max-w-[80px]">{booking.sender.name}</span>
                                                    <span>→</span>
                                                    <span className="font-medium text-slate-600 truncate max-w-[80px]">{booking.receiver.name}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm font-medium text-slate-400">No parcels found with this LR number</p>
                                    </div>
                                )}
                            </div>
                            {searchResults.length > 0 && (
                                <button
                                    onClick={() => {
                                        setShowSearchResults(false);
                                        router.push(`/reports?search=${searchQuery}`);
                                    }}
                                    className="w-full p-3 bg-slate-50 text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                                >
                                    View All Detailed Results
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Branch Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                        {displayBranch}
                    </span>
                </div>

                <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-800">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>

                    <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-3 rounded-full border border-transparent hover:border-slate-100 transition-all"
                        >
                            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-slate-900/20">
                                {currentUser?.name?.charAt(0) || "U"}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-bold text-slate-700 leading-none">{currentUser?.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">{currentUser?.role?.toLowerCase().replace('_', ' ')}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{currentUser?.email || "user@example.com"}</p>
                                </div>
                                <div className="p-1">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                </div>
                                <div className="p-1 border-t border-slate-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
