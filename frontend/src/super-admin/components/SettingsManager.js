import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { useToast } from "@/frontend/components/ui/toast";
import { RefreshCcw, Save, AlertTriangle, Hash } from "lucide-react";
export function SettingsManager() {
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(null);
    const fetchCounters = async () => {
        setLoading(true);
        const { data, error } = await adminService.getCounters();
        if (data) {
            setCounters(data);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchCounters();
    }, []);
    const handleUpdateCounter = async (id, newCount) => {
        setIsSaving(id);
        const { error } = await adminService.updateCounter(id, newCount);
        if (error) {
            addToast(error.message, "error");
        }
        else {
            addToast("Counter updated successfully", "success");
            fetchCounters();
        }
        setIsSaving(null);
    };
    if (loading && counters.length === 0)
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading system settings..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "System Configuration" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Manage sequential numbering and global system behavior" })] }), _jsxs("div", { className: "bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-xs text-amber-800 font-medium", children: [_jsx("strong", { className: "block mb-1", children: "Warning: Sequential Numbers" }), "Adjusting counters directly will change the next generated LR Number. Values should only be increased to avoid duplicate numbering unless you are resolving a specific conflict."] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2", children: [_jsx(Hash, { className: "w-4 h-4" }), " LR Number Counters"] }), _jsxs("div", { className: "space-y-3", children: [counters.map((counter) => {
                                        var _a, _b;
                                        return (_jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-black text-blue-600 uppercase mb-1", children: ((_a = counter.branchId) === null || _a === void 0 ? void 0 : _a.branchCode) || 'Global' }), _jsx("h4", { className: "font-bold text-slate-800", children: (_b = counter.branchId) === null || _b === void 0 ? void 0 : _b.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [counter.entity, " - ", counter.field] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", defaultValue: counter.count, id: `counter-${counter._id}`, className: "w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20" }), _jsx("button", { disabled: isSaving === counter._id, onClick: () => {
                                                                const input = document.getElementById(`counter-${counter._id}`);
                                                                handleUpdateCounter(counter._id, parseInt(input.value));
                                                            }, className: "p-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-all disabled:opacity-50", children: isSaving === counter._id ? _jsx(RefreshCcw, { className: "w-4 h-4 animate-spin" }) : _jsx(Save, { className: "w-4 h-4" }) })] })] }, counter._id));
                                    }), counters.length === 0 && (_jsx("div", { className: "text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm", children: "No counters initialized. They will appear once each branch makes its first booking." }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-sm font-black text-slate-400 uppercase tracking-widest", children: "General Behavior" }), _jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm opacity-60 grayscale cursor-not-allowed", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-slate-800 text-sm", children: "Sms Notifications" }), _jsx("p", { className: "text-xs text-slate-500", children: "Auto-send SMS on booking" })] }), _jsx("div", { className: "w-10 h-5 bg-green-500 rounded-full relative", children: _jsx("div", { className: "absolute right-1 top-1 w-3 h-3 bg-white rounded-full" }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-slate-800 text-sm", children: "Auto Printing" }), _jsx("p", { className: "text-xs text-slate-500", children: "Open print dialog after save" })] }), _jsx("div", { className: "w-10 h-5 bg-green-500 rounded-full relative", children: _jsx("div", { className: "absolute right-1 top-1 w-3 h-3 bg-white rounded-full" }) })] })] }), _jsx("p", { className: "text-[10px] text-slate-400 text-center font-bold", children: "Additional system flags will be available in the next version." })] })] })] }));
}
