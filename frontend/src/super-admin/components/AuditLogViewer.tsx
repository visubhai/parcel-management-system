import { useState, useEffect } from "react";
import { adminService } from "@/super-admin/services/adminService";
import { History, Search, Filter, Calendar, User as UserIcon, Tag } from "lucide-react";
import { format } from "date-fns";

export function AuditLogViewer() {
    const [logs, setLogs] = useState<any[]>([]);
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

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'bg-green-50 text-green-700 border-green-200';
        if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Audit Logs</h2>
                    <p className="text-slate-500 text-sm">Monitor all administrative actions and changes</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        value={entityType}
                        onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">All Entities</option>
                        <option value="Booking">Bookings</option>
                        <option value="User">Users</option>
                        <option value="Branch">Branches</option>
                        <option value="Counter">LR Counters</option>
                    </select>

                    <select
                        value={action}
                        onChange={(e) => { setAction(e.target.value); setPage(1); }}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE_USER">Create User</option>
                        <option value="UPDATE_USER">Update User</option>
                        <option value="CREATE_BRANCH">Create Branch</option>
                        <option value="UPDATE_BRANCH">Update Branch</option>
                        <option value="UPDATE_COUNTER">Update Counter</option>
                        <option value="STATUS_CHANGE">Status Change</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(log.createdAt), "MMM d, h:mm a")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <div className="text-sm font-bold text-slate-700">{log.userId?.name || 'Unknown'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Tag className="w-3.5 h-3.5 text-slate-400" />
                                                {log.entityType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-500 font-medium max-w-[200px] truncate">
                                                {JSON.stringify(log.newValue)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                        No logs found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {total > 20 && (
                    <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="text-sm font-bold text-slate-600 disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
                        <button
                            disabled={page >= Math.ceil(total / 20)}
                            onClick={() => setPage(p => p + 1)}
                            className="text-sm font-bold text-slate-600 disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
