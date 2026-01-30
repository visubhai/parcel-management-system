"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, User, Lock, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";

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
    const [showPassword, setShowPassword] = useState(false);
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
                email: formData.username,
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
        <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{ backgroundImage: "url('/images/bg-bus.jpg')" }}
            >
                {/* Dynamic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1f]/90 via-[#05110c]/80 to-[#103a27]/90 mix-blend-multiply" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Floating Orbs for Extra Depth */}
            <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-lime-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-[440px] px-6 py-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                    {/* Inner Glow/Border Effect */}
                    <div className="absolute inset-0 border border-green-500/20 rounded-[32px] pointer-events-none group-hover:border-green-500/40 transition-colors duration-500" />

                    {/* Branding */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <h1 className="text-5xl font-black tracking-tighter italic">
                                <span className="text-white">SA</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">VAN</span>
                            </h1>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Secure Logistics Portal</h2>
                        <p className="text-green-100/60 text-sm">Manage your shipments efficiently</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 text-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        {/* Branch Selection */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors">
                                <Building2 size={20} />
                            </div>
                            <select
                                disabled={loading}
                                value={formData.branchId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedBranch = branches.find(b => b._id === selectedId);
                                    setFormData({
                                        ...formData,
                                        branchId: selectedId,
                                        username: selectedBranch ? selectedBranch.name : ""
                                    });
                                }}
                                className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 appearance-none disabled:opacity-50 text-sm"
                            >
                                <option value="" disabled className="bg-[#05110c]">Select your branch</option>
                                {branches.map((b) => (
                                    <option key={b._id} value={b._id} className="bg-[#05110c] text-white">
                                        {b.name} ({b.branchCode})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="group-focus-within:rotate-180 transition-transform duration-300">
                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Email / Username */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Email address"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 text-sm"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 text-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Extra Options */}
                        <div className="flex items-center justify-between text-xs px-1">
                            <label className="flex items-center gap-2 text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-green-500 transition-all cursor-pointer" />
                                Remember me
                            </label>
                            <a href="#" className="text-green-400 hover:text-green-300 transition-colors font-medium">Forgot password?</a>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-400 hover:to-lime-300 text-[#05110c] font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base uppercase tracking-wider"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="w-full py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-sm"
                            >
                                Admin Login
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Copyright */}
                <div className="mt-8 text-center">
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} SAVAN LOGISTICS SYSTEM • ALL RIGHTS RESERVED
                    </p>
                </div>
            </div>
        </div>
    );
}
