"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { adminService } from "@/frontend/services/adminService";
import { cn } from "@/frontend/lib/utils";
import { Store } from "lucide-react";
export function BranchSelect({ value, onSelect, className, placeholder = "Select a branch" }) {
    const [branches, setBranches] = useState([]);
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
    return (_jsxs("div", { className: cn("relative", className), children: [_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: _jsx(Store, { className: "w-4 h-4" }) }), _jsxs("select", { value: value || "", onChange: (e) => onSelect(e.target.value), disabled: loading, className: "h-10 w-[200px] appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50", children: [_jsx("option", { value: "", disabled: true, children: loading ? "Loading..." : placeholder }), branches.map((branch) => (_jsxs("option", { value: branch._id, children: [branch.name, " (", branch.branchCode, ")"] }, branch._id)))] }), _jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "h-4 w-4", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }) })] }));
}
