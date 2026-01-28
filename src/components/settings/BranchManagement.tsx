import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { MapPin, Plus, Trash2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BranchManagement() {
    const { branches, addBranch, removeBranch, bookings } = useBranchStore();
    const [newBranch, setNewBranch] = useState("");

    const handleAddBranch = () => {
        if (!newBranch.trim()) return;
        if (branches.includes(newBranch.trim())) {
            alert("Branch already exists!");
            return;
        }
        addBranch(newBranch.trim());
        setNewBranch("");
    };

    const handleRemoveBranch = (branch: string) => {
        // Check if branch has bookings
        const hasBookings = bookings.some(b => b.fromBranch === branch || b.toBranch === branch);
        if (hasBookings) {
            alert("Cannot delete this branch because it has existing bookings associated with it.");
            return;
        }
        if (confirm(`Are you sure you want to delete ${branch}?`)) {
            removeBranch(branch);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 mb-8">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                    <Building2 className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Branch Management</h2>
                    <p className="text-slate-500">Add or remove operating branches</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Branch */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-orange-500" />
                            Add New Branch
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Branch Name</label>
                                <input
                                    type="text"
                                    value={newBranch}
                                    onChange={(e) => setNewBranch(e.target.value)}
                                    placeholder="e.g. Mumbai Hub"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleAddBranch}
                                disabled={!newBranch.trim()}
                                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create Branch
                            </button>
                        </div>
                    </div>
                </div>

                {/* Branch List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 px-1">Active Branches ({branches.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {branches.map((branch) => (
                            <div key={branch} className="group relative bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{branch}</h4>
                                            <p className="text-xs text-slate-400 font-medium">Active Hub</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBranch(branch)}
                                        className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove Branch"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
