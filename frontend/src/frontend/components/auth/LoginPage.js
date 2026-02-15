"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useBranchStore } from "@/frontend/lib/store";
import { authService } from "@/frontend/services/authService";
import { ArrowRight, Package, Truck, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
export function LoginPage() {
    const { setCurrentUser } = useBranchStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        setAnimate(true);
    }, []);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const { data, error } = await authService.login(email, password);
        if (error) {
            setError("Invalid credentials. Please check your details.");
            setIsLoading(false);
            return;
        }
        if (data && data.user) {
            const user = await authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
            else {
                setError("User profile not found.");
            }
        }
        setIsLoading(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-white flex overflow-hidden font-sans text-slate-900", children: [_jsxs("div", { className: `
                hidden lg:flex w-1/2 bg-slate-900 text-white relative flex-col justify-between p-16
                transition-transform duration-1000 ease-out
                ${animate ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
            `, children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" }), _jsx("div", { className: "absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" }), _jsx("div", { className: "absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] -translate-x-1/2 -translate-y-1/2" })] }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center gap-3 mb-8", children: [_jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20", children: _jsx(Truck, { className: "w-7 h-7 text-white" }) }), _jsx("span", { className: "text-2xl font-bold tracking-tight", children: "ABCD Logistics" })] }), _jsxs("h1", { className: "text-5xl font-bold leading-tight mb-6", children: ["Seamless delivery ", _jsx("br", {}), _jsx("span", { className: "text-blue-500", children: "solutions" }), " for your ", _jsx("br", {}), "business."] }), _jsx("p", { className: "text-slate-400 text-lg max-w-md leading-relaxed", children: "Manage parcels, track shipments, and optimize your supply chain with our next-generation logistics platform." })] }), _jsxs("div", { className: "relative z-10 grid grid-cols-2 gap-8 mt-12", children: [_jsxs("div", { className: "bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10", children: [_jsx(Package, { className: "w-8 h-8 text-blue-400 mb-3" }), _jsx("h3", { className: "font-semibold text-lg mb-1", children: "Real-time Tracking" }), _jsx("p", { className: "text-sm text-slate-400", children: "Monitor every step of the journey." })] }), _jsxs("div", { className: "bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10", children: [_jsx(ShieldCheck, { className: "w-8 h-8 text-blue-400 mb-3" }), _jsx("h3", { className: "font-semibold text-lg mb-1", children: "Secure Delivery" }), _jsx("p", { className: "text-sm text-slate-400", children: "Trusted by thousands of businesses." })] })] }), _jsx("div", { className: "relative z-10 text-sm text-slate-500 mt-12", children: "\u00A9 2024 ABCD Logistics System. All rights reserved." })] }), _jsx("div", { className: `
                w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16
                transition-all duration-1000 delay-300 ease-out
                ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `, children: _jsxs("div", { className: "w-full max-w-md space-y-8", children: [_jsxs("div", { className: "space-y-2 text-center lg:text-left", children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight text-slate-900", children: "Welcome back" }), _jsx("p", { className: "text-slate-500", children: "Please enter your details to sign in." })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-sm font-semibold text-slate-700 ml-1", children: "Username" }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" }) }), _jsx("input", { type: "text", value: email, onChange: (e) => setEmail(e.target.value), className: "\n                                            block w-full pl-11 pr-4 py-3.5 \n                                            bg-slate-50 border border-slate-200 rounded-xl \n                                            text-slate-900 placeholder-slate-400 \n                                            focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 \n                                            transition-all duration-200 outline-none\n                                            font-medium\n                                        ", placeholder: "Enter your email/username", required: true })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between ml-1", children: [_jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Password" }), _jsx("button", { type: "button", className: "text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors", children: "Forgot password?" })] }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none", children: _jsx(Lock, { className: "h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" }) }), _jsx("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), className: "\n                                            block w-full pl-11 pr-12 py-3.5 \n                                            bg-slate-50 border border-slate-200 rounded-xl \n                                            text-slate-900 placeholder-slate-400 \n                                            focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 \n                                            transition-all duration-200 outline-none\n                                            font-medium\n                                        ", placeholder: "Enter your password", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] })] }), error && (_jsxs("div", { className: "p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full" }), error] })), _jsx("button", { type: "submit", disabled: isLoading, className: "\n                                w-full flex items-center justify-center gap-2 \n                                bg-slate-900 text-white font-bold py-4 rounded-xl \n                                hover:bg-slate-800 active:scale-[0.99]\n                                focus:outline-none focus:ring-4 focus:ring-slate-900/20\n                                shadow-xl shadow-slate-900/20\n                                transition-all duration-200 \n                                disabled:opacity-70 disabled:cursor-not-allowed\n                            ", children: isLoading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: ["Sign In ", _jsx(ArrowRight, { className: "w-5 h-5" })] })) })] }), _jsx("div", { className: "pt-6 border-t border-slate-100", children: _jsxs("p", { className: "text-center text-sm text-slate-500", children: ["Don't have an account? ", _jsx("span", { className: "font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors", children: "Contact Support" })] }) })] }) })] }));
}
