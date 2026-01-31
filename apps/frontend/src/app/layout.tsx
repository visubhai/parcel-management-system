"use client";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser, checkSession } = useBranchStore(); // Added checkSession
  const pathname = usePathname(); // Get current path
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch & Check Session
  useEffect(() => {
    setMounted(true);
    checkSession(); // Hydrate session on mount
  }, [checkSession]);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <GlobalErrorBoundary>
          <ToastProvider>
            <SessionProvider>
              {!mounted ? null : (
                isAuthPage ? (
                  // Render children directly for auth pages (no sidebar/header)
                  <main className="h-screen w-full">
                    {children}
                  </main>
                ) : (
                  // Render dashboard layout for other pages
                  <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-auto p-4 md:p-6">
                        {children}
                      </main>
                    </div>
                  </div>
                )
              )}
            </SessionProvider>
          </ToastProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
