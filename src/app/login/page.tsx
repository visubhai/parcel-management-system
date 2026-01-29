"use client";

import { useState } from "react";
import { useBranchStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

import { authService } from "@/services/authService";

export default function LoginPage() {
    const router = useRouter();
    const { setCurrentUser } = useBranchStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { data, error } = await authService.login(email, password);

        if (error) {
            setError("Invalid credentials. Please check your email and password.");
            setIsLoading(false);
            return;
        }

        if (data && data.user) {
            // Fetch profile handled by session check or explicit fetch
            const user = await authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
                router.push("/");
            } else {
                setError("User profile not found.");
            }
        } else {
            // Should not happen if error is null
            setError("Login failed.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800">ABCD Logistics</h1>
                    <p className="text-slate-500 font-medium">System Login</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username or Email</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Enter username (e.g. hirabagh)"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    <div className="text-center text-xs text-slate-400 mt-4">
                        <p>Note: Use your Supabase Auth credentials.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
