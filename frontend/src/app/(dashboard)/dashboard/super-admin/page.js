"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AdminList } from "@/frontend/super-admin/components/AdminList";
import { PermissionEditor } from "@/frontend/super-admin/components/PermissionEditor";
import { BranchManager } from "@/frontend/super-admin/components/BranchManager";
import { AdminOverview } from "@/frontend/super-admin/components/AdminOverview";
import { AuditLogViewer } from "@/frontend/super-admin/components/AuditLogViewer";
import { SettingsManager } from "@/frontend/super-admin/components/SettingsManager";
import { Plus, ShieldAlert, Users, Landmark, LayoutDashboard, History, Settings } from "lucide-react";
import { useBranchStore } from "@/frontend/lib/store";
import { cn } from "@/frontend/lib/utils";
export default function SuperAdminDashboard() {
    const { currentUser } = useBranchStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    // Access Control
    if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'SUPER_ADMIN') {
        return (_jsxs("div", { className: "h-screen flex flex-col items-center justify-center p-4", children: [_jsx(ShieldAlert, { className: "w-16 h-16 text-red-500 mb-4" }), _jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Access Denied" }), _jsx("p", { className: "text-slate-500 mt-2", children: "You do not have permission to view this page." })] }));
    }
    const handleCreate = () => {
        setSelectedUser(null);
        setIsEditOpen(true);
    };
    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };
    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'branches', label: 'Branches', icon: Landmark },
        { id: 'audit', label: 'Audit Logs', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-4 md:p-8", children: [_jsxs("header", { className: "flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 tracking-tight mb-2", children: "System Console" }), _jsx("p", { className: "text-slate-500 font-medium", children: "Global administration and network configuration" })] }), _jsx("div", { className: "flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar", children: tabs.map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap", activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"), children: [_jsx(tab.icon, { className: "w-4 h-4" }), " ", tab.label] }, tab.id))) })] }), _jsxs("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: [activeTab === 'overview' && _jsx(AdminOverview, {}), activeTab === 'users' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "User Management" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Control staff access and permissions" })] }), _jsxs("button", { onClick: handleCreate, className: "bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all", children: [_jsx(Plus, { className: "w-5 h-5" }), " New Admin"] })] }), _jsx(AdminList, { onEdit: handleEdit })] })), activeTab === 'branches' && _jsx(BranchManager, {}), activeTab === 'audit' && _jsx(AuditLogViewer, {}), activeTab === 'settings' && _jsx(SettingsManager, {})] }), _jsx(PermissionEditor, { isOpen: isEditOpen, onClose: () => setIsEditOpen(false), user: selectedUser })] }));
}
