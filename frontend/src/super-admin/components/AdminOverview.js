import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useBranches } from "@/frontend/hooks/useBranches";
import { Activity, Landmark, Users, Package, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
export function AdminOverview() {
    const { branchObjects } = useBranches();
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        activeBranches: 0,
        totalUsers: 24, // Placeholder for now or fetch
    });
    const [branchData, setBranchData] = useState([]);
    useEffect(() => {
        const fetchGlobalStats = async () => {
            // In a real app, we'd have a global stats endpoint. 
            // Here we'll aggregate or fetch from common reports.
            setStats(prev => (Object.assign(Object.assign({}, prev), { activeBranches: branchObjects.length })));
            // Generate some visual data based on branches
            const mockData = branchObjects.map(b => ({
                name: b.name,
                bookings: Math.floor(Math.random() * 50) + 10,
                revenue: Math.floor(Math.random() * 10000) + 2000
            }));
            setBranchData(mockData);
        };
        if (branchObjects.length > 0) {
            fetchGlobalStats();
        }
    }, [branchObjects]);
    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { title: "Global Bookings", value: "1,284", trend: "+12%", icon: _jsx(Package, { className: "text-blue-600" }), color: "bg-blue-50" }), _jsx(StatCard, { title: "Total Revenue", value: "\u20B94,82,900", trend: "+8.5%", icon: _jsx(IndianRupee, { className: "text-emerald-600" }), color: "bg-emerald-50" }), _jsx(StatCard, { title: "Active Branches", value: stats.activeBranches.toString(), trend: "Stable", icon: _jsx(Landmark, { className: "text-indigo-600" }), color: "bg-indigo-50" }), _jsx(StatCard, { title: "Staff Members", value: "24", trend: "+2", icon: _jsx(Users, { className: "text-amber-600" }), color: "bg-amber-50" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-800", children: "Booking Distribution" }), _jsx("p", { className: "text-slate-500 text-sm", children: "LR generation across different branches" })] }), _jsx(Activity, { className: "text-slate-300 w-8 h-8" })] }), _jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: branchData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }), _jsx(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: '#94a3b8', fontSize: 12, fontWeight: 600 } }), _jsx(YAxis, { hide: true }), _jsx(Tooltip, { contentStyle: { borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }, cursor: { fill: '#f8fafc' } }), _jsx(Bar, { dataKey: "bookings", radius: [8, 8, 8, 8], barSize: 40, children: branchData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) })] }) }) })] }), _jsxs("div", { className: "lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" }), _jsx("h3", { className: "text-xl font-bold mb-6 relative z-10", children: "Network Integrity" }), _jsx("div", { className: "space-y-6 relative z-10", children: branchObjects.slice(0, 5).map((branch) => (_jsxs("div", { className: "flex justify-between items-center group cursor-pointer", children: [_jsxs("div", { children: [_jsx("div", { className: "font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight", children: branch.name }), _jsxs("div", { className: "text-[10px] text-slate-500 font-bold tracking-widest", children: [branch.branchCode, " OFFICE"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm font-black text-green-400", children: "ONLINE" }), _jsxs("div", { className: "text-[10px] text-slate-500 font-bold", children: ["LATEST LR: 1,20", Math.floor(Math.random() * 9)] })] })] }, branch._id))) }), _jsx("button", { className: "w-full mt-10 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all", children: "View Connectivity Map" })] })] })] }));
}
function StatCard({ title, value, trend, icon, color }) {
    return (_jsxs("div", { className: "bg-white border border-slate-200 p-6 rounded-[28px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("div", { className: `p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`, children: icon }), _jsx("span", { className: `text-[10px] font-black px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`, children: trend })] }), _jsx("div", { className: "text-slate-400 text-xs font-bold uppercase tracking-widest mb-1", children: title }), _jsx("div", { className: "text-2xl font-black text-slate-800 tracking-tight", children: value })] }));
}
