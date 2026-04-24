"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    FiMessageSquare, FiSend, FiShoppingBag, FiClock, FiCheckCircle,
    FiXCircle, FiRefreshCw, FiPlus, FiTrash2
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const TABS = [
    { key: 'buy',      label: 'প্যাকেজ কিনুন',   icon: FiShoppingBag  },
    { key: 'orders',   label: 'আমার অর্ডার',     icon: FiClock        },
    { key: 'history',  label: 'পাঠানোর ইতিহাস', icon: FiMessageSquare },
];

const STATUS_STYLES = {
    pending:  { bg: 'bg-amber-50 text-amber-600 border-amber-100',      icon: FiClock,       label: 'অপেক্ষামাণ'  },
    approved: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: FiCheckCircle, label: 'অনুমোদিত'    },
    rejected: { bg: 'bg-red-50 text-red-500 border-red-100',             icon: FiXCircle,     label: 'বাতিল'       },
    success:  { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: FiCheckCircle, label: 'সফল'         },
    failed:   { bg: 'bg-red-50 text-red-500 border-red-100',             icon: FiXCircle,     label: 'ব্যর্থ'      },
};

export default function SmsPage() {
    const api = useAxios();
    const [tab,       setTab]       = useState('history');
    const [balance,   setBalance]   = useState(0);
    const [packages,  setPackages]  = useState([]);
    const [orders,    setOrders]    = useState([]);
    const [history,   setHistory]   = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [sending,   setSending]   = useState(false);

    // Send form state
    const [recipients, setRecipients] = useState(['']); // array of phone numbers
    const [message,    setMessage]    = useState('');

    // Buy form state
    const [buyPkg,      setBuyPkg]      = useState(null);
    const [buyForm,     setBuyForm]     = useState({ transactionId: '', senderPhone: '', method: 'bkash' });
    const [buyLoading,  setBuyLoading]  = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [balRes, pkgRes, ordRes, histRes] = await Promise.all([
                api.get('/sms/balance-quota'),
                api.get('/sms-packages/active'),
                api.get('/sms-orders/mine'),
                api.get('/sms/history'),
            ]);
            const bal = balRes.data?.data || {};
            setBalance((bal.smsBalance || 0) + (bal.remainingQuota || 0));
            setPackages(pkgRes.data?.data || []);
            setOrders(ordRes.data?.data || []);
            setHistory(histRes.data?.data || []);
        } catch {}
        finally { setLoading(false); }
    }, [api]);

    useEffect(() => { load(); }, [load]);

    // ── Send SMS ──────────────────────────────────────────────────────
    const addRecipient   = () => setRecipients(r => [...r, '']);
    const removeRecipient = (i) => setRecipients(r => r.filter((_, idx) => idx !== i));
    const updateRecipient = (i, v) => setRecipients(r => r.map((x, idx) => idx === i ? v : x));

    const charCount = message.length;
    const smsPages  = charCount === 0 ? 0 : Math.ceil(charCount / 160);

    const handleSend = async () => {
        const phones = recipients.map(p => p.trim()).filter(Boolean);
        if (!phones.length) { Swal.fire('ত্রুটি', 'প্রাপকের নম্বর দিন', 'error'); return; }
        if (!message.trim()) { Swal.fire('ত্রুটি', 'বার্তা লিখুন', 'error'); return; }
        if (phones.length > balance) {
            Swal.fire('ব্যালেন্স কম', `আপনার ব্যালেন্স: ${balance} SMS। প্রয়োজন: ${phones.length} SMS।`, 'warning');
            return;
        }

        const ok = await Swal.fire({
            title: 'SMS পাঠাবেন?',
            html: `<div class="text-sm font-nunito text-left space-y-1">
                <p><b>প্রাপক:</b> ${phones.length} জন</p>
                <p><b>বার্তা দৈর্ঘ্য:</b> ${charCount} অক্ষর · ${smsPages} SMS</p>
                <p class="text-amber-600 font-bold">ব্যালেন্স থেকে ${phones.length} SMS কাটবে।</p>
            </div>`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: '#1e6bd6', confirmButtonText: 'পাঠান',
            cancelButtonText: 'বাতিল',
        });
        if (!ok.isConfirmed) return;

        setSending(true);
        try {
            const res = await api.post('/sms/send', { recipients: phones, message: message.trim() });
            const sent = res.data?.data?.sent || phones.length;
            setBalance(b => Math.max(0, b - sent));
            Swal.fire({ icon: 'success', title: `${sent}টি SMS পাঠানো হয়েছে!`, showConfirmButton: false, timer: 1800 });
            setRecipients(['']);
            setMessage('');
            load();
        } catch (e) {
            Swal.fire('ত্রুটি', e?.response?.data?.message || 'SMS পাঠাতে ব্যর্থ', 'error');
        } finally { setSending(false); }
    };

    // ── Buy package ───────────────────────────────────────────────────
    const openBuy = (pkg) => {
        setBuyPkg(pkg);
        setBuyForm({ transactionId: '', senderPhone: '', method: 'bkash' });
    };

    const handleBuy = async () => {
        if (!buyForm.transactionId.trim()) { Swal.fire('ত্রুটি', 'Transaction ID দিন', 'error'); return; }
        if (!buyForm.senderPhone.trim())   { Swal.fire('ত্রুটি', 'আপনার ফোন নম্বর দিন', 'error'); return; }
        setBuyLoading(true);
        try {
            await api.post('/sms-orders', {
                packageId:     buyPkg._id,
                transactionId: buyForm.transactionId.trim(),
                senderPhone:   buyForm.senderPhone.trim(),
                method:        buyForm.method,
            });
            setBuyPkg(null);
            Swal.fire({
                icon: 'success',
                title: 'অর্ডার জমা হয়েছে!',
                text: 'অ্যাডমিন অনুমোদন করলে SMS ব্যালেন্স যোগ হবে।',
                confirmButtonColor: '#1e6bd6',
            });
            setTab('orders');
            load();
        } catch (e) {
            Swal.fire('ত্রুটি', e?.response?.data?.message || 'অর্ডার করতে ব্যর্থ', 'error');
        } finally { setBuyLoading(false); }
    };

    const fmt = d => d ? new Date(d).toLocaleString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="font-nunito pb-20 container mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">SMS সেবা</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">গ্রাহকদের SMS পাঠান · প্যাকেজ কিনুন</p>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-[#1e6bd6] to-[#2e7ee0] rounded-2xl p-5 mb-6 text-white shadow-lg shadow-blue-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">বর্তমান SMS ব্যালেন্স</p>
                        <p className="text-4xl font-black mt-1">{balance.toLocaleString()}</p>
                        <p className="text-xs font-bold opacity-70 mt-0.5">SMS পাঠাতে পারবেন</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                        <FiMessageSquare size={28} />
                    </div>
                </div>
                <button onClick={load} disabled={loading}
                    className="mt-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
                    <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {TABS.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap transition-all ${tab === t.key ? 'bg-white text-[#1e6bd6] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Icon size={13} /> {t.label}
                        </button>
                    );
                })}
            </div>


            {/* ── BUY TAB ── */}
            {tab === 'buy' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-16"><FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto" size={24} /></div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <FiMessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-extrabold text-gray-500">কোনো প্যাকেজ পাওয়া যায়নি</p>
                            <p className="text-xs text-gray-400 mt-1">অ্যাডমিন নতুন প্যাকেজ যোগ করলে এখানে দেখাবে।</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {packages.map(pkg => (
                                <div key={pkg._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-extrabold text-gray-800">{pkg.name}</h3>
                                            {pkg.description && <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>}
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center">
                                            <FiMessageSquare size={16} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SMS</p>
                                            <p className="text-2xl font-extrabold text-[#1e6bd6]">{pkg.smsCount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">মূল্য</p>
                                            <p className="text-2xl font-extrabold text-gray-800">৳{pkg.price?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">প্রতি SMS</p>
                                            <p className="text-lg font-extrabold text-gray-500">৳{(pkg.price / pkg.smsCount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openBuy(pkg)}
                                        className="w-full py-2.5 rounded-xl bg-[#1e6bd6] text-white font-extrabold text-xs uppercase tracking-widest hover:bg-[#1656ac] shadow-sm shadow-blue-100 transition-all">
                                        কিনুন
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ORDERS TAB ── */}
            {tab === 'orders' && (
                <div className="space-y-3">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <FiShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-extrabold text-gray-500">কোনো অর্ডার নেই</p>
                            <button onClick={() => setTab('buy')} className="mt-2 text-[#1e6bd6] font-extrabold text-xs underline">প্যাকেজ কিনুন →</button>
                        </div>
                    ) : orders.map(order => {
                        const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                        const StatusIcon = st.icon;
                        return (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-extrabold text-gray-800">{order.package?.name}</p>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                            {order.smsCount?.toLocaleString()} SMS · ৳{order.price} · {order.method?.toUpperCase()}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md border flex items-center gap-1 ${st.bg}`}>
                                        <StatusIcon size={9} /> {st.label}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                                    <span>Transaction ID: <strong className="text-gray-600 font-mono">{order.transactionId}</strong></span>
                                    <span>{fmt(order.createdAt)}</span>
                                </div>
                                {order.status === 'rejected' && order.rejectReason && (
                                    <p className="mt-2 text-[11px] font-medium text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                                        কারণ: {order.rejectReason}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── HISTORY TAB ── */}
            {tab === 'history' && (
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <FiMessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-extrabold text-gray-500">কোনো SMS পাঠানো হয়নি</p>
                        </div>
                    ) : history.map(log => {
                        const st = STATUS_STYLES[log.status] || STATUS_STYLES.success;
                        const StatusIcon = st.icon;
                        return (
                            <div key={log._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-700 truncate">{log.message}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">
                                            প্রাপক: {log.count} জন · {(log.recipients || []).slice(0, 3).join(', ')}{log.count > 3 ? ` +${log.count - 3}` : ''}
                                        </p>
                                    </div>
                                    <span className={`ml-3 text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md border flex items-center gap-1 shrink-0 ${st.bg}`}>
                                        <StatusIcon size={9} /> {st.label}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-300">{fmt(log.createdAt)}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Buy Modal */}
            {buyPkg && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md font-nunito overflow-hidden">
                        <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-blue-50/40">
                            <div className="w-9 h-9 rounded-lg bg-[#1e6bd6] text-white flex items-center justify-center">
                                <FiShoppingBag size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-gray-800">{buyPkg.name} কিনুন</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{buyPkg.smsCount?.toLocaleString()} SMS · ৳{buyPkg.price?.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700 font-medium">
                                <strong className="font-extrabold">পেমেন্ট করুন:</strong> bKash/Nagad নম্বরে <strong>৳{buyPkg.price}</strong> পাঠান, তারপর Transaction ID দিন।
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">পেমেন্ট পদ্ধতি</label>
                                <select value={buyForm.method} onChange={e => setBuyForm(f => ({ ...f, method: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 focus:border-[#1e6bd6] outline-none">
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="rocket">Rocket</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Transaction ID <span className="text-red-500">*</span></label>
                                <input type="text" value={buyForm.transactionId}
                                    onChange={e => setBuyForm(f => ({ ...f, transactionId: e.target.value }))}
                                    placeholder="Transaction ID লিখুন"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">আপনার ফোন নম্বর <span className="text-red-500">*</span></label>
                                <input type="tel" value={buyForm.senderPhone}
                                    onChange={e => setBuyForm(f => ({ ...f, senderPhone: e.target.value }))}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-100">
                            <button onClick={() => setBuyPkg(null)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-extrabold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                                বাতিল
                            </button>
                            <button onClick={handleBuy} disabled={buyLoading}
                                className="flex-1 py-3 rounded-xl bg-[#1e6bd6] text-white font-extrabold text-xs uppercase tracking-widest hover:bg-[#1656ac] shadow-sm shadow-blue-100 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                                {buyLoading ? <FiRefreshCw size={13} className="animate-spin" /> : <FiShoppingBag size={13} />}
                                {buyLoading ? 'পাঠানো হচ্ছে…' : 'অর্ডার করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
