"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/frontend/services/adminService";
import { Branch } from "@/shared/types";
import { cn } from "@/frontend/lib/utils";
import { Store } from "lucide-react";

interface BranchOption {
    _id: string;
    name: string;
    branchCode: string;
}

interface BranchSelectProps {
    value?: string;
    onSelect: (branchId: string) => void;
    className?: string;
    placeholder?: string;
}

export function BranchSelect({ value, onSelect, className, placeholder = "Select a branch" }: BranchSelectProps) {
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBranches = async () => {
            setLoading(true);
            const { data } = await adminService.getAllBranches();
            if (data) {
                setBranches(data);
            }
            setLoading(false);
        };
        fetchBranches();
    }, []);

    return (
        <div className={cn("relative", className)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Store className="w-4 h-4" />
            </div>
            <select
                value={value || ""}
                onChange={(e) => onSelect(e.target.value)}
                disabled={loading}
                className="h-10 w-[200px] appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
                <option value="" disabled>
                    {loading ? "Loading..." : placeholder}
                </option>
                {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                        {branch.name} ({branch.branchCode})
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}
