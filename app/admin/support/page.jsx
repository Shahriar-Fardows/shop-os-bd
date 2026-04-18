"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    FiMessageSquare, FiSearch, FiRefreshCw, FiSend,
    FiCheckCircle, FiAlertCircle, FiX, FiClock, FiUser
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function AdminSupportPage() {
    const api = useAxios();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all | open | closed
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    const fetchTickets = useCallback(async () => {
        try {
            const res = await api.get('/admin/support');
            const data = res.data.data;
            setTickets(Array.isArray(data) ? data : data?.tickets || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    const fetchTicket = useCallback(async (id) => {
        try {
            const res = await api.get(`/admin/support/${id}`);
            setSelected(res.data.data);
        } catch (e) {}
    }, [api]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    useEffect(() => {
        if (!selected) return;
        const interval = setInterval(() => fetchTicket(selected._id), 5000);
        return () => clearInterval(interval);
    }, [selected, fetchTicket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selected?.messages]);

    const handleSelectTicket = async (t) => {
        await fetchTicket(t._id);
    };

    const handleSendReply = async () => {
        if (!reply.trim() || !selected) return;
        setSending(true);
        try {
            await api.post(`/admin/support/${selected._id}/reply`, { message: reply.trim() });
            setReply('');
            await fetchTicket(selected._id);
            fetchTickets();
        } catch (e) {
            Swal.fire('Error', e.response?.data?.message || 'Failed to send', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async (id) => {
        const res = await Swal.fire({
            title: 'Close ticket?', icon: 'question', showCancelButton: true,
            confirmButtonColor: '#1e6bd6', confirmButtonText: 'Yes, Close',
        });
        if (!res.isConfirmed) return;
        try {
            await api.patch(`/admin/support/${id}/close`);
            fetchTickets();
            if (selected?._id === id) fetchTicket(id);
        } catch (e) {
            Swal.fire('Error', e.response?.data?.message || 'Failed', 'error');
        }
    };

    const fmt = (d) => d ? new Date(d).toLocaleString('en-BD', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

    const filtered = tickets.filter((t) => {
        const q = search.toLowerCase();
        const matchSearch = !q || (t.subject || t.title || '').toLowerCase().includes(q)
            || (t.user?.name || t.userId?.name || '').toLowerCase().includes(q);
        const matchFilter = filter === 'all' || t.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Support Tickets</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {tickets.filter(t => t.status === 'open').length} open · {tickets.length} total
                    </p>
                </div>
                <button onClick={fetchTickets} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xs font-extrabold text-gray-500 uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50">
                    <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
                {/* Ticket List */}
                <div className="space-y-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tickets..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                        />
                    </div>
                    <div className="flex gap-1.5">
                        {['all', 'open', 'closed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                                    filter === f
                                        ? 'bg-[#1e6bd6] text-white shadow-sm shadow-blue-100'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-center py-10">
                                <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto" size={22} />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No tickets</div>
                        ) : (
                            filtered.map((t) => (
                                <div
                                    key={t._id}
                                    onClick={() => handleSelectTicket(t)}
                                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                        selected?._id === t._id
                                            ? 'border-[#1e6bd6] bg-blue-50/50 shadow-sm shadow-blue-100'
                                            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${
                                            t.status === 'open'
                                                ? 'bg-orange-50 text-orange-500 border-orange-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {t.status === 'open' ? <FiAlertCircle size={13} /> : <FiCheckCircle size={13} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{t.subject || t.title || 'No subject'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                                                <FiUser size={10} />
                                                {t.user?.name || t.userId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-300 mt-1 flex items-center gap-1">
                                                <FiClock size={9} /> {fmt(t.updatedAt || t.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                {selected ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 620 }}>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                    selected.status === 'open'
                                        ? 'bg-orange-50 text-orange-500 border-orange-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {selected.status === 'open' ? <FiAlertCircle size={15} /> : <FiCheckCircle size={15} />}
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold text-gray-800 leading-tight">{selected.subject || selected.title}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selected.user?.name || selected.userId?.name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selected.status === 'open' && (
                                    <button
                                        onClick={() => handleCloseTicket(selected._id)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold uppercase tracking-widest hover:bg-emerald-100 flex items-center gap-1.5"
                                    >
                                        <FiCheckCircle size={12} /> Close
                                    </button>
                                )}
                                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                    <FiX size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {(selected.messages || []).map((m, i) => {
                                const isAdmin = m.senderModel === 'Admin' || m.sender === 'admin';
                                return (
                                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-xl text-sm font-medium leading-relaxed ${
                                            isAdmin
                                                ? 'bg-[#1e6bd6] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
                                            {m.content || m.message || m.text}
                                            <p className={`text-[9px] font-bold mt-1 ${isAdmin ? 'text-white/60' : 'text-gray-400'}`}>
                                                {fmt(m.createdAt || m.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply box */}
                        {selected.status === 'open' ? (
                            <div className="p-3 border-t border-gray-100 flex gap-2">
                                <input
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                                    placeholder="Type your reply..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={sending || !reply.trim()}
                                    className="px-4 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                                >
                                    <FiSend size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 border-t border-gray-100 text-center">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ticket Closed</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center" style={{ height: 620 }}>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 mx-auto mb-3">
                                <FiMessageSquare size={24} />
                            </div>
                            <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Select a ticket to view</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
