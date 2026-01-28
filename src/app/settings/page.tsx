"use client";

import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { BranchManagement } from "@/components/settings/BranchManagement";
import { User, Users, Building2, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { currentUser } = useBranchStore();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile Settings", icon: User, adminOnly: false },
        { id: "users", label: "User Management", icon: Users, adminOnly: true },
        { id: "branches", label: "Branch Management", icon: Building2, adminOnly: true },
        // { id: "system", label: "System", icon: SettingsIcon, adminOnly: true }, // Placeholder for future
    ];

    const filteredTabs = tabs.filter(t => !t.adminOnly || currentUser?.role === 'SUPER_ADMIN');

    return (
        <main className="min-h-screen bg-slate-50/50 p-6 lg:p-12 mb-24">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Page Title */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your account and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm sticky top-6">
                            <nav className="space-y-1">
                                {filteredTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200",
                                                isActive
                                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'users' && currentUser?.role === 'SUPER_ADMIN' && <UserManagement />}
                        {activeTab === 'branches' && currentUser?.role === 'SUPER_ADMIN' && <BranchManagement />}
                    </div>
                </div>
            </div>
        </main>
    );
}
