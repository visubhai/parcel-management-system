"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/frontend/components/layout/Sidebar";
import { Header } from "@/frontend/components/layout/Header";
import { useBranchStore } from "@/frontend/lib/store";
import { LoginPage } from "@/frontend/components/auth/LoginPage";
import { useEffect, useState } from "react";
import { GlobalErrorBoundary } from "@/frontend/components/GlobalErrorBoundary";
import { ToastProvider } from "@/frontend/components/ui/toast";

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
  const { currentUser } = useBranchStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <GlobalErrorBoundary>
          <ToastProvider>
            {!mounted ? null : (
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                  </main>
                </div>
              </div>
            )}
          </ToastProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
