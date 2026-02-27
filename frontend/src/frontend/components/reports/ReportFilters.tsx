import { FilterState } from "@/frontend/hooks/useReports";
import { Branch, PaymentStatus, ParcelStatus } from "@/shared/types";
import { Search, Calendar, Filter, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { MultiSelect, Option } from "@/frontend/components/ui/multi-select-dropdown";
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

    // Helper to Convert String "A,B" to Array ["A", "B"]
    const toArray = (val: string | string[]) => {
        if (Array.isArray(val)) return val;
        if (!val || val === 'All') return [];
        return val.split(',');
    };

    // Computed Allowed Branches Logic
    // Same as backend logic
    let allowedBranches: string[] = [];
    if (userBranch === 'hirabagh') {
        allowedBranches = branches;
    } else if (userBranch === 'bapunagar') {
        const groupBranches = ['bapunagar', 'amdavad-ctm', 'paldi', 'setelite'];
        // Keep actual names matching the case strictly
        allowedBranches = branches.filter(b => groupBranches.includes(b.toLowerCase()));
    } else if (userBranch) {
        allowedBranches = [userBranch];
    }

    const branchOptions: Option[] = branches.map(b => ({ label: b, value: b }));

    const handleMultiChange = (key: 'fromBranch' | 'toBranch', selected: string[]) => {
        setFilters(prev => {
            const newVal = selected.length > 0 ? selected.join(',') : 'All';

            if (isBranchRestricted && userBranch && allowedBranches.length > 0) {
                const currentFrom = key === 'fromBranch' ? newVal : prev.fromBranch;
                const currentTo = key === 'toBranch' ? newVal : prev.toBranch;

                const fromArr = toArray(currentFrom);
                const toArr = toArray(currentTo);

                // Is the From branch entirely foreign? (None of the selected branches are in the allowed group)
                // "All" is not foreign because it includes all branches.
                const isFromForeign = currentFrom !== 'All' && fromArr.every((b: string) => !allowedBranches.includes(b));
                // Same for To branch
                const isToForeign = currentTo !== 'All' && toArr.every((b: string) => !allowedBranches.includes(b));

                const newFilters = { ...prev, [key]: newVal };

                // Enforce Rule: (Sender IN allowedBranches) OR (Receiver IN allowedBranches)
                if (key === 'fromBranch' && isFromForeign && isToForeign) {
                    // Force the Destination to be the user's primary scope because Origin is completely foreign
                    newFilters.toBranch = allowedBranches.join(',');
                }
                if (key === 'toBranch' && isToForeign && isFromForeign) {
                    // Force the Origin to be the primary scope because Destination is completely foreign
                    newFilters.fromBranch = allowedBranches.join(',');
                }
                return newFilters;
            }

            return { ...prev, [key]: newVal };
        });
    };

    const handleChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            if (isBranchRestricted && userBranch && allowedBranches.length > 0) {
                const currentFrom = key === 'fromBranch' ? value : prev.fromBranch;
                const currentTo = key === 'toBranch' ? value : prev.toBranch;

                const isFromForeign = currentFrom !== 'All' && !allowedBranches.includes(currentFrom);
                const isToForeign = currentTo !== 'All' && !allowedBranches.includes(currentTo);

                if (key === 'fromBranch' && isFromForeign && isToForeign) {
                    newFilters.toBranch = allowedBranches[0];
                }
                if (key === 'toBranch' && isToForeign && isFromForeign) {
                    newFilters.fromBranch = allowedBranches[0];
                }
            }
            return newFilters;
        });
    };

    const handleQuickDate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        setFilters(prev => ({
            ...prev,
            startDate: dateStr,
            endDate: dateStr
        }));
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
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            // Don't reset branch if restricted
            fromBranch: isBranchRestricted ? (userBranch || 'All') : 'All',
            toBranch: 'All'
        }));
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row gap-4 items-end">

                {/* Search Bar */}
                <div className="flex-1 relative">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Search Record</span>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by LR No, Sender, Receiver..."
                            value={filters.searchQuery}
                            onChange={(e) => handleChange('searchQuery', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Quick Date Menu */}
                <div className="flex flex-col gap-1 min-w-[320px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Quick Reports</span>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                        <button
                            onClick={() => handleQuickDate(0)}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all",
                                (filters.startDate === filters.endDate && filters.startDate === new Date().toISOString().split('T')[0])
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleQuickDate(1)}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all",
                                (filters.startDate === filters.endDate && filters.startDate === new Date(Date.now() - 86400000).toISOString().split('T')[0])
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Yesterday
                        </button>
                        <button
                            onClick={() => handleQuickDate(2)}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-all",
                                (filters.startDate === filters.endDate && filters.startDate === new Date(Date.now() - 172800000).toISOString().split('T')[0])
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Ereyesterday
                        </button>
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Custom Period</span>
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
            </div>

            {/* Advanced Filters Row */}
            <div className="flex flex-wrap items-center gap-4">

                {/* Branch Selectors */}
                <div className="w-72">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Origin (From)</span>
                    <MultiSelect
                        options={branchOptions}
                        selected={toArray(filters.fromBranch)}
                        onChange={(selected) => handleMultiChange('fromBranch', selected)}
                        placeholder="Select Origin..."
                    />
                </div>

                <div className="w-72">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destination (To)</span>
                    <MultiSelect
                        options={branchOptions}
                        selected={toArray(filters.toBranch)}
                        onChange={(selected) => handleMultiChange('toBranch', selected)}
                        placeholder="Select Destination..."
                    />
                </div>

                {/* Reset Button */}
                <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-dashed border-transparent hover:border-red-100"
                >
                    <X className="w-3.5 h-3.5" />
                    Reset All
                </button>
            </div>
        </div>
    );
}
