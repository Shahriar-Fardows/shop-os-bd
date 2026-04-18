"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    FiBarChart2, FiRefreshCw, FiUsers, FiMessageSquare,
    FiTrendingUp, FiTrendingDown, FiActivity, FiCalendar
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';

export default function AdminStatsPage() {
    const api = useAxios();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const cards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, sub: `${stats.newUsersToday ?? 0} joined today`, up: true },
        { label: 'Active Users', value: stats.activeUsers, icon: FiActivity, sub: 'Verified accounts', up: true },
        { label: 'Inactive Users', value: (stats.totalUsers || 0) - (stats.activeUsers || 0), icon: FiUsers, sub: 'Unverified', up: false },
        { label: 'Total Tickets', value: stats.totalTickets, icon: FiMessageSquare, sub: `${stats.openTickets ?? 0} open`, up: null },
        { label: 'Resolved Tickets', value: stats.resolvedTickets, icon: FiMessageSquare, sub: 'Closed tickets', up: true },
        { label: 'Open Tickets', value: stats.openTickets, icon: FiMessageSquare, sub: 'Awaiting reply', up: false },
        { label: 'Users This Week', value: stats.newUsersThisWeek ?? '—', icon: FiCalendar, sub: 'New registrations', up: true },
        { label: 'Users This Month', value: stats.newUsersThisMonth ?? '—', icon: FiCalendar, sub: 'New registrations', up: true },
    ] : [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Statistics</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Live platform analytics</p>
                </div>
                <button onClick={fetchStats} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-extrabold text-gray-500 uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50">
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto mb-3" size={28} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading stats...</p>
                </div>
            ) : !stats ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <FiBarChart2 className="mx-auto text-gray-300 mb-3" size={36} />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No data available from API</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {cards.map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{c.label}</p>
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100">
                                            <Icon size={14} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-[#1e6bd6] leading-none">{c.value ?? '—'}</h3>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {c.up === true && <FiTrendingUp size={11} className="text-emerald-500" />}
                                        {c.up === false && <FiTrendingDown size={11} className="text-red-400" />}
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.sub}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Raw JSON for debug */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest mb-3">Raw API Response</p>
                        <pre className="text-[10px] text-gray-600 bg-gray-50 p-4 rounded-xl overflow-x-auto border border-gray-100 leading-relaxed">
                            {JSON.stringify(stats, null, 2)}
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}
