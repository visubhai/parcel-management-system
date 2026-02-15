"use client";

import { useState, useEffect } from "react";
import { AdminList } from "@/super-admin/components/AdminList";
import { PermissionEditor } from "@/super-admin/components/PermissionEditor";
import { BranchManager } from "@/super-admin/components/BranchManager";
import { AdminOverview } from "@/super-admin/components/AdminOverview";
import { AuditLogViewer } from "@/super-admin/components/AuditLogViewer";
import { SettingsManager } from "@/super-admin/components/SettingsManager";
import { User } from "@/shared/types";
import { Plus, ShieldAlert, Users, Landmark, LayoutDashboard, History, Settings } from "lucide-react";
import { useBranchStore } from "@/frontend/lib/store";
import { cn } from "@/frontend/lib/utils";

type TabType = 'overview' | 'users' | 'branches' | 'audit' | 'settings';

export default function SuperAdminDashboard() {
    const { currentUser } = useBranchStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

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

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
        { id: 'users' as const, label: 'Users', icon: Users },
        { id: 'branches' as const, label: 'Branches', icon: Landmark },
        { id: 'audit' as const, label: 'Audit Logs', icon: History },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">System Console</h1>
                    <p className="text-slate-500 font-medium">Global administration and network configuration</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && <AdminOverview />}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                                <p className="text-slate-500 text-sm">Control staff access and permissions</p>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all"
                            >
                                <Plus className="w-5 h-5" /> New Admin
                            </button>
                        </div>
                        <AdminList onEdit={handleEdit} />
                    </div>
                )}

                {activeTab === 'branches' && <BranchManager />}

                {activeTab === 'audit' && <AuditLogViewer />}

                {activeTab === 'settings' && <SettingsManager />}
            </div>

            <PermissionEditor
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={selectedUser}
            />
        </div>
    );
}
