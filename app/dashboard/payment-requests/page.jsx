"use client";
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiClock, FiRefreshCw, FiCreditCard, FiFilter, FiUser, FiPhone } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const BRAND = {
    bkash:  { color: '#E2136E', bg: 'bg-[#fce8f1]', text: 'text-[#E2136E]', name: 'bKash'  },
    nagad:  { color: '#F7941D', bg: 'bg-[#fff3e0]', text: 'text-[#F7941D]', name: 'Nagad'  },
    rocket: { color: '#8C3494', bg: 'bg-[#f3e5f5]', text: 'text-[#8C3494]', name: 'Rocket' },
};

const STATUS = {
    pending:  { label: 'অপেক্ষমাণ',  bg: 'bg-amber-50',   text: 'text-amber-600',  icon: <FiClock size={12} /> },
    approved: { label: 'অনুমোদিত',   bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <FiCheck size={12} /> },
    rejected: { label: 'প্রত্যাখ্যাত', bg: 'bg-red-50',    text: 'text-red-500',    icon: <FiX size={12} /> },
};

const fmtDate = d => new Date(d).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function PaymentRequestsPage() {
    const api = useAxios();
    const [requests, setRequests] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [filter,   setFilter]   = useState('pending');
    const [processing, setProcessing] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payment-requests');
            setRequests(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (req) => {
        const confirm = await Swal.fire({
            title: 'অনুমোদন করবেন?',
            html: `<b>${req.customerName}</b> এর <b>Tk ${req.amount.toLocaleString('en-BD')}</b> পেমেন্ট অনুমোদন করলে তার বকেয়া থেকে কেটে নেওয়া হবে।`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, অনুমোদন করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#10b981',
        });
        if (!confirm.isConfirmed) return;

        setProcessing(req._id);
        try {
            await api.patch(`/payment-requests/approve/${req._id}`);
            Swal.fire({ icon: 'success', title: 'অনুমোদিত হয়েছে', text: 'বকেয়া আপডেট করা হয়েছে।', timer: 2000, showConfirmButton: false });
            fetchRequests();
        } catch (e) {
            Swal.fire('ত্রুটি', e.response?.data?.message || 'অনুমোদন করা যায়নি।', 'error');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (req) => {
        const confirm = await Swal.fire({
            title: 'প্রত্যাখ্যান করবেন?',
            text: `${req.customerName} এর পেমেন্ট অনুরোধটি বাতিল করা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, প্রত্যাখ্যান করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
        });
        if (!confirm.isConfirmed) return;

        setProcessing(req._id);
        try {
            await api.patch(`/payment-requests/reject/${req._id}`);
            Swal.fire({ icon: 'success', title: 'প্রত্যাখ্যান করা হয়েছে', timer: 1500, showConfirmButton: false });
            fetchRequests();
        } catch (e) {
            Swal.fire('ত্রুটি', e.response?.data?.message || 'সমস্যা হয়েছে।', 'error');
        } finally {
            setProcessing(null);
        }
    };

    const filtered = requests.filter(r => r.status === filter);
    const counts = { pending: 0, approved: 0, rejected: 0 };
    requests.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);

    return (
        <div className="w-full font-nunito space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">পেমেন্ট অনুরোধ</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">কাস্টমারদের পেমেন্ট যাচাই ও অনুমোদন করুন</p>
                </div>
                <button onClick={fetchRequests} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1e6bd6] hover:border-blue-200 transition-all shadow-sm">
                    <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Status filter tabs */}
            <div className="grid grid-cols-3 gap-3">
                {Object.entries(STATUS).map(([key, s]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${filter === key ? 'border-[#1e6bd6] bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-100'}`}
                    >
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1 ${filter === key ? 'text-[#1e6bd6]' : 'text-gray-400'}`}>
                            {s.icon} {s.label}
                        </div>
                        <p className={`text-2xl font-black ${filter === key ? 'text-[#1e6bd6]' : 'text-gray-700'}`}>{counts[key] || 0}</p>
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-[#1e6bd6] border-t-transparent rounded-full" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FiCreditCard size={28} className="text-gray-300" />
                    </div>
                    <p className="font-black text-gray-400 text-sm uppercase tracking-widest">কোনো {STATUS[filter]?.label} অনুরোধ নেই</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(req => {
                        const brand = BRAND[req.method] || BRAND.bkash;
                        const status = STATUS[req.status];
                        const isProcessing = processing === req._id;
                        return (
                            <div key={req._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${brand.bg} ${brand.text}`}>
                                                {brand.name}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.text}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiUser size={14} className="text-gray-400 shrink-0" />
                                            <h3 className="font-black text-gray-800 text-base truncate">{req.customerName}</h3>
                                        </div>
                                        {req.customerMobile && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <FiPhone size={12} className="text-gray-400 shrink-0" />
                                                <p className="text-xs font-bold text-gray-400">{req.customerMobile}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="flex items-baseline gap-1 justify-end">
                                            <span className="text-xs font-black text-gray-400">Tk</span>
                                            <span className="text-2xl font-black text-gray-900">{req.amount.toLocaleString('en-BD')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</p>
                                        <p className="text-sm font-black text-gray-800 tracking-widest">{req.transactionId}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400">{fmtDate(req.createdAt)}</p>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReject(req)}
                                            disabled={isProcessing}
                                            className="flex-1 py-2.5 bg-red-50 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isProcessing ? <span className="animate-spin w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full inline-block" /> : <FiX size={14} />}
                                            প্রত্যাখ্যান
                                        </button>
                                        <button
                                            onClick={() => handleApprove(req)}
                                            disabled={isProcessing}
                                            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-100"
                                        >
                                            {isProcessing ? <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full inline-block" /> : <FiCheck size={14} />}
                                            অনুমোদন করুন
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
