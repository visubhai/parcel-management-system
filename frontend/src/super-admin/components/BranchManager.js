import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { useToast } from "@/frontend/components/ui/toast";
import { Plus, Edit2, MapPin, Building2, CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export function BranchManager() {
    const { branchObjects, loading, refresh } = useBranches();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        branchCode: "",
        state: "",
        address: "",
        phone: "",
        isActive: true
    });
    const openModal = (branch = null) => {
        var _a;
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                branchCode: branch.branchCode,
                state: branch.state || "",
                address: branch.address || "",
                phone: branch.phone || "",
                isActive: (_a = branch.isActive) !== null && _a !== void 0 ? _a : true
            });
        }
        else {
            setEditingBranch(null);
            setFormData({
                name: "",
                branchCode: "",
                state: "",
                address: "",
                phone: "",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let res;
            if (editingBranch) {
                res = await adminService.updateBranch(editingBranch._id, formData);
            }
            else {
                res = await adminService.createBranch(formData);
            }
            if (res.error) {
                addToast(res.error.message, "error");
            }
            else {
                addToast(editingBranch ? "Branch updated" : "Branch created", "success");
                refresh();
                setIsModalOpen(false);
            }
        }
        catch (error) {
            addToast(error.message, "error");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (loading && !branchObjects.length)
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading branches..." });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "Branch Management" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Create and manage your logistics network" })] }), _jsxs("button", { onClick: () => openModal(), className: "bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20", children: [_jsx(Plus, { className: "w-5 h-5" }), " Add Branch"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: branchObjects.map((branch) => (_jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all group", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold", children: branch.branchCode }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-800", children: branch.name }), _jsx("p", { className: "text-xs text-slate-400 uppercase font-bold tracking-wider", children: branch.state })] })] }), _jsx("button", { onClick: () => openModal(branch), className: "p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all", children: _jsx(Edit2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [_jsx(MapPin, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "truncate", children: branch.address || "No address provided" })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-600", children: [_jsx(Building2, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { children: branch.phone || "No contact info" })] })] }), _jsx("div", { className: "flex items-center justify-between pt-4 border-t border-slate-50", children: _jsxs("div", { className: cn("flex items-center gap-1.5 text-xs font-bold", branch.isActive ? "text-green-600" : "text-slate-400"), children: [branch.isActive ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(XCircle, { className: "w-4 h-4" }), branch.isActive ? "ACTIVE" : "INACTIVE"] }) })] }, branch._id))) }), isModalOpen && (_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 flex justify-between items-center", children: [_jsx("h3", { className: "text-xl font-bold text-slate-800", children: editingBranch ? "Edit Branch" : "Add New Branch" }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-2 hover:bg-slate-100 rounded-full text-slate-500", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Branch Name" }), _jsx("input", { required: true, value: formData.name, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Branch Code" }), _jsx("input", { required: true, value: formData.branchCode, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { branchCode: e.target.value.toUpperCase() })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "State" }), _jsx("input", { required: true, value: formData.state, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { state: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Phone" }), _jsx("input", { value: formData.phone, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { phone: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase", children: "Address" }), _jsx("textarea", { value: formData.address, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { address: e.target.value })), className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "branchActive", checked: formData.isActive, onChange: e => setFormData(Object.assign(Object.assign({}, formData), { isActive: e.target.checked })), className: "w-4 h-4 text-blue-600 rounded" }), _jsx("label", { htmlFor: "branchActive", className: "text-sm font-bold text-slate-700", children: "Active Branch" })] }), _jsxs("div", { className: "pt-4 flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl", children: "Cancel" }), _jsx("button", { disabled: isSubmitting, type: "submit", className: "flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50", children: isSubmitting ? "Saving..." : "Save Branch" })] })] })] }) }))] }));
}
