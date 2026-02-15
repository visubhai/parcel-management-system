"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, Lock, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { adminService } from "@/frontend/services/adminService";
export default function LoginPage() {
    const router = useRouter();
    const [branches, setBranches] = useState([]);
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
                const { data, error } = await adminService.getAllBranches();
                if (error)
                    throw error;
                // data might need mapping if keys differ, but usually backend returns _id
                setBranches(data);
            }
            catch (err) {
                console.error(err);
                setError("Failed to load branches. Please refresh.");
            }
            finally {
                setLoading(false);
            }
        }
        fetchBranches();
    }, []);
    const handleSubmit = async (e) => {
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
            console.log("Login result:", res);
            if (res === null || res === void 0 ? void 0 : res.error) {
                // Map NextAuth generic errors to user-friendly messages
                if (res.error === "CredentialsSignin" || res.error.includes("invalid")) {
                    setError("Invalid username or password");
                }
                else if (res.error === "Configuration") {
                    setError("Server configuration error. Please contact admin.");
                }
                else {
                    setError(res.error);
                }
                setSubmitting(false);
            }
            else {
                // Successful login - Set session gate cookie
                const isProd = window.location.protocol === 'https:';
                const cookieStr = `login-gate-passed=true; path=/; sameSite=lax${isProd ? '; secure' : ''}; max-age=86400`; // 24 hours
                document.cookie = cookieStr;
                console.log("🛡️ Login gate cookie set:", cookieStr);
                // Small delay to ensure browser registers the cookie before the hard redirect
                setTimeout(() => {
                    window.location.href = "/";
                }, 50);
            }
        }
        catch (err) {
            console.error("Login catch error:", err);
            setError("Connection error. Please try again.");
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen relative flex items-center justify-center font-sans overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105", style: { backgroundImage: "url('/images/bg-bus.jpg')" }, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#0a2e1f]/90 via-[#05110c]/80 to-[#103a27]/90 mix-blend-multiply" }), _jsx("div", { className: "absolute inset-0 bg-black/40" })] }), _jsx("div", { className: "absolute top-[10%] left-[15%] w-64 h-64 bg-green-500/20 rounded-full blur-[100px] animate-pulse" }), _jsx("div", { className: "absolute bottom-[10%] right-[15%] w-96 h-96 bg-lime-500/10 rounded-full blur-[120px] animate-pulse delay-700" }), _jsxs("div", { className: "relative z-10 w-full max-w-[440px] px-6 py-8", children: [_jsxs("div", { className: "backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden group", children: [_jsx("div", { className: "absolute inset-0 border border-green-500/20 rounded-[32px] pointer-events-none group-hover:border-green-500/40 transition-colors duration-500" }), _jsxs("div", { className: "text-center mb-10", children: [_jsx("div", { className: "inline-flex items-center gap-2 mb-2", children: _jsxs("h1", { className: "text-5xl font-black tracking-tighter italic", children: [_jsx("span", { className: "text-white", children: "SA" }), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300", children: "VAN" })] }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Secure Logistics Portal" }), _jsx("p", { className: "text-green-100/60 text-sm", children: "Manage your shipments efficiently" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", autoComplete: "off", autoCorrect: "off", children: [error && (_jsx("div", { className: "p-3 text-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs animate-in fade-in slide-in-from-top-1", children: error })), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors", children: _jsx(Building2, { size: 20 }) }), _jsxs("select", { disabled: loading, value: formData.branchId, onChange: (e) => {
                                                    const selectedId = e.target.value;
                                                    const selectedBranch = branches.find(b => b._id === selectedId);
                                                    setFormData(Object.assign(Object.assign({}, formData), { branchId: selectedId, username: selectedBranch ? selectedBranch.name : "" }));
                                                }, className: "w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 appearance-none disabled:opacity-50 text-sm", children: [_jsx("option", { value: "", disabled: true, className: "bg-[#05110c]", children: "Select your branch" }), branches.map((b) => (_jsxs("option", { value: b._id, className: "bg-[#05110c] text-white", children: [b.name, " (", b.branchCode, ")"] }, b._id)))] }), _jsx("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30", children: _jsx("svg", { width: "12", height: "8", viewBox: "0 0 12 8", fill: "none", className: "group-focus-within:rotate-180 transition-transform duration-300", children: _jsx("path", { d: "M1 1.5L6 6.5L11 1.5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors", children: _jsx(Mail, { size: 20 }) }), _jsx("input", { type: "text", placeholder: "Email address", value: formData.username, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { username: e.target.value })), className: "w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 text-sm", required: true })] }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-green-400 transition-colors", children: _jsx(Lock, { size: 20 }) }), _jsx("input", { type: showPassword ? "text" : "password", placeholder: "Password", value: formData.password, onChange: (e) => setFormData(Object.assign(Object.assign({}, formData), { password: e.target.value })), className: "w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder-white/40 text-sm", required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors", children: showPassword ? _jsx(EyeOff, { size: 20 }) : _jsx(Eye, { size: 20 }) })] }), _jsx("div", { className: "flex justify-end text-xs px-1", children: _jsx("a", { href: "#", className: "text-green-400 hover:text-green-300 transition-colors font-medium", children: "Forgot password?" }) }), _jsxs("div", { className: "space-y-3 pt-2", children: [_jsx("button", { type: "submit", disabled: submitting || loading, className: "w-full py-4 px-6 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-400 hover:to-lime-300 text-[#05110c] font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base uppercase tracking-wider", children: submitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), "Verifying..."] })) : (_jsxs(_Fragment, { children: ["Login", _jsx(ArrowRight, { className: "w-5 h-5" })] })) }), _jsx("button", { type: "button", className: "w-full py-4 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-sm", children: "Admin Login" })] })] })] }), _jsx("div", { className: "mt-8 text-center", children: _jsxs("p", { className: "text-white/30 text-[10px] uppercase tracking-[0.2em]", children: ["\u00A9 ", new Date().getFullYear(), " SAVAN LOGISTICS SYSTEM \u2022 ALL RIGHTS RESERVED"] }) })] })] }));
}
