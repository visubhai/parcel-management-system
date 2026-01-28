"use client";

import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { Plus, Trash2, MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BranchManager() {
    const { branches, addBranch, removeBranch, currentBranch, addUser } = useBranchStore();
    const [newBranchName, setNewBranchName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddBranch = () => {
        if (!newBranchName.trim() || !username.trim() || !password.trim()) {
            alert("All fields are required!");
            return;
        }

        // Prevent duplicates
        if (branches.includes(newBranchName)) {
            alert("Branch already exists!");
            return;
        }

        addBranch(newBranchName);

        // Auto-create user for this branch
        addUser({
            id: Math.random().toString(36).substr(2, 9),
            name: `${newBranchName} Manager`,
            username: username,
            password: password,
            role: "BRANCH_USER",
            branch: newBranchName
        });

        setNewBranchName("");
        setUsername("");
        setPassword("");
        setIsAdding(false);
    };

    const handleDelete = (branch: string) => {
        if (branch === currentBranch) {
            alert("Cannot delete the currently active branch!");
            return;
        }
        if (confirm(`Are you sure you want to delete ${branch}? This will also delete associated users.`)) {
            removeBranch(branch);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-600" />
                        Branch Management
                    </h2>
                    <p className="text-slate-500 text-sm">Add or remove system branches</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-teal-500/20"
                >
                    <Plus className="w-4 h-4" /> Add Branch
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Branch Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {branches.map((branch) => (
                            <tr key={branch} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-slate-800">{branch}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(branch)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Branch"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {branches.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        No branches found. Add one to get started.
                    </div>
                )}
            </div>

            {/* Add Branch Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Branch</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-bold"
                                    placeholder="e.g. Branch C"
                                    value={newBranchName}
                                    onChange={e => setNewBranchName(e.target.value)}
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase">Create Branch Admin</p>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                                        placeholder="e.g. branch_c_admin"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddBranch}
                                    className="flex-1 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium"
                                >
                                    Add Branch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
