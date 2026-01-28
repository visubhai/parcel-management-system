"use client";

import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { User, Shield, Key, Plus, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role, Branch } from "@/lib/types";
import { BranchManager } from "@/components/admin/BranchManager";

export default function AdminPage() {
    const { users, currentUser, addUser, resetPassword, branches } = useBranchStore();
    const [activeTab, setActiveTab] = useState<"users" | "branches">("users");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState<{ name: string, username: string, role: Role, branch: Branch }>({
        name: "",
        username: "",
        role: "BRANCH_USER",
        branch: branches[0] || ""
    });

    if (currentUser?.role !== "SUPER_ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-slate-400">
                <Shield className="w-16 h-16 mb-4 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-600">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleCreateUser = () => {
        if (!newUser.name || !newUser.username) return;

        addUser({
            id: Math.random().toString(36).substr(2, 9),
            name: newUser.name,
            username: newUser.username,
            role: newUser.role,
            branch: newUser.role === "BRANCH_USER" ? newUser.branch : undefined,
            password: "password123" // Default password
        });

        setIsAddModalOpen(false);
        setNewUser({ name: "", username: "", role: "BRANCH_USER", branch: branches[0] || "" });
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        Admin Panel
                    </h1>
                    <p className="text-slate-500 font-medium ml-1">System Configuration & Access Control</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                            activeTab === "users"
                                ? "bg-slate-800 text-white shadow-md"
                                : "text-slate-500 hover:bg-slate-50 hoer:text-slate-700"
                        )}
                    >
                        <Users className="w-4 h-4" /> Users
                    </button>
                    <button
                        onClick={() => setActiveTab("branches")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                            activeTab === "branches"
                                ? "bg-teal-600 text-white shadow-md"
                                : "text-slate-500 hover:bg-slate-50 hoer:text-slate-700"
                        )}
                    >
                        <Building2 className="w-4 h-4" /> Branches
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === "branches" ? (
                <BranchManager />
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                User Management
                            </h2>
                            <p className="text-slate-500 text-sm">Manage access credentials</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" /> Add User
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-200/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">User</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Role</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Branch Access</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{user.name}</p>
                                                    <p className="text-xs text-slate-400">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                user.role === "SUPER_ADMIN"
                                                    ? "bg-purple-50 text-purple-700 border-purple-100"
                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                            )}>
                                                {user.role.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.role === "SUPER_ADMIN" ? (
                                                <span className="text-slate-400 italic">Global Access</span>
                                            ) : (
                                                user.branch
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => resetPassword(user.id)}
                                                className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center justify-end gap-1 ml-auto"
                                            >
                                                <Key className="w-3.5 h-3.5" /> Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Create New User</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
                                    >
                                        <option value="BRANCH_USER">Branch User</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                    </select>
                                </div>
                                {newUser.role === "BRANCH_USER" && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Branch</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                                            value={newUser.branch}
                                            onChange={e => setNewUser({ ...newUser, branch: e.target.value as Branch })}
                                        >
                                            {branches.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    className="flex-1 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
                                >
                                    Create User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
