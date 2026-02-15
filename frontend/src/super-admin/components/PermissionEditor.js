import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { X, Check } from "lucide-react";
import { useToast } from "@/frontend/components/ui/toast";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { useUsers } from "@/frontend/hooks/useUsers";
const REPORT_TYPES = ["BOOKING_REPORT", "DELIVERY_REPORT", "LEDGER_REPORT", "SUMMARY_REPORT", "BOOKING_REPORT"];
export function PermissionEditor({ user, isOpen, onClose }) {
    const { branches } = useBranches();
    const { addToast } = useToast();
    const { mutate } = useUsers();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        email: "",
        role: "BRANCH",
        allowedBranches: [],
        allowedReports: [],
        isActive: true,
        branchId: ""
    });
    useEffect(() => {
        var _a;
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                password: "", // Reset password field on edit
                email: user.email || "",
                role: user.role || "BRANCH",
                allowedBranches: user.allowedBranches || [],
                allowedReports: user.allowedReports || [],
                isActive: (_a = user.isActive) !== null && _a !== void 0 ? _a : true,
                branchId: user.branchId || ""
            });
        }
    }, [user, isOpen]);
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let res;
            if (user === null || user === void 0 ? void 0 : user.id) {
                res = await adminService.updateUser(user.id, formData);
            }
            else {
                if (!formData.password) {
                    addToast("Password is required for new users", "error");
                    setIsLoading(false);
                    return;
                }
                res = await adminService.createUser(formData);
            }
            if (res.error) {
                addToast(res.error.message, "error");
            }
            else {
                addToast(user ? "User updated successfully" : "User created successfully", "success");
                mutate();
                onClose();
            }
        }
        catch (error) {
            addToast(error.message, "error");
        }
        finally {
            setIsLoading(false);
        }
    };
    const toggleBranch = (branch) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { allowedBranches: prev.allowedBranches.includes(branch)
                ? prev.allowedBranches.filter(b => b !== branch)
                : [...prev.allowedBranches, branch] })));
    };
    const toggleReport = (report) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { allowedReports: prev.allowedReports.includes(report)
                ? prev.allowedReports.filter(r => r !== report)
                : [...prev.allowedReports, report] })));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 flex justify-between items-center", children: [_jsx("h3", { className: "text-xl font-bold text-slate-800", children: user ? "Edit Admin Permissions" : "Create New Admin" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-slate-100 rounded-full text-slate-500", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 overflow-y-auto space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Full Name" }), _jsx("input", { value: formData.name, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Username" }), _jsx("input", { value: formData.username, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { username: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { email: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Password" }), _jsx("input", { type: "password", placeholder: user ? "Leave blank to keep current" : "Required", value: formData.password, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { password: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Status" }), _jsxs("div", { className: "flex items-center gap-4 mt-2", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", checked: formData.isActive, onChange: () => setFormData(Object.assign(Object.assign({}, formData), { isActive: true })), className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Active" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", checked: !formData.isActive, onChange: () => setFormData(Object.assign(Object.assign({}, formData), { isActive: false })), className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-500", children: "Inactive" })] })] })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Primary Branch (Belongs to)" }), _jsxs("select", { value: formData.branchId, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { branchId: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Select Primary Branch" }), branches.map((b) => (_jsx("option", { value: b._id, children: b.name }, b._id)))] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center justify-between", children: ["Allowed Branches", _jsxs("span", { className: "text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full", children: [formData.allowedBranches.length, " Selected"] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: branches.map((b) => (_jsxs("label", { className: `
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.allowedBranches.includes(b.name)
                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"}
                                    `, children: [_jsx("div", { className: `
                                        w-5 h-5 rounded-full flex items-center justify-center border
                                        ${formData.allowedBranches.includes(b.name)
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-white border-slate-300"}
                                    `, children: formData.allowedBranches.includes(b.name) && _jsx(Check, { className: "w-3 h-3" }) }), _jsx("input", { type: "checkbox", className: "hidden", checked: formData.allowedBranches.includes(b.name), onChange: () => toggleBranch(b.name) }), _jsx("span", { className: `text-sm font-bold ${formData.allowedBranches.includes(b.name) ? "text-blue-800" : "text-slate-600"}`, children: b.name })] }, b._id))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-xs font-bold text-slate-500 uppercase flex items-center justify-between", children: ["Allowed Reports", _jsxs("span", { className: "text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full", children: [formData.allowedReports.length, " Selected"] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: REPORT_TYPES.map(report => (_jsxs("label", { className: `
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.allowedReports.includes(report)
                                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"}
                                    `, children: [_jsx("div", { className: `
                                        w-5 h-5 rounded-full flex items-center justify-center border
                                        ${formData.allowedReports.includes(report)
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "bg-white border-slate-300"}
                                    `, children: formData.allowedReports.includes(report) && _jsx(Check, { className: "w-3 h-3" }) }), _jsx("input", { type: "checkbox", className: "hidden", checked: formData.allowedReports.includes(report), onChange: () => toggleReport(report) }), _jsx("span", { className: `text-sm font-bold ${formData.allowedReports.includes(report) ? "text-indigo-800" : "text-slate-600"}`, children: report.replace('_REPORT', '').replace('_', ' ') })] }, report))) })] })] }), _jsxs("div", { className: "p-6 border-t border-slate-100 flex gap-4", children: [_jsx("button", { onClick: onClose, className: "flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleSubmit, className: "flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-900/10", children: "Save Permissions" })] })] }) }));
}
