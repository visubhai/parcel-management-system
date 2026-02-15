"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Search, Bell, Menu, ChevronDown, User, LogOut, Settings, Building2 } from "lucide-react";
import { useBranchStore } from "@/frontend/lib/store";
import { authService } from "@/frontend/services/authService";
import { parcelService } from "@/frontend/services/parcelService";
import { useRouter } from "next/navigation";
import { cn } from "@/frontend/lib/utils";
import { useDebounce } from "../../hooks/useDebounce";
export function Header() {
    var _a, _b, _c;
    const { currentUser, searchQuery, setSearchQuery, setCurrentUser, toggleMobileMenu } = useBranchStore();
    const router = useRouter();
    // Local state for header clock
    const [time, setTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
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
        // Clear session gate cookie
        document.cookie = "login-gate-passed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=lax";
        await authService.logout();
        setCurrentUser(null);
        router.refresh();
        router.push("/login");
    };
    // Branch logic (Simplified: Show current user's branch)
    const displayBranch = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.branch) || "All Branches";
    return (_jsxs("header", { className: "h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 print:hidden", children: [_jsxs("div", { className: "flex items-center gap-4 flex-1", children: [_jsx("button", { onClick: toggleMobileMenu, className: "p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500", children: _jsx(Menu, { className: "w-6 h-6" }) }), _jsxs("div", { className: "relative w-full max-w-md hidden sm:block", children: [_jsx(Search, { className: "w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onFocus: () => searchQuery.length >= 3 && setShowSearchResults(true), placeholder: "Search LR number (min 3 chars)...", className: "w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" }), showSearchResults && (_jsxs("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50", children: [_jsxs("div", { className: "p-2 border-b border-slate-50 flex items-center justify-between", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2", children: "Search Results" }), _jsx("button", { onClick: () => setShowSearchResults(false), className: "p-1 hover:bg-slate-100 rounded text-slate-400", children: _jsx(Menu, { className: "w-3 h-3" }) })] }), _jsx("div", { className: "max-h-80 overflow-y-auto", children: isSearching ? (_jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" }), _jsx("p", { className: "text-xs text-slate-400 mt-2 font-medium", children: "Searching..." })] })) : searchResults.length > 0 ? (searchResults.map((booking) => (_jsxs("button", { onClick: () => {
                                                setShowSearchResults(false);
                                                router.push(`/reports?lrNumber=${booking.lrNumber}&edit=true`);
                                            }, className: "w-full p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors text-left border-b border-slate-50/50 last:border-0", children: [_jsx("div", { className: "h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "text-sm font-bold text-slate-800 truncate", children: booking.lrNumber }), _jsx("span", { className: cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase", booking.status === 'DELIVERED' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"), children: booking.status })] }), _jsxs("div", { className: "flex items-center gap-1 text-[11px] text-slate-400 mt-0.5", children: [_jsx("span", { className: "font-medium text-slate-600 truncate max-w-[80px]", children: booking.sender.name }), _jsx("span", { children: "\u2192" }), _jsx("span", { className: "font-medium text-slate-600 truncate max-w-[80px]", children: booking.receiver.name })] })] })] }, booking.id)))) : (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-sm font-medium text-slate-400", children: "No parcels found with this LR number" }) })) }), searchResults.length > 0 && (_jsx("button", { onClick: () => {
                                            setShowSearchResults(false);
                                            router.push(`/reports?search=${searchQuery}`);
                                        }, className: "w-full p-3 bg-slate-50 text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest", children: "View All Detailed Results" }))] }))] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100", children: [_jsx(Building2, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-600", children: displayBranch })] }), _jsx("div", { className: "h-8 w-px bg-slate-200 mx-2 hidden sm:block" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "text-right hidden sm:block", children: [_jsx("p", { className: "text-xs font-bold text-slate-800", children: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }), _jsx("p", { className: "text-[10px] text-slate-500 font-medium", children: time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) })] }), _jsxs("button", { className: "relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors", children: [_jsx(Bell, { className: "w-5 h-5" }), _jsx("span", { className: "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "flex items-center gap-3 hover:bg-slate-50 p-1 pr-3 rounded-full border border-transparent hover:border-slate-100 transition-all", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-900/20 ring-2 ring-white", children: ((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) === null || _a === void 0 ? void 0 : _a.charAt(0)) || "U" }), _jsxs("div", { className: "hidden md:block text-left", children: [_jsx("p", { className: "text-sm font-bold text-slate-700 leading-none", children: currentUser === null || currentUser === void 0 ? void 0 : currentUser.name }), _jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5 capitalize", children: (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === null || _b === void 0 ? void 0 : _b.toLowerCase().replace('_', ' ') })] }), _jsx(ChevronDown, { className: "w-4 h-4 text-slate-400" })] }), isDropdownOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50", children: [_jsxs("div", { className: "px-4 py-3 border-b border-slate-50", children: [_jsx("p", { className: "text-sm font-bold text-slate-800", children: currentUser === null || currentUser === void 0 ? void 0 : currentUser.name }), _jsx("p", { className: "text-xs text-slate-500 truncate", children: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || `${(currentUser === null || currentUser === void 0 ? void 0 : currentUser.username) || ((_c = currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().replace(/\s+/g, ''))}@savan.com` })] }), _jsxs("div", { className: "p-1", children: [_jsxs("button", { className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors", children: [_jsx(User, { className: "w-4 h-4" }), "Profile"] }), _jsxs("button", { className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors", children: [_jsx(Settings, { className: "w-4 h-4" }), "Settings"] })] }), _jsx("div", { className: "p-1 border-t border-slate-50", children: _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sign Out"] }) })] }))] })] })] })] }));
}
