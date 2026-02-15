import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { User, Lock, Save, UserCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function ProfileSettings() {
    const { currentUser } = useBranchStore();
    const [name, setName] = useState((currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) || "");
    const [message, setMessage] = useState(null);
    const handleUpdateProfile = () => {
        setMessage({ type: 'error', text: 'Profile updates are disabled in this version.' });
    };
    const handleChangePassword = () => {
        setMessage({ type: 'error', text: 'Please contact Super Admin to reset password.' });
    };
    if (!currentUser)
        return null;
    return (_jsxs("div", { className: "space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500", children: [_jsxs("div", { className: "flex items-center gap-4 pb-6 border-b border-slate-200", children: [_jsx("div", { className: "h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white", children: _jsx(UserCircle, { className: "w-8 h-8" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "My Profile" }), _jsx("p", { className: "text-slate-500", children: "Manage your personal details and security" })] })] }), message && (_jsx("div", { className: cn("p-4 rounded-xl border flex items-center gap-3", message.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"), children: message.text })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-800 flex items-center gap-2", children: [_jsx(User, { className: "w-5 h-5 text-blue-500" }), "Personal Information"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-600 mb-1.5", children: "Username (Read Only)" }), _jsx("input", { type: "text", value: currentUser.username, disabled: true, className: "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-600 mb-1.5", children: "Full Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), disabled: true, className: "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" })] }), _jsx("div", { className: "pt-2", children: _jsxs("button", { onClick: handleUpdateProfile, disabled: true, className: "w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed", children: [_jsx(Save, { className: "w-4 h-4" }), "Save Changes"] }) })] })] }), currentUser.role === 'SUPER_ADMIN' && (_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-800 flex items-center gap-2", children: [_jsx(Lock, { className: "w-5 h-5 text-indigo-500" }), "Security"] }), _jsx("div", { className: "p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm", children: "Password changes are currently managed via Admin Dashboard." })] }))] })] }));
}
