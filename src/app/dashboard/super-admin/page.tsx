"use client";

import { useState, useEffect } from "react";
import { AdminList } from "@/components/super-admin/AdminList";
import { PermissionEditor } from "@/components/super-admin/PermissionEditor";
import { User } from "@/lib/types";
import { Plus, ShieldAlert } from "lucide-react";
import { useBranchStore } from "@/lib/store";

export default function SuperAdminDashboard() {
    const { currentUser } = useBranchStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);

    // Initial fetch handled by AdminList or SWR in future. 
    // For now we just check auth.
    useEffect(() => {
        // Validation check
    }, [currentUser]);

    // Access Control
    if (currentUser?.role !== 'SUPER_ADMIN') {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleCreate = () => {
        setSelectedUser(null);
        setIsEditOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Control</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage admin roles, branch access, and report visibility</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/20"
                >
                    <Plus className="w-5 h-5" />
                    New Admin
                </button>
            </div>

            <AdminList onEdit={handleEdit} />

            <PermissionEditor
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={selectedUser}
            />
        </div>
    );
}
