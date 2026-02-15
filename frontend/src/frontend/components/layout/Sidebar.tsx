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

import { useState } from "react";
import { useBranchStore } from "@/frontend/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser, isMobileMenuOpen, closeMobileMenu } = useBranchStore();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={closeMobileMenu}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-300 ease-in-out z-50 print:hidden",
                    "fixed lg:relative inset-y-0 left-0", // Mobile Positioning
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", // Mobile Toggle
                    // Width Logic: Mobile always 64 (full), Desktop varies
                    "w-64",
                    isHovered ? "lg:w-64" : "lg:w-20"
                )}
            >
                {/* Abstract Background Patterns - Matches Login Page */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
                </div>

                <div className="relative z-10 h-full flex flex-col">

                    <div className="h-20 flex items-center px-6 border-b border-white/5 bg-transparent shrink-0 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                {/* Simple Logo Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M10 17h4V5H10v12h0zM3 17h4V8H3v9h0zM17 17h4v-5h-4v5h0z" /></svg>
                            </div>
                            <h1 className={cn(
                                "text-lg font-bold tracking-tight text-white transition-opacity duration-300 whitespace-nowrap",
                                isHovered ? "opacity-100" : "lg:opacity-0 lg:w-0 opacity-100"
                            )}>
                                SAVAN <span className="text-blue-400">Logistics</span>
                            </h1>
                        </div>
                    </div>

                    <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-6 h-6 shrink-0" />
                                    <span className={cn(
                                        "transition-all duration-300 whitespace-nowrap",
                                        isHovered ? "opacity-100 translate-x-0" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 opacity-100 translate-x-0"
                                    )}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Super Admin Links */}
                        {currentUser?.role === "SUPER_ADMIN" && (
                            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                                <p className={cn(
                                    "px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300 whitespace-nowrap",
                                    isHovered ? "opacity-100" : "lg:opacity-0 lg:hidden opacity-100"
                                )}>
                                    Admin Control
                                </p>

                                <Link
                                    href="/dashboard/super-admin"
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                                        pathname === "/dashboard/super-admin"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                            : "text-indigo-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Settings className="w-6 h-6 shrink-0" />
                                    <span className={cn(
                                        "transition-all duration-300 whitespace-nowrap",
                                        isHovered ? "opacity-100 translate-x-0" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 opacity-100 translate-x-0"
                                    )}>
                                        User Management
                                    </span>
                                </Link>
                                <Link
                                    href="/dashboard/super-admin/permissions"
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                                        pathname === "/dashboard/super-admin/permissions"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                            : "text-indigo-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <ShieldAlert className="w-6 h-6 shrink-0" />
                                    <span className={cn(
                                        "transition-all duration-300 whitespace-nowrap",
                                        isHovered ? "opacity-100 translate-x-0" : "lg:opacity-0 lg:-translate-x-4 lg:w-0 opacity-100 translate-x-0"
                                    )}>
                                        Report Visibility
                                    </span>
                                </Link>
                            </div>
                        )}
                    </nav>

                    <div className="p-3 border-t border-white/5 overflow-hidden">
                        <div className={cn(
                            "bg-white/5 rounded-xl p-2 backdrop-blur-md border border-white/10 flex items-center transition-all duration-300",
                            isHovered ? "gap-3" : "lg:justify-center lg:gap-0 gap-3 justify-start"
                        )}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10 shrink-0">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div className={cn(
                                "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
                                isHovered ? "opacity-100 w-auto" : "lg:opacity-0 lg:w-0 opacity-100 w-auto"
                            )}>
                                <p className="text-xs text-slate-400">Logged in as</p>
                                <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
