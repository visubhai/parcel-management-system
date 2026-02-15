"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/frontend/components/layout/Sidebar";
import { Header } from "@/frontend/components/layout/Header";
import { useBranchStore } from "@/frontend/lib/store";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Added
import { GlobalErrorBoundary } from "@/frontend/components/GlobalErrorBoundary";
import { ToastProvider } from "@/frontend/components/ui/toast";
import { SessionProvider } from "next-auth/react"; // Ideally wrap with this
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export default function RootLayout({ children, }) {
    const { currentUser, checkSession } = useBranchStore(); // Added checkSession
    const pathname = usePathname(); // Get current path
    const [mounted, setMounted] = useState(false);
    // Prevent hydration mismatch & Check Session
    useEffect(() => {
        setMounted(true);
        checkSession(); // Hydrate session on mount
    }, [checkSession]);
    const isAuthPage = (pathname === null || pathname === void 0 ? void 0 : pathname.startsWith("/login")) || (pathname === null || pathname === void 0 ? void 0 : pathname.startsWith("/register"));
    return (_jsx("html", { lang: "en", children: _jsx("body", { suppressHydrationWarning: true, className: `${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`, children: _jsx(GlobalErrorBoundary, { children: _jsx(ToastProvider, { children: _jsx(SessionProvider, { children: !mounted ? null : (isAuthPage ? (
                        // Render children directly for auth pages (no sidebar/header)
                        _jsx("main", { className: "h-screen w-full", children: children })) : (
                        // Render dashboard layout for other pages
                        _jsxs("div", { className: "flex h-screen overflow-hidden", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto p-4 md:p-6", children: children })] })] }))) }) }) }) }) }));
}
