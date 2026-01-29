import { useState, useEffect } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { User, Role, ReportType, Branch } from "@/shared/types";
import { X, Check } from "lucide-react";

interface PermissionEditorProps {
    user: Partial<User> | null;
    isOpen: boolean;
    onClose: () => void;
}

const REPORT_TYPES: ReportType[] = ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"];

export function PermissionEditor({ user, isOpen, onClose }: PermissionEditorProps) {
    const { branches } = useBranches();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        role: "ADMIN" as Role,
        allowedBranches: [] as Branch[],
        allowedReports: [] as ReportType[],
        isActive: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                password: "", // Reset password field on edit
                role: user.role || "ADMIN",
                allowedBranches: user.allowedBranches || [],
                allowedReports: user.allowedReports || [],
                isActive: user.isActive ?? true
            });
        } else {
            setFormData({
                name: "",
                username: "",
                password: "",
                role: "ADMIN",
                allowedBranches: [],
                allowedReports: [],
                isActive: true
            });
        }
    }, [user, isOpen]);

    const handleSubmit = () => {
        alert("Permission updates are currently managed via the Database/Admin API.");
        onClose();
    };

    const toggleBranch = (branch: Branch) => {
        setFormData(prev => ({
            ...prev,
            allowedBranches: prev.allowedBranches.includes(branch)
                ? prev.allowedBranches.filter(b => b !== branch)
                : [...prev.allowedBranches, branch]
        }));
    };

    const toggleReport = (report: ReportType) => {
        setFormData(prev => ({
            ...prev,
            allowedReports: prev.allowedReports.includes(report)
                ? prev.allowedReports.filter(r => r !== report)
                : [...prev.allowedReports, report]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">
                        {user ? "Edit Admin Permissions" : "Create New Admin"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                            <input
                                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                            <input
                                type="password"
                                placeholder={user ? "Leave blank to keep current" : "Required"}
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={formData.isActive}
                                        onChange={() => setFormData({ ...formData, isActive: true })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!formData.isActive}
                                        onChange={() => setFormData({ ...formData, isActive: false })}
                                        className="w-4 h-4 text-slate-400"
                                    />
                                    <span className="text-sm font-medium text-slate-500">Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Branch Permissions */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                            Allowed Branches
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                {formData.allowedBranches.length} Selected
                            </span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {branches.map(branch => (
                                <label
                                    key={branch}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.allowedBranches.includes(branch)
                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center border
                                        ${formData.allowedBranches.includes(branch)
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-white border-slate-300"
                                        }
                                    `}>
                                        {formData.allowedBranches.includes(branch) && <Check className="w-3 h-3" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.allowedBranches.includes(branch)}
                                        onChange={() => toggleBranch(branch)}
                                    />
                                    <span className={`text-sm font-bold ${formData.allowedBranches.includes(branch) ? "text-blue-800" : "text-slate-600"}`}>
                                        {branch}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Report Permissions */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                            Allowed Reports
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {formData.allowedReports.length} Selected
                            </span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {REPORT_TYPES.map(report => (
                                <label
                                    key={report}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.allowedReports.includes(report)
                                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center border
                                        ${formData.allowedReports.includes(report)
                                            ? "bg-indigo-600 border-indigo-600 text-white"
                                            : "bg-white border-slate-300"
                                        }
                                    `}>
                                        {formData.allowedReports.includes(report) && <Check className="w-3 h-3" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.allowedReports.includes(report)}
                                        onChange={() => toggleReport(report)}
                                    />
                                    <span className={`text-sm font-bold ${formData.allowedReports.includes(report) ? "text-indigo-800" : "text-slate-600"}`}>
                                        {report}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-900/10"
                    >
                        Save Permissions
                    </button>
                </div>
            </div>
        </div>
    );
}
