import { useState } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { adminService } from "@/super-admin/services/adminService";
import { useToast } from "@/frontend/components/ui/toast";
import { Plus, Edit2, MapPin, Building2, CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

export function BranchManager() {
    const { branchObjects, loading, refresh } = useBranches();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        branchCode: "",
        state: "",
        address: "",
        phone: "",
        isActive: true
    });

    const openModal = (branch: any = null) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                branchCode: branch.branchCode,
                state: branch.state || "",
                address: branch.address || "",
                phone: branch.phone || "",
                isActive: branch.isActive ?? true
            });
        } else {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let res;
            if (editingBranch) {
                res = await adminService.updateBranch(editingBranch._id, formData);
            } else {
                res = await adminService.createBranch(formData);
            }

            if (res.error) {
                addToast(res.error.message, "error");
            } else {
                addToast(editingBranch ? "Branch updated" : "Branch created", "success");
                refresh();
                setIsModalOpen(false);
            }
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !branchObjects.length) return <div className="p-8 text-center text-slate-500">Loading branches...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Branch Management</h2>
                    <p className="text-slate-500 text-sm">Create and manage your logistics network</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" /> Add Branch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branchObjects.map((branch: any) => (
                    <div key={branch._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                    {branch.branchCode}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{branch.name}</h3>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{branch.state}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => openModal(branch)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{branch.address || "No address provided"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span>{branch.phone || "No contact info"}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className={cn(
                                "flex items-center gap-1.5 text-xs font-bold",
                                branch.isActive ? "text-green-600" : "text-slate-400"
                            )}>
                                {branch.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {branch.isActive ? "ACTIVE" : "INACTIVE"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{editingBranch ? "Edit Branch" : "Add New Branch"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Branch Name</label>
                                    <input
                                        required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Branch Code</label>
                                    <input
                                        required
                                        value={formData.branchCode} onChange={e => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                                <input
                                    required
                                    value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                <input
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                <textarea
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="branchActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="branchActive" className="text-sm font-bold text-slate-700">Active Branch</label>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Branch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
