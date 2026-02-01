import { FilterState } from "@/frontend/hooks/useReports";
import { Branch, PaymentStatus, ParcelStatus } from "@/shared/types";
import { Search, Calendar, Filter, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useBranchStore } from "@/frontend/lib/store";

interface ReportFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    branches: Branch[];
    isBranchRestricted?: boolean;
    userBranch?: string;
}

export function ReportFilters({ filters, setFilters, branches, isBranchRestricted, userBranch }: ReportFiltersProps) {
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

    const allowedReports = currentUser?.allowedReports || [];
    const hasPaymentAccess = currentUser?.role === 'SUPER_ADMIN' || allowedReports.includes('Payment');

    const handleChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // STRICT BRANCH LOCKING LOGIC for Branch Users
            if (isBranchRestricted && userBranch) {
                // Case 1: Changing FROM branch
                if (key === 'fromBranch') {
                    // If From is NOT my branch (e.g. "All" or "Surat"), To MUST be my branch
                    if (value !== userBranch) {
                        newFilters.toBranch = userBranch;
                    }
                    // If From IS my branch, To can be anything (keep existing or reset? Keep existing is fine)
                }

                // Case 2: Changing TO branch
                if (key === 'toBranch') {
                    // If To is NOT my branch, From MUST be my branch
                    if (value !== userBranch) {
                        newFilters.fromBranch = userBranch;
                    }
                }
            }
            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters(prev => ({
            ...prev,
            searchQuery: '',
            paymentType: 'All',
            status: 'All',
            itemType: 'All',
            minAmount: '',
            maxAmount: '',
            // Don't reset branch if restricted
            fromBranch: isBranchRestricted ? prev.fromBranch : 'All',
            toBranch: 'All'
        }));
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row gap-4">

                {/* Search Bar */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by LR No, Sender, Receiver..."
                        value={filters.searchQuery}
                        onChange={(e) => handleChange('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">From</span>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            max={filters.endDate}
                            className="pl-12 pr-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 outline-none w-36"
                        />
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">To</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            min={filters.startDate}
                            className="pl-8 pr-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 outline-none w-32"
                        />
                    </div>
                </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="flex flex-wrap items-center gap-3">

                {/* Branch Selectors */}
                <select
                    value={filters.fromBranch}
                    // disabled={isBranchRestricted} // REMOVED: Allow selection but enforce logic
                    onChange={(e) => handleChange('fromBranch', e.target.value)}
                    className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border outline-none focus:ring-2 focus:ring-blue-500/20",
                        isBranchRestricted
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                >
                    <option value="All">All Origins</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select
                    value={filters.toBranch}
                    onChange={(e) => handleChange('toBranch', e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                >
                    <option value="All">All Destinations</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                {/* Status & Payment */}
                {hasPaymentAccess && (
                    <select
                        value={filters.paymentType}
                        onChange={(e) => handleChange('paymentType', e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                    >
                        <option value="All">All Payments</option>
                        <option value="Paid">Paid</option>
                        <option value="To Pay">To Pay</option>
                    </select>
                )}

                <select
                    value={filters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                >
                    <option value="All">All Statuses</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                {/* Advanced: Item Type */}
                <select
                    value={filters.itemType}
                    onChange={(e) => handleChange('itemType', e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300"
                >
                    <option value="All">All Item Types</option>
                    <option value="White Sack">White Sack</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                    <option value="Industrial Part">Industrial Part</option>
                    <option value="Electronics">Electronics</option>
                </select>

                {/* Advanced: Amount Range */}
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Min ₹</span>
                    <input
                        type="number"
                        value={filters.minAmount}
                        onChange={(e) => handleChange('minAmount', e.target.value)}
                        placeholder="0"
                        className="w-16 text-sm font-bold text-slate-700 outline-none"
                    />
                    <span className="text-slate-300 px-1">-</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Max ₹</span>
                    <input
                        type="number"
                        value={filters.maxAmount}
                        onChange={(e) => handleChange('maxAmount', e.target.value)}
                        placeholder="10000"
                        className="w-20 text-sm font-bold text-slate-700 outline-none"
                    />
                </div>

                {/* Reset Button */}
                <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear Filters
                </button>
            </div>
        </div>
    );
}
