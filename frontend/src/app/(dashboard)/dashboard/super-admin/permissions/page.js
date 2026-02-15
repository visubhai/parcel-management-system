"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { adminService } from "@/frontend/services/adminService";
import { useBranchStore } from "@/frontend/lib/store";
import { ShieldCheck, Loader2, Save, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/frontend/components/ui/card";
import { useToast } from "@/frontend/components/ui/toast";
const REPORT_OPTIONS = [
    { id: "DAILY_REPORT", label: "Daily Report", description: "View daily booking summaries and totals" },
    { id: "DELIVERY_REPORT", label: "Delivery Report", description: "Monitor delivered parcels and delivery performance" },
    { id: "LEDGER_REPORT", label: "Ledger Report", description: "Access branch financial transactions and revenue" },
    { id: "SUMMARY_REPORT", label: "Summary Report", description: "High-level overview of branch operations" },
    { id: "BOOKING_REPORT", label: "Booking Report", description: "Detailed list of all bookings and their status" }
];
export default function ReportPermissionsPage() {
    const { currentUser } = useBranchStore();
    const { branchObjects, loading: branchesLoading } = useBranches();
    const { addToast } = useToast();
    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [allowedReports, setAllowedReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Fetch permissions when branch selected
    useEffect(() => {
        if (!selectedBranchId)
            return;
        const fetchPermissions = async () => {
            setLoading(true);
            const { data, error } = await adminService.getBranchPermissions(selectedBranchId);
            if (!error && data) {
                setAllowedReports(data.allowedReports || []);
            }
            else {
                setAllowedReports([]); // New branch or error
            }
            setLoading(false);
        };
        fetchPermissions();
    }, [selectedBranchId]);
    const handleToggle = (report) => {
        setAllowedReports(prev => prev.includes(report)
            ? prev.filter(r => r !== report)
            : [...prev, report]);
    };
    const handleSave = async () => {
        if (!selectedBranchId)
            return;
        setSaving(true);
        const { error } = await adminService.updateBranchPermissions(selectedBranchId, allowedReports);
        if (error) {
            addToast(error.message, 'error');
        }
        else {
            addToast("Permissions updated successfully", 'success');
        }
        setSaving(false);
    };
    if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'SUPER_ADMIN') {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-[60vh]", children: [_jsx(ShieldCheck, { className: "w-16 h-16 text-slate-300 mb-4" }), _jsx("h2", { className: "text-xl font-bold text-slate-800", children: "Super Admin Only" }), _jsx("p", { className: "text-slate-500", children: "You do not have permission to manage report visibility." })] }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-3xl font-black text-slate-800 tracking-tight", children: "Report Visibility" }), _jsx("p", { className: "text-slate-500 font-medium mt-1", children: "Control which reports are accessible to each branch" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs(Card, { className: "col-span-1 border-none shadow-xl bg-slate-900 text-white", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Select Branch" }) }), _jsx(CardContent, { className: "space-y-2", children: branchesLoading ? (_jsx("div", { className: "flex justify-center p-4", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-slate-400" }) })) : (branchObjects.map(branch => (_jsxs("button", { onClick: () => setSelectedBranchId(branch._id), className: `w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedBranchId === branch._id
                                        ? "bg-white text-slate-900 shadow-lg"
                                        : "hover:bg-slate-800 text-slate-400"}`, children: [branch.name, _jsx("span", { className: "block text-[10px] opacity-60 font-medium", children: branch.branchCode })] }, branch._id)))) })] }), _jsx("div", { className: "md:col-span-2 space-y-6", children: selectedBranchId ? (_jsxs(_Fragment, { children: [_jsxs(Card, { className: "border-slate-200 shadow-lg", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [_jsx(CardTitle, { className: "text-xl", children: "Enabled Reports" }), _jsxs("span", { className: "text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600", children: [allowedReports.length, " Selected"] })] }), _jsx(CardContent, { className: "space-y-4", children: loading ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-slate-300" }), _jsx("p", { className: "text-slate-400 mt-2 font-medium", children: "Loading permissions..." })] })) : (_jsx("div", { className: "grid grid-cols-1 gap-3", children: REPORT_OPTIONS.map(report => (_jsxs("div", { onClick: () => handleToggle(report.id), className: `group flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${allowedReports.includes(report.id)
                                                        ? "bg-indigo-50 border-indigo-500"
                                                        : "bg-white border-slate-100 hover:border-slate-200"}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center transition-colors ${allowedReports.includes(report.id)
                                                                ? "bg-indigo-600 text-white"
                                                                : "border-2 border-slate-200 text-transparent"}`, children: _jsx(CheckCircle2, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `font-bold ${allowedReports.includes(report.id) ? "text-indigo-900" : "text-slate-700"}`, children: report.label }), _jsx("p", { className: "text-xs text-slate-500 font-medium", children: report.description })] })] }, report.id))) })) })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsxs("button", { onClick: () => setAllowedReports([]), className: "flex items-center gap-2 px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all", children: [_jsx(Trash2, { className: "w-5 h-5" }), "Clear All"] }), _jsxs("button", { disabled: saving, onClick: handleSave, className: "flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed", children: [saving ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsx(Save, { className: "w-5 h-5" }), "Save Permissions"] })] })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-[400px]", children: [_jsx("p", { className: "text-slate-400 font-bold text-lg", children: "Select a branch to manage visibility" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Changes are applied immediately after saving" })] })) })] })] }));
}
