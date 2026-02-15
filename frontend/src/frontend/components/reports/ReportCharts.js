import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function ReportCharts({ data }) {
    if (data.length === 0)
        return null;
    // 1. Monthly Revenue
    const revenueData = useMemo(() => {
        const map = new Map();
        data.forEach(item => {
            if (item.status === 'CANCELLED')
                return;
            const date = new Date(item.date);
            const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`; // Showing Daily trend for filtered range
            map.set(key, (map.get(key) || 0) + item.costs.total);
        });
        // Sort by date would require more complex logic, simplifying to recent order or just map iteration
        // For Filter Range mostly being Month, let's group by Date
        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [data]);
    // 2. Status Counts
    const statusData = useMemo(() => {
        const counts = {
            'BOOKED': 0, 'PENDING': 0, 'DELIVERED': 0, 'CANCELLED': 0
        };
        data.forEach(item => {
            var _a;
            const s = (_a = item.status) === null || _a === void 0 ? void 0 : _a.toUpperCase();
            if (s && counts[s] !== undefined)
                counts[s]++;
            // Map legacy for chart compatibility
            else if (s === 'INCOMING' || s === 'ARRIVED' || s === 'IN_TRANSIT')
                counts['PENDING']++;
        });
        // Filter out zero counts to keep chart clean
        return Object.entries(counts).filter(([, val]) => val > 0).map(([name, value]) => ({
            name: name.charAt(0) + name.slice(1).toLowerCase(),
            value
        }));
    }, [data]);
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700", children: [_jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("h3", { className: "text-sm font-bold text-slate-500 uppercase tracking-wide mb-6", children: "Revenue Trend" }), _jsx("div", { className: "h-[250px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: revenueData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }), _jsx(XAxis, { dataKey: "name", tick: { fontSize: 10, fill: '#64748b' }, axisLine: false, tickLine: false }), _jsx(Tooltip, { contentStyle: { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }, cursor: { stroke: '#cbd5e1' } }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "#3b82f6", strokeWidth: 3, dot: false, activeDot: { r: 6 } })] }) }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("h3", { className: "text-sm font-bold text-slate-500 uppercase tracking-wide mb-6", children: "Parcel Status Distribution" }), _jsx("div", { className: "h-[250px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: statusData, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "#f1f5f9" }), _jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { dataKey: "name", type: "category", width: 100, tick: { fontSize: 11, fill: '#475569', fontWeight: 600 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { cursor: { fill: '#f8fafc' }, contentStyle: { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } }), _jsx(Bar, { dataKey: "value", fill: "#6366f1", radius: [0, 4, 4, 0], barSize: 24 })] }) }) })] })] }));
}
