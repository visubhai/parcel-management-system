import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { MultiSelect } from "@/frontend/components/ui/multi-select-dropdown";
import { useBranchStore } from "@/frontend/lib/store";
export function ReportFilters({ filters, setFilters, branches, isBranchRestricted, userBranch }) {
    const { currentUser } = useBranchStore();
    // Permission: Only show allowed reports if restricted
    // Note: The dropdown currently shows hardcoded values. We should filter them.
    const ALL_REPORT_TYPES = ["All", "Paid", "To Pay"]; // Payment Types
    const ALL_STATUS_TYPES = ["All", "In Transit", "Arrived", "Delivered", "Cancelled"];
    // Note: The requirements mention "Allowed Reports" as: Daily, Revenue, Branch-wise, Payment, Sender/Receiver.
    // However, the current FilterBar mainly filters data. The "Reports Menu" mentioned in reqs seems to imply different VIEWS or TABS.
    // For now, let's assume if user doesn't have "Payment" report access, we hide the Payment Type filter?
    // Or maybe we strictly interpret "Reports Menu" as navigation.
    // Let's implement logic: 
    // If 'Payment' is not in allowedReports, hide Payment Type selector? 
    // Actually, "Payment" report likely means the analytics/summary. 
    // Let's check currentUser.allowedReports.
    const allowedReports = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.allowedReports) || [];
    const hasPaymentAccess = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN' || allowedReports.includes('Payment');
    // Helper to Convert String "A,B" to Array ["A", "B"]
    const toArray = (val) => {
        if (Array.isArray(val))
            return val;
        if (!val || val === 'All')
            return [];
        return val.split(',');
    };
    const branchOptions = branches.map(b => ({ label: b, value: b }));
    const handleMultiChange = (key, selected) => {
        setFilters(prev => {
            const newVal = selected.length > 0 ? selected.join(',') : 'All';
            // STRICT BRANCH LOCKING LOGIC for Branch Users
            if (isBranchRestricted && userBranch) {
                // Feature: Default to "My Branch -> All" when everything is cleared
                if (selected.length === 0) {
                    if (key === 'fromBranch') {
                        // User cleared "From" -> Reset to standard Outgoing
                        return Object.assign(Object.assign({}, prev), { fromBranch: userBranch, toBranch: 'All' });
                    }
                    if (key === 'toBranch') {
                        const currentFrom = prev.fromBranch;
                        const fromArr = toArray(currentFrom);
                        const isFromForeign = fromArr.length !== 1 || fromArr[0] !== userBranch;
                        if (isFromForeign) {
                            return Object.assign(Object.assign({}, prev), { toBranch: userBranch });
                        }
                        return Object.assign(Object.assign({}, prev), { toBranch: 'All' });
                    }
                }
                const newFilters = Object.assign(Object.assign({}, prev), { [key]: newVal });
                const currentFrom = key === 'fromBranch' ? newVal : prev.fromBranch;
                const currentTo = key === 'toBranch' ? newVal : prev.toBranch;
                const fromArr = toArray(currentFrom);
                const isFromForeign = fromArr.length !== 1 || fromArr[0] !== userBranch;
                const toArr = toArray(currentTo);
                const isToForeign = toArr.length !== 1 || toArr[0] !== userBranch;
                if (key === 'fromBranch' && isFromForeign) {
                    newFilters.toBranch = userBranch;
                }
                if (key === 'toBranch' && isToForeign) {
                    newFilters.fromBranch = userBranch;
                }
                return newFilters;
            }
            return Object.assign(Object.assign({}, prev), { [key]: newVal });
        });
    };
    const handleChange = (key, value) => {
        setFilters(prev => {
            const newFilters = Object.assign(Object.assign({}, prev), { [key]: value });
            // STRICT BRANCH LOCKING LOGIC for Branch Users
            if (isBranchRestricted && userBranch) {
                if (key === 'fromBranch' && value !== userBranch) {
                    newFilters.toBranch = userBranch;
                }
                if (key === 'toBranch' && value !== userBranch) {
                    newFilters.fromBranch = userBranch;
                }
            }
            return newFilters;
        });
    };
    const handleQuickDate = (daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        setFilters(prev => (Object.assign(Object.assign({}, prev), { startDate: dateStr, endDate: dateStr })));
    };
    const clearFilters = () => {
        setFilters(prev => (Object.assign(Object.assign({}, prev), { searchQuery: '', paymentType: 'All', status: 'All', itemType: 'All', minAmount: '', maxAmount: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], 
            // Don't reset branch if restricted
            fromBranch: isBranchRestricted ? (userBranch || 'All') : 'All', toBranch: 'All' })));
    };
    return (_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-0 z-10", children: [_jsxs("div", { className: "flex flex-col lg:flex-row gap-4 items-end", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mb-1 block", children: "Search Record" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search by LR No, Sender, Receiver...", value: filters.searchQuery, onChange: (e) => handleChange('searchQuery', e.target.value), className: "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" })] })] }), _jsxs("div", { className: "flex flex-col gap-1 min-w-[320px]", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mb-1 block", children: "Quick Reports" }), _jsxs("div", { className: "flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200", children: [_jsx("button", { onClick: () => handleQuickDate(0), className: cn("flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all", (filters.startDate === filters.endDate && filters.startDate === new Date().toISOString().split('T')[0])
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"), children: "Today" }), _jsx("button", { onClick: () => handleQuickDate(1), className: cn("flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all", (filters.startDate === filters.endDate && filters.startDate === new Date(Date.now() - 86400000).toISOString().split('T')[0])
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"), children: "Yesterday" }), _jsx("button", { onClick: () => handleQuickDate(2), className: cn("flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all", (filters.startDate === filters.endDate && filters.startDate === new Date(Date.now() - 172800000).toISOString().split('T')[0])
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"), children: "Ereyesterday" })] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mb-1 block", children: "Custom Period" }), _jsxs("div", { className: "flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200", children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase", children: "From" }), _jsx("input", { type: "date", value: filters.startDate, onChange: (e) => handleChange('startDate', e.target.value), max: filters.endDate, className: "pl-12 pr-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 outline-none w-36" })] }), _jsx("span", { className: "text-slate-300", children: "|" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase", children: "To" }), _jsx("input", { type: "date", value: filters.endDate, onChange: (e) => handleChange('endDate', e.target.value), min: filters.startDate, className: "pl-8 pr-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 outline-none w-32" })] })] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsxs("div", { className: "w-72", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mb-1 block", children: "Origin (From)" }), _jsx(MultiSelect, { options: branchOptions, selected: toArray(filters.fromBranch), onChange: (selected) => handleMultiChange('fromBranch', selected), placeholder: "Select Origin..." })] }), _jsxs("div", { className: "w-72", children: [_jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mb-1 block", children: "Destination (To)" }), _jsx(MultiSelect, { options: branchOptions, selected: toArray(filters.toBranch), onChange: (selected) => handleMultiChange('toBranch', selected), placeholder: "Select Destination..." })] }), _jsxs("button", { onClick: clearFilters, className: "ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-dashed border-transparent hover:border-red-100", children: [_jsx(X, { className: "w-3.5 h-3.5" }), "Reset All"] })] })] }));
}
