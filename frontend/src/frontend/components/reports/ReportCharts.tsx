import { useMemo } from 'react';
import { Booking } from "@/shared/types";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface ReportChartsProps {
    data: Booking[];
}

export function ReportCharts({ data }: ReportChartsProps) {
    if (data.length === 0) return null;

    // 1. Monthly Revenue
    const revenueData = useMemo(() => {
        const map = new Map();
        data.forEach(item => {
            if (item.status === 'CANCELLED') return;
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
        const counts: Record<string, number> = {
            'BOOKED': 0, 'PENDING': 0, 'DELIVERED': 0, 'CANCELLED': 0
        };
        data.forEach(item => {
            const s = item.status?.toUpperCase();
            if (s && counts[s] !== undefined) counts[s]++;
            // Map legacy for chart compatibility
            else if (s === 'INCOMING' || s === 'ARRIVED' || s === 'IN_TRANSIT') counts['PENDING']++;
        });
        // Filter out zero counts to keep chart clean
        return Object.entries(counts).filter(([, val]) => val > 0).map(([name, value]) => ({
            name: name.charAt(0) + name.slice(1).toLowerCase(),
            value
        }));
    }, [data]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Revenue Trend</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Parcel Status Distribution</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
