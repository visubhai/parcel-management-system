import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBranchStore } from "@/frontend/lib/store";
import { useUsers } from "@/frontend/hooks/useUsers";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { Shield, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function AdminList({ onEdit }) {
    const { currentUser } = useBranchStore();
    const { users, isLoading, mutate } = useUsers();
    // Filter to only show Admins (and Super Admins, but mainly we manage Admins)
    const admins = users.filter(u => u.role === 'BRANCH' || u.role === 'SUPER_ADMIN');
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to deactivate this admin?")) {
            // We use toggleStatus(false) instead of delete for safety, or implement delete in service
            // The store used 'deleteUser' which did soft delete (is_active=false)
            await adminService.toggleUserStatus(id, false);
            mutate(); // Refresh list
        }
    };
    if (isLoading)
        return _jsx("div", { className: "p-4 text-center text-slate-500", children: "Loading admins..." });
    return (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Admin" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Role" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Permissions" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Status" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: admins.map(user => {
                        var _a, _b, _c;
                        return (_jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold", children: user.name.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-slate-800", children: user.name }), _jsxs("p", { className: "text-xs text-slate-400 font-mono", children: ["@", user.username] })] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide", user.role === 'SUPER_ADMIN'
                                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"), children: [user.role === 'SUPER_ADMIN' && _jsx(Shield, { className: "w-3 h-3" }), user.role] }) }), _jsx("td", { className: "px-6 py-4", children: user.role === 'SUPER_ADMIN' ? (_jsx("span", { className: "text-xs text-slate-400 italic", children: "Full Access" })) : (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex flex-wrap gap-1", children: [(_a = user.allowedBranches) === null || _a === void 0 ? void 0 : _a.slice(0, 2).map(b => (_jsx("span", { className: "text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600", children: b }, b))), (((_b = user.allowedBranches) === null || _b === void 0 ? void 0 : _b.length) || 0) > 2 && (_jsxs("span", { className: "text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-400", children: ["+", user.allowedBranches.length - 2] }))] }), _jsxs("div", { className: "text-[10px] text-slate-400", children: [(((_c = user.allowedReports) === null || _c === void 0 ? void 0 : _c.length) || 0), " Reports Allowed"] })] })) }), _jsx("td", { className: "px-6 py-4", children: user.isActive ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold text-green-600", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), " Active"] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-bold text-slate-400", children: [_jsx(XCircle, { className: "w-3 h-3" }), " Inactive"] })) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => onEdit(user), className: "p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors", children: _jsx(Edit2, { className: "w-4 h-4" }) }), user.id !== (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) && user.role !== 'SUPER_ADMIN' && (_jsx("button", { onClick: () => handleDelete(user.id), className: "p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] }) })] }, user.id));
                    }) })] }) }));
}
