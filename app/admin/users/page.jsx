"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiSearch, FiRefreshCw, FiUserCheck, FiUserX,
    FiTrash2, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiX
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function AdminUsersPage() {
    const api = useAxios();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | active | pending
    const [selected, setSelected] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            const data = res.data.data;
            setUsers(Array.isArray(data) ? data : data?.users || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch = !q || (u.name || '').toLowerCase().includes(q)
            || (u.email || '').toLowerCase().includes(q)
            || (u.mobileNumber || '').includes(q);
        const matchFilter =
            filter === 'all' ||
            (filter === 'active' && (u.isVerified || u.verified)) ||
            (filter === 'pending' && !(u.isVerified || u.verified));
        return matchSearch && matchFilter;
    });

    const handleToggleBlock = async (u) => {
        const isBlocked = u.isBlocked || u.blocked;
        const res = await Swal.fire({
            title: isBlocked ? 'Unblock user?' : 'Block user?',
            text: `${u.name} — ${u.email}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isBlocked ? '#1e6bd6' : '#dc2626',
            confirmButtonText: isBlocked ? 'Yes, Unblock' : 'Yes, Block',
        });
        if (!res.isConfirmed) return;
        try {
            await api.patch(`/admin/users/${u._id}/toggle-block`);
            fetchUsers();
            Swal.fire({ icon: 'success', title: 'Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (e) {
            Swal.fire('Error', e.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleDelete = async (u) => {
        const res = await Swal.fire({
            title: 'Delete user?',
            text: `This will permanently delete ${u.name}. Cannot undo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'Yes, Delete',
        });
        if (!res.isConfirmed) return;
        try {
            await api.delete(`/admin/users/${u._id}`);
            fetchUsers();
            if (selected?._id === u._id) setSelected(null);
            Swal.fire({ icon: 'success', title: 'Deleted', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (e) {
            Swal.fire('Error', e.response?.data?.message || 'Failed', 'error');
        }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Users</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {users.length} total · {users.filter(u => u.isVerified || u.verified).length} active
                    </p>
                </div>
                <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-extrabold text-gray-500 uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50">
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, phone..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                    />
                </div>
                <div className="flex gap-1.5">
                    {['all', 'active', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                                filter === f
                                    ? 'bg-[#1e6bd6] text-white shadow-sm shadow-blue-100'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center">
                        <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto mb-3" size={28} />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading users...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-5 py-3.5">User</th>
                                    <th className="px-5 py-3.5">Contact</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-center">Joined</th>
                                    <th className="px-5 py-3.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((u) => {
                                    const isVerified = u.isVerified || u.verified;
                                    const isBlocked = u.isBlocked || u.blocked;
                                    return (
                                        <tr
                                            key={u._id}
                                            onClick={() => setSelected(u)}
                                            className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e6bd6] font-extrabold text-sm border border-blue-100 shrink-0">
                                                        {(u.name || u.email || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 leading-tight">{u.name || '—'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.role || 'user'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-xs font-bold text-gray-600">{u.email}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{u.mobileNumber || '—'}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                                    isBlocked
                                                        ? 'bg-red-50 text-red-500 border-red-100'
                                                        : isVerified
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                    {isBlocked ? 'Blocked' : isVerified ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="text-xs font-bold text-gray-500">{fmt(u.createdAt)}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleToggleBlock(u)}
                                                        title={isBlocked ? 'Unblock' : 'Block'}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            isBlocked
                                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                                                : 'bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-100'
                                                        }`}
                                                    >
                                                        {isBlocked ? <FiUserCheck size={14} /> : <FiUserX size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u)}
                                                        title="Delete"
                                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                    <div
                        className="relative bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto font-nunito"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-gray-800 uppercase tracking-widest">User Details</span>
                            <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="flex flex-col items-center text-center gap-2 py-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1e6bd6] font-extrabold text-2xl border border-blue-100 flex items-center justify-center">
                                    {(selected.name || selected.email || '?')[0].toUpperCase()}
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-800">{selected.name}</h3>
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                    selected.isBlocked || selected.blocked
                                        ? 'bg-red-50 text-red-500 border-red-100'
                                        : (selected.isVerified || selected.verified)
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-gray-50 text-gray-400 border-gray-200'
                                }`}>
                                    {selected.isBlocked || selected.blocked ? 'Blocked' : (selected.isVerified || selected.verified) ? 'Active' : 'Pending'}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: FiMail, label: 'Email', value: selected.email },
                                    { icon: FiPhone, label: 'Mobile', value: selected.mobileNumber },
                                    { icon: FiMapPin, label: 'City', value: selected.city },
                                    { icon: FiShield, label: 'Role', value: selected.role || 'user' },
                                    { icon: FiCalendar, label: 'Joined', value: fmt(selected.createdAt) },
                                ].map((f, i) => f.value ? (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shrink-0">
                                            <f.icon size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{f.label}</p>
                                            <p className="text-sm font-bold text-gray-700">{f.value}</p>
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                            <div className="space-y-2 pt-2">
                                <button
                                    onClick={() => handleToggleBlock(selected)}
                                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        selected.isBlocked || selected.blocked
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                            : 'bg-orange-50 text-orange-500 border border-orange-100 hover:bg-orange-100'
                                    }`}
                                >
                                    {selected.isBlocked || selected.blocked ? <><FiUserCheck size={14} /> Unblock User</> : <><FiUserX size={14} /> Block User</>}
                                </button>
                                <button
                                    onClick={() => handleDelete(selected)}
                                    className="w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiTrash2 size={14} /> Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
