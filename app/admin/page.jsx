"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    FiUsers, FiMessageSquare, FiActivity, FiArrowRight,
    FiUserCheck, FiUserX, FiClock, FiCheckCircle,
    FiAlertCircle, FiRefreshCw, FiTrendingUp, FiServer,
    FiShield, FiBarChart2
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';

export default function AdminDashboard() {
    const api = useAxios();
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, usersRes, ticketsRes] = await Promise.allSettled([
                api.get('/admin/stats'),
                api.get('/admin/users?limit=5&sort=-createdAt'),
                api.get('/admin/support?limit=5&sort=-createdAt'),
            ]);

            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
            if (usersRes.status === 'fulfilled') {
                const data = usersRes.value.data.data;
                setRecentUsers(Array.isArray(data) ? data : data?.users || []);
            }
            if (ticketsRes.status === 'fulfilled') {
                const data = ticketsRes.value.data.data;
                setRecentTickets(Array.isArray(data) ? data : data?.tickets || []);
            }
            setLastRefresh(new Date());
        } catch (e) {
            console.error('Admin stats fetch failed', e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const today = new Date().toLocaleDateString('en-BD', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers ?? '—',
            sub: `+${stats?.newUsersToday ?? 0} today`,
            icon: FiUsers,
            color: 'blue',
        },
        {
            label: 'Active Users',
            value: stats?.activeUsers ?? '—',
            sub: 'Verified accounts',
            icon: FiUserCheck,
            color: 'green',
        },
        {
            label: 'Open Tickets',
            value: stats?.openTickets ?? '—',
            sub: 'Awaiting reply',
            icon: FiMessageSquare,
            color: 'orange',
        },
        {
            label: 'Total Tickets',
            value: stats?.totalTickets ?? '—',
            sub: `${stats?.resolvedTickets ?? 0} resolved`,
            icon: FiCheckCircle,
            color: 'blue',
        },
    ];

    const colorMap = {
        blue: {
            card: 'border-blue-100',
            icon: 'bg-blue-50 text-[#1e6bd6] border-blue-100',
            value: 'text-[#1e6bd6]',
        },
        green: {
            card: 'border-emerald-100',
            icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            value: 'text-emerald-600',
        },
        orange: {
            card: 'border-orange-100',
            icon: 'bg-orange-50 text-orange-500 border-orange-100',
            value: 'text-orange-500',
        },
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{today}</p>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Admin <span className="text-[#1e6bd6]">Dashboard</span>
                    </h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Platform overview &amp; quick actions
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-extrabold text-gray-500 uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => {
                    const Icon = s.icon;
                    const c = colorMap[s.color] || colorMap.blue;
                    return (
                        <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm ${c.card}`}>
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{s.label}</p>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${c.icon}`}>
                                    <Icon size={15} />
                                </div>
                            </div>
                            <h3 className={`text-2xl font-extrabold leading-none ${c.value}`}>{s.value}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { href: '/admin/users', icon: FiUsers, label: 'Manage Users', sub: 'View & edit all users' },
                        { href: '/admin/support', icon: FiMessageSquare, label: 'Support Tickets', sub: 'Reply to all tickets' },
                        { href: '/admin/stats', icon: FiBarChart2, label: 'Platform Stats', sub: 'Detailed analytics' },
                        { href: '/admin/settings', icon: FiShield, label: 'Settings', sub: 'System configuration' },
                    ].map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link
                                key={a.href}
                                href={a.href}
                                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 mb-3 group-hover:scale-110 transition-transform">
                                    <Icon size={18} />
                                </div>
                                <p className="text-sm font-extrabold text-gray-800 leading-tight">{a.label}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{a.sub}</p>
                                <div className="flex items-center gap-1 mt-3 text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest group-hover:gap-2 transition-all">
                                    Open <FiArrowRight size={11} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Users + Tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiUsers size={16} className="text-[#1e6bd6]" />
                            <span className="text-sm font-extrabold text-gray-800">Recent Users</span>
                        </div>
                        <Link href="/admin/users" className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest hover:underline flex items-center gap-1">
                            View All <FiArrowRight size={11} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center">
                            <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto" size={24} />
                        </div>
                    ) : recentUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No user data</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentUsers.map((u, i) => (
                                <div key={u._id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/30 transition-colors">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e6bd6] font-extrabold text-sm border border-blue-100 shrink-0">
                                        {(u.name || u.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{u.name || '—'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{u.email}</p>
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                        u.isVerified || u.verified
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                    }`}>
                                        {u.isVerified || u.verified ? 'Active' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiMessageSquare size={16} className="text-[#1e6bd6]" />
                            <span className="text-sm font-extrabold text-gray-800">Recent Support Tickets</span>
                        </div>
                        <Link href="/admin/support" className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest hover:underline flex items-center gap-1">
                            View All <FiArrowRight size={11} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center">
                            <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto" size={24} />
                        </div>
                    ) : recentTickets.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No ticket data</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentTickets.map((t, i) => (
                                <div key={t._id || i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/30 transition-colors">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                                        t.status === 'open'
                                            ? 'bg-orange-50 text-orange-500 border-orange-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {t.status === 'open' ? <FiAlertCircle size={15} /> : <FiCheckCircle size={15} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{t.subject || t.title || '—'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">
                                            {t.user?.name || t.userId?.name || 'Unknown user'}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                        t.status === 'open'
                                            ? 'bg-orange-50 text-orange-500 border-orange-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {t.status || 'open'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="bg-[#1e6bd6] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl shadow-blue-100">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                    <FiServer size={22} />
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-extrabold text-white tracking-tight">System Status</h4>
                    <p className="text-xs text-white/70 font-bold mt-1 uppercase tracking-widest">
                        All services operational · API Connected · ShopOS BD v1.0
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-white uppercase tracking-widest">Online</span>
                </div>
            </div>

            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-right">
                Last refreshed: {lastRefresh.toLocaleTimeString('en-BD')}
            </p>
        </div>
    );
}
