"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { ProfileSettings } from "@/frontend/components/settings/ProfileSettings";
import { UserManagement } from "@/frontend/components/settings/UserManagement";
import { BranchManagement } from "@/frontend/components/settings/BranchManagement";
import { AuditLogTable } from "@/frontend/components/settings/AuditLogTable";
import { User, Users, Building2, History } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
export default function SettingsPage() {
    const { currentUser } = useBranchStore();
    const [activeTab, setActiveTab] = useState("profile");
    const tabs = [
        { id: "profile", label: "Profile Settings", icon: User, adminOnly: false },
        { id: "users", label: "User Management", icon: Users, adminOnly: true },
        { id: "branches", label: "Branch Management", icon: Building2, adminOnly: true },
        { id: "logs", label: "Audit Logs", icon: History, adminOnly: true },
    ];
    const filteredTabs = tabs.filter(t => !t.adminOnly || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN');
    return (_jsx("main", { className: "min-h-screen bg-slate-50/50 p-6 lg:p-12 mb-24", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 tracking-tight", children: "Settings" }), _jsx("p", { className: "text-slate-500 font-medium", children: "Manage your account and preferences" })] }), _jsxs("div", { className: "flex flex-col lg:flex-row gap-8", children: [_jsx("div", { className: "lg:w-72 flex-shrink-0", children: _jsx("div", { className: "bg-white rounded-2xl p-2 border border-slate-200 shadow-sm sticky top-6", children: _jsx("nav", { className: "space-y-1", children: filteredTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200", isActive
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"), children: [_jsx(Icon, { className: cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600") }), tab.label] }, tab.id));
                                    }) }) }) }), _jsxs("div", { className: "flex-1", children: [activeTab === 'profile' && _jsx(ProfileSettings, {}), activeTab === 'users' && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN' && _jsx(UserManagement, {}), activeTab === 'branches' && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN' && _jsx(BranchManagement, {}), activeTab === 'logs' && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'SUPER_ADMIN' && _jsx(AuditLogTable, {})] })] })] }) }));
}
