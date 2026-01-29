"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, User, Lock, ArrowRight, Truck } from "lucide-react";

interface Branch {
    _id: string;
    name: string;
    branchCode: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        branchId: "",
        username: "",
        password: "",
    });

    useEffect(() => {
        async function fetchBranches() {
            try {
                const res = await fetch("/api/branches");
                if (!res.ok) throw new Error("Failed to load branches");
                const data = await res.json();
                setBranches(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load branches. Please refresh.");
            } finally {
                setLoading(false);
            }
        }
        fetchBranches();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        if (!formData.branchId) {
            setError("Please select a branch");
            setSubmitting(false);
            return;
        }

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.username, // mapping username to email field for auth provider
                password: formData.password,
                branchId: formData.branchId,
            });

            if (res?.error) {
                setError(res.error);
                setSubmitting(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0f172a] text-white overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10 bg-gradient-to-br from-slate-900/50 to-slate-900/10 backdrop-blur-sm border-r border-slate-800">
                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            ParcelManage
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Logistics Management <br />
                        <span className="text-blue-400">Reimagined.</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                        Streamline your parcel operations with our multi-branch management system.
                        Efficient, secure, and real-time.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Multi-Branch Support</h3>
                                <p className="text-slate-400 text-sm">Seamlessly switch between branches and manage specific operational data.</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Parcel Management System. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {/* Branch Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Branch</label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <select
                                    disabled={loading}
                                    value={formData.branchId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedBranch = branches.find(b => b._id === selectedId);
                                        // Auto-populate username with branch name if available
                                        setFormData({
                                            ...formData,
                                            branchId: selectedId,
                                            username: selectedBranch ? selectedBranch.name : ""
                                        });
                                    }}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-200 placeholder-slate-500 appearance-none disabled:opacity-50"
                                >
                                    <option value="" disabled>Select your branch</option>
                                    {branches.map((b) => (
                                        <option key={b._id} value={b._id} className="bg-slate-800 text-slate-200">
                                            {b.name} ({b.branchCode})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-200 placeholder-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
                        Need help? Contact system administrator.
                    </div>
                </div>
            </div>
        </div>
    );
}
