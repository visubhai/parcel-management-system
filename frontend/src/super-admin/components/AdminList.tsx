import { useState } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { useUsers } from "@/frontend/hooks/useUsers";
import { adminService } from "@/frontend/super-admin/services/adminService";
import { User, Shield, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

interface AdminListProps {
    onEdit: (user: any) => void;
}

export function AdminList({ onEdit }: AdminListProps) {
    const { currentUser } = useBranchStore();
    const { users, isLoading, mutate } = useUsers();

    // Filter to only show Admins (and Super Admins, but mainly we manage Admins)
    const admins = users.filter(u => u.role === 'BRANCH' || u.role === 'SUPER_ADMIN');

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to deactivate this admin?")) {
            // We use toggleStatus(false) instead of delete for safety, or implement delete in service
            // The store used 'deleteUser' which did soft delete (is_active=false)
            await adminService.toggleUserStatus(id, false);
            mutate(); // Refresh list
        }
    };

    if (isLoading) return <div className="p-4 text-center text-slate-500">Loading admins...</div>;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Admin</th>
                        <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Role</th>
                        <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Permissions</th>
                        <th className="px-6 py-4 font-semibold text-slate-500 text-sm">Status</th>
                        <th className="px-6 py-4 font-semibold text-slate-500 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {admins.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
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
                                {user.role === 'SUPER_ADMIN' ? (
                                    <span className="text-xs text-slate-400 italic">Full Access</span>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap gap-1">
                                            {user.allowedBranches?.slice(0, 2).map(b => (
                                                <span key={b} className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{b}</span>
                                            ))}
                                            {(user.allowedBranches?.length || 0) > 2 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-400">+{user.allowedBranches!.length - 2}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {(user.allowedReports?.length || 0)} Reports Allowed
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {user.isActive ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                                        <CheckCircle className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                                        <XCircle className="w-3 h-3" /> Inactive
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {user.id !== currentUser?.id && user.role !== 'SUPER_ADMIN' && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    );
}
