"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    PackageCheck,
    BarChart3,
    Settings,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/frontend/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    // { name: "New Booking", href: "/booking", icon: PlusCircle }, // Assuming Dashboard is Booking for now or separate?
    // User req: "Page 1: The Booking Dashboard (Home)" -> So Home is Booking.
    { name: "Inbound / Collection", href: "/inbound", icon: PackageCheck },
    { name: "Reports", href: "/reports", icon: BarChart3 },
];

import { useBranchStore } from "@/frontend/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser } = useBranchStore();

    return (
        <div className="w-64 h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col border-r border-slate-700/50 shadow-2xl">
            <div className="h-16 flex items-center px-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    SAVAN Logistics
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/20"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}

                {/* Super Admin Links */}
                {currentUser?.role === "SUPER_ADMIN" && (
                    <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Control</p>
                        <Link
                            href="/dashboard/super-admin"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                pathname === "/dashboard/super-admin"
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                    : "text-purple-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <Settings className="w-5 h-5" />
                            User Management
                        </Link>
                        <Link
                            href="/admin/report-permissions"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                pathname === "/admin/report-permissions"
                                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                                    : "text-indigo-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <ShieldAlert className="w-5 h-5" />
                            Report Visibility
                        </Link>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                <div className="bg-slate-800/50 rounded-lg p-3 backdrop-blur-sm border border-slate-700/50">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                </div>
            </div>
        </div>
    );
}
