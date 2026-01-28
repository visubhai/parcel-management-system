import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { User, Shield, Trash2, Edit2, Plus, Users, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";

export function UserManagement() {
    const { users, currentUser, branches, addUser, updateUser, deleteUser, resetPassword } = useBranchStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

    // Form inputs
    const [formName, setFormName] = useState("");
    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formRole, setFormRole] = useState<Role>("BRANCH_USER");
    const [formBranch, setFormBranch] = useState("");

    const openAddModal = () => {
        setEditingUser(null);
        setFormName("");
        setFormUsername("");
        setFormPassword("");
        setFormRole("BRANCH_USER");
        setFormBranch(branches[0] || "");
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormName(user.name);
        setFormUsername(user.username);
        setFormPassword(""); // Don't show password
        setFormRole(user.role);
        setFormBranch(user.branch || branches[0] || "");
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formName || !formUsername) {
            alert("Name and Username are required");
            return;
        }

        if (editingUser) {
            // Update
            updateUser({
                ...editingUser as any,
                name: formName,
                username: formUsername,
                role: formRole,
                branch: formRole === 'SUPER_ADMIN' ? undefined : formBranch
            });
        } else {
            // Create
            if (!formPassword) {
                alert("Password is required for new users");
                return;
            }
            addUser({
                id: Date.now().toString(),
                name: formName,
                username: formUsername,
                password: formPassword,
                role: formRole,
                branch: formRole === 'SUPER_ADMIN' ? undefined : formBranch
            });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (id === currentUser?.id) {
            alert("You cannot delete yourself!");
            return;
        }
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
        }
    };

    const handleResetPassword = (id: string, name: string) => {
        if (confirm(`Reset password for ${name} to 'newpassword123'?`)) {
            resetPassword(id);
            alert("Password reset successfully.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                        <p className="text-slate-500">Control system access and permissions</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-sm">User Details</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Role</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Branch</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                        user.role === 'SUPER_ADMIN'
                                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                    )}>
                                        {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.branch ? (
                                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                            {user.branch}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">All Branches</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleResetPassword(user.id, user.name)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Reset Password"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {user.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name</label>
                                <input
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Username</label>
                                <input
                                    value={formUsername}
                                    onChange={e => setFormUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        value={formPassword}
                                        onChange={e => setFormPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Role</label>
                                <select
                                    value={formRole}
                                    onChange={e => setFormRole(e.target.value as Role)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                >
                                    <option value="BRANCH_USER">Branch User</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            {formRole === 'BRANCH_USER' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Assigned Branch</label>
                                    <select
                                        value={formBranch}
                                        onChange={e => setFormBranch(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                    >
                                        {branches.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                            >
                                {editingUser ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
