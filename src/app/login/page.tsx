"use client";

import { useState, useEffect } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authService } from "@/frontend/services/authService";

export default function LoginPage() {
    const { setCurrentUser } = useBranchStore(); // We still use the store, but effectively bypassing logic
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // BYPASS: Auto-redirect to dashboard
    useEffect(() => {
        router.push('/');
    }, [router]);

    // Keep the UI rendering in case redirect is slow, but it should be fast
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-slate-500">Redirecting to Dashboard...</p>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mt-4 text-blue-600" />
                </div>
            </div>
        </div>
    );
}

// Keep original logic below strictly for reference or backup if needed
// function OriginalLoginPage() { ... }
