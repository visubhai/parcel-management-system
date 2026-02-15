import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { Calendar, User as UserIcon, Tag } from "lucide-react";
import { format } from "date-fns";
export function AuditLogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [entityType, setEntityType] = useState("");
    const [action, setAction] = useState("");
    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await adminService.getAuditLogs(page, 20, entityType, action);
        if (data) {
            setLogs(data.data);
            setTotal(data.total);
        }
        setLoading(false);
    };
    useEffect(() => {
        fetchLogs();
    }, [page, entityType, action]);
    const getActionColor = (action) => {
        if (action.includes('CREATE'))
            return 'bg-green-50 text-green-700 border-green-200';
        if (action.includes('UPDATE'))
            return 'bg-blue-50 text-blue-700 border-blue-200';
        if (action.includes('DELETE'))
            return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "System Audit Logs" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Monitor all administrative actions and changes" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("select", { value: entityType, onChange: (e) => { setEntityType(e.target.value); setPage(1); }, className: "bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "All Entities" }), _jsx("option", { value: "Booking", children: "Bookings" }), _jsx("option", { value: "User", children: "Users" }), _jsx("option", { value: "Branch", children: "Branches" }), _jsx("option", { value: "Counter", children: "LR Counters" })] }), _jsxs("select", { value: action, onChange: (e) => { setAction(e.target.value); setPage(1); }, className: "bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "All Actions" }), _jsx("option", { value: "CREATE_USER", children: "Create User" }), _jsx("option", { value: "UPDATE_USER", children: "Update User" }), _jsx("option", { value: "CREATE_BRANCH", children: "Create Branch" }), _jsx("option", { value: "UPDATE_BRANCH", children: "Update Branch" }), _jsx("option", { value: "UPDATE_COUNTER", children: "Update Counter" }), _jsx("option", { value: "STATUS_CHANGE", children: "Status Change" })] })] })] }), _jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-50 border-b border-slate-100", children: [_jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Time" }), _jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "User" }), _jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Action" }), _jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Entity" }), _jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Details" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-50", children: loading ? (Array.from({ length: 5 }).map((_, i) => (_jsx("tr", { className: "animate-pulse", children: _jsx("td", { colSpan: 5, className: "px-6 py-4", children: _jsx("div", { className: "h-4 bg-slate-100 rounded" }) }) }, i)))) : logs.length > 0 ? (logs.map((log) => {
                                        var _a;
                                        return (_jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-500 text-sm", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), format(new Date(log.createdAt), "MMM d, h:mm a")] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600", children: _jsx(UserIcon, { className: "w-4 h-4" }) }), _jsx("div", { className: "text-sm font-bold text-slate-700", children: ((_a = log.userId) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown' })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-2.5 py-1 rounded-full text-[10px] font-black border ${getActionColor(log.action)}`, children: log.action }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-slate-600", children: [_jsx(Tag, { className: "w-3.5 h-3.5 text-slate-400" }), log.entityType] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-xs text-slate-500 font-medium max-w-[200px] truncate", children: JSON.stringify(log.newValue) }) })] }, log._id));
                                    })) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-slate-400 text-sm italic", children: "No logs found matching your filters." }) })) })] }) }), total > 20 && (_jsxs("div", { className: "px-6 py-4 border-t border-slate-50 flex items-center justify-between", children: [_jsx("button", { disabled: page === 1, onClick: () => setPage(p => p - 1), className: "text-sm font-bold text-slate-600 disabled:opacity-30", children: "Previous" }), _jsxs("span", { className: "text-sm font-bold text-slate-500", children: ["Page ", page, " of ", Math.ceil(total / 20)] }), _jsx("button", { disabled: page >= Math.ceil(total / 20), onClick: () => setPage(p => p + 1), className: "text-sm font-bold text-slate-600 disabled:opacity-30", children: "Next" })] }))] })] }));
}
