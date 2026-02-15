import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUsers } from "@/frontend/hooks/useUsers";
import { Users, Shield, Key, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useState } from "react";
import { adminService } from "@/frontend/services/adminService";
import { useToast } from "@/frontend/components/ui/toast";
export function UserManagement() {
    const { users } = useUsers();
    const { addToast } = useToast();
    const [resettingUser, setResettingUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleResetPassword = async () => {
        if (!resettingUser || !newPassword)
            return;
        if (newPassword.length < 6) {
            addToast("Password must be at least 6 characters", "error");
            return;
        }
        setIsSubmitting(true);
        const { error } = await adminService.resetPassword(resettingUser.id, newPassword);
        setIsSubmitting(false);
        if (error) {
            addToast("Failed to reset password: " + error.message, "error");
        }
        else {
            addToast("Password reset successfully for " + resettingUser.name, "success");
            setResettingUser(null);
            setNewPassword("");
        }
    };
    return (_jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsx("div", { className: "flex items-center justify-between pb-6 border-b border-slate-200", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-16 w-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white", children: _jsx(Users, { className: "w-8 h-8" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "User Management" }), _jsx("p", { className: "text-slate-500", children: "View system access and permissions (Managed via Admin Dashboard)" })] })] }) }), _jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "User Details" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Role" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm", children: "Branch" }), _jsx("th", { className: "px-6 py-4 font-semibold text-slate-500 text-sm text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: users.map(user => (_jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors group", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold", children: user.name.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-slate-800", children: user.name }), _jsxs("p", { className: "text-xs text-slate-400 font-mono", children: ["@", user.username] })] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide", user.role === 'SUPER_ADMIN'
                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                : "bg-blue-50 text-blue-700 border border-blue-200"), children: [user.role === 'SUPER_ADMIN' && _jsx(Shield, { className: "w-3 h-3" }), user.role] }) }), _jsx("td", { className: "px-6 py-4", children: user.branch ? (_jsx("span", { className: "text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md", children: user.branch })) : (_jsx("span", { className: "text-sm text-slate-400 italic", children: "All Branches" })) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsx("button", { onClick: () => setResettingUser(user), className: "p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all", title: "Reset Password", children: _jsx(Key, { className: "w-4 h-4" }) }) })] }, user.id))) })] }) }), resettingUser && (_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 flex items-center justify-between", children: [_jsx("h3", { className: "text-xl font-bold text-slate-800", children: "Reset Password" }), _jsx("button", { onClick: () => setResettingUser(null), className: "p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100", children: [_jsx(Shield, { className: "w-5 h-5 text-red-600" }), _jsxs("p", { className: "text-xs font-bold text-red-700 leading-tight", children: ["Attention: This will immediately change the password for ", resettingUser.name, " (", resettingUser.username, ")."] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 px-1", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), placeholder: "Min 6 characters...", className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "p-6 bg-slate-50 flex gap-3", children: [_jsx("button", { onClick: () => setResettingUser(null), className: "flex-1 px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleResetPassword, disabled: isSubmitting || newPassword.length < 6, className: "flex-[2] bg-slate-900 text-white rounded-xl py-3 px-4 text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100", children: isSubmitting ? "Updating..." : "Confirm & Change" })] })] }) }))] }));
}
