"use client";

import { useState, useEffect } from "react";
import { useBranchStore } from "@/lib/store";
import { ArrowRight, Package, Truck, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
    const { login } = useBranchStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate a sophisticated network request with dynamic timing
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

        const success = login(username, password);
        if (!success) {
            setError("Invalid credentials. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-sans text-slate-900">
            {/* Left Side: Brand & Visuals */}
            <div className={`
                hidden lg:flex w-1/2 bg-slate-900 text-white relative flex-col justify-between p-16
                transition-transform duration-1000 ease-out
                ${animate ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
            `}>
                {/* Abstract Background Patterns */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
                    <div className="absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Truck className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">ABCD Logistics</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Seamless delivery <br />
                        <span className="text-blue-500">solutions</span> for your <br />
                        business.
                    </h1>

                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Manage parcels, track shipments, and optimize your supply chain with our next-generation logistics platform.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8 mt-12">
                    <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                        <Package className="w-8 h-8 text-blue-400 mb-3" />
                        <h3 className="font-semibold text-lg mb-1">Real-time Tracking</h3>
                        <p className="text-sm text-slate-400">Monitor every step of the journey.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                        <ShieldCheck className="w-8 h-8 text-blue-400 mb-3" />
                        <h3 className="font-semibold text-lg mb-1">Secure Delivery</h3>
                        <p className="text-sm text-slate-400">Trusted by thousands of businesses.</p>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-slate-500 mt-12">
                    © 2024 ABCD Logistics System. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className={`
                w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16
                transition-all duration-1000 delay-300 ease-out
                ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}>
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                        <p className="text-slate-500">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="
                                            block w-full pl-11 pr-4 py-3.5 
                                            bg-slate-50 border border-slate-200 rounded-xl 
                                            text-slate-900 placeholder-slate-400 
                                            focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 
                                            transition-all duration-200 outline-none
                                            font-medium
                                        "
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="
                                            block w-full pl-11 pr-12 py-3.5 
                                            bg-slate-50 border border-slate-200 rounded-xl 
                                            text-slate-900 placeholder-slate-400 
                                            focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 
                                            transition-all duration-200 outline-none
                                            font-medium
                                        "
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                                w-full flex items-center justify-center gap-2 
                                bg-slate-900 text-white font-bold py-4 rounded-xl 
                                hover:bg-slate-800 active:scale-[0.99]
                                focus:outline-none focus:ring-4 focus:ring-slate-900/20
                                shadow-xl shadow-slate-900/20
                                transition-all duration-200 
                                disabled:opacity-70 disabled:cursor-not-allowed
                            "
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-100">
                        <p className="text-center text-sm text-slate-500">
                            Don't have an account? <span className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">Contact Support</span>
                        </p>
                    </div>

                    <div className="bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 text-center text-xs text-blue-800 space-y-2">
                        <p>Demo Credentials (Password: <span className="font-mono font-bold">password</span>)</p>
                        <div className="grid grid-cols-3 gap-2 font-mono font-bold opacity-80 text-[10px]">
                            <div className="flex flex-col">
                                <span className="uppercase text-[8px] opacity-60">Admin</span>
                                <span>admin</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="uppercase text-[8px] opacity-60">Branch A</span>
                                <span>manager_a</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="uppercase text-[8px] opacity-60">Branch B</span>
                                <span>manager_b</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
