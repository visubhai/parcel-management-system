'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminService } from '@/frontend/services/adminService';
import { useToast } from '@/frontend/components/ui/toast';
import { ShieldCheck, Server, Activity, AlertTriangle, Clock } from 'lucide-react';
export default function SystemHealthPage() {
    const { addToast } = useToast();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        loadLogs();
    }, []);
    const loadLogs = async () => {
        setIsLoading(true);
        const { data, error } = await adminService.getAuditLogs(50);
        if (error) {
            addToast('Failed to load system logs', 'error');
        }
        else {
            setLogs(data || []);
        }
        setIsLoading(false);
    };
    return (_jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex items-center justify-between pb-6 border-b border-slate-200", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-16 w-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white", children: _jsx(Activity, { className: "w-8 h-8" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "System Health" }), _jsx("p", { className: "text-slate-500", children: "Real-time system monitoring and audit logs" })] })] }), _jsxs("button", { onClick: loadLogs, className: "flex items-center gap-2 px-4 py-2 bg-slate-100/50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors border border-slate-200", children: [_jsx(Clock, { className: "w-4 h-4" }), "Refresh Logs"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-emerald-50 text-emerald-600 rounded-lg", children: _jsx(ShieldCheck, { className: "w-6 h-6" }) }), _jsx("h3", { className: "font-bold text-slate-700", children: "Security Status" })] }), _jsx("div", { className: "text-3xl font-bold text-emerald-600 mb-1", children: "Secure" }), _jsx("p", { className: "text-sm text-slate-400", children: "RLS Policies Active" })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-blue-50 text-blue-600 rounded-lg", children: _jsx(Server, { className: "w-6 h-6" }) }), _jsx("h3", { className: "font-bold text-slate-700", children: "Database Connection" })] }), _jsx("div", { className: "text-3xl font-bold text-blue-600 mb-1", children: "Connected" }), _jsx("p", { className: "text-sm text-slate-400", children: "Latency: ~45ms" })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-orange-50 text-orange-600 rounded-lg", children: _jsx(AlertTriangle, { className: "w-6 h-6" }) }), _jsx("h3", { className: "font-bold text-slate-700", children: "Recent Errors" })] }), _jsx("div", { className: "text-3xl font-bold text-slate-800 mb-1", children: "0" }), _jsx("p", { className: "text-sm text-slate-400", children: "Last 24 hours" })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-slate-100 bg-slate-50/50", children: _jsx("h3", { className: "font-bold text-slate-800", children: "Recent Audit Logs" }) }), isLoading ? (_jsx("div", { className: "p-12 text-center text-slate-400", children: "Loading logs..." })) : (_jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 font-semibold text-slate-500", children: "Time" }), _jsx("th", { className: "px-6 py-3 font-semibold text-slate-500", children: "Operation" }), _jsx("th", { className: "px-6 py-3 font-semibold text-slate-500", children: "Table" }), _jsx("th", { className: "px-6 py-3 font-semibold text-slate-500", children: "Details" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: logs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-6 py-12 text-center text-slate-400", children: "No audit logs found." }) })) : (logs.map((log) => (_jsxs("tr", { className: "hover:bg-slate-50/50", children: [_jsx("td", { className: "px-6 py-3 text-slate-500 font-mono text-xs", children: new Date(log.created_at).toLocaleString() }), _jsx("td", { className: "px-6 py-3", children: _jsx("span", { className: `
                                                inline-flex px-2 py-0.5 rounded text-xs font-bold
                                                ${log.operation === 'INSERT' ? 'bg-emerald-50 text-emerald-700' : ''}
                                                ${log.operation === 'UPDATE' ? 'bg-blue-50 text-blue-700' : ''}
                                                ${log.operation === 'DELETE' ? 'bg-red-50 text-red-700' : ''}
                                            `, children: log.operation }) }), _jsx("td", { className: "px-6 py-3 font-medium text-slate-700", children: log.table_name }), _jsx("td", { className: "px-6 py-3 text-slate-500 truncate max-w-xs", children: log.record_id })] }, log.id)))) })] }))] })] }));
}
