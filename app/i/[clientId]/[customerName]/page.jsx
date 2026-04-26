"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiCopy, FiX, FiChevronRight, FiSend } from 'react-icons/fi';

const BRAND = {
    bkash:  { primary: '#E2136E', light: '#fce8f1', name: 'bKash',  dial: '*247#' },
    nagad:  { primary: '#F7941D', light: '#fff3e0', name: 'Nagad',  dial: '*167#' },
    rocket: { primary: '#8C3494', light: '#f3e5f5', name: 'Rocket', dial: '*322#' },
};

const TkBadge = ({ amount, size = 'lg', color = 'text-red-500' }) => (
    <span className={`font-black tracking-tight ${color} ${size === 'xl' ? 'text-5xl' : size === 'lg' ? 'text-xl' : 'text-sm'} flex items-baseline gap-1`}>
        <span className={`font-black ${size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-sm' : 'text-[10px]'} opacity-70`}>Tk</span>
        {amount?.toLocaleString('en-BD')}
    </span>
);

function InvoiceContent({ params }) {
    const { clientId, customerName } = use(params);
    const customer = decodeURIComponent(customerName);
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const [data,     setData]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [showPay,  setShowPay]  = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [method,   setMethod]   = useState('bkash');
    const [copied,   setCopied]   = useState(false);
    const [form,     setForm]     = useState({ transactionId: '', mobile: '', amount: '', note: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted,  setSubmitted]  = useState(false);

    useEffect(() => {
        if (!clientId || !customer) { setError('ইনভয়েস লিংক ভুল।'); setLoading(false); return; }
        fetch(`${API}/accounting/public-invoice?clientId=${clientId}&customer=${encodeURIComponent(customer)}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) setData(res.data);
                else setError(res.message || 'ডেটা পাওয়া যায়নি।');
            })
            .catch(() => setError('সার্ভারের সাথে সংযোগ হয়নি।'))
            .finally(() => setLoading(false));
    }, [clientId, customer]);

    const fmt = d => d ? new Date(d).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    const copyNumber = (num) => {
        navigator.clipboard.writeText(num);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!form.transactionId.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/payment-requests/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    customerName: customer,
                    customerMobile: form.mobile,
                    method,
                    transactionId: form.transactionId.trim(),
                    amount: Number(form.amount) || data.totalDue,
                    note: form.note,
                }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setSubmitted(true);
            setShowPay(false);
            setShowSubmit(false);
        } catch (err) {
            alert(err.message || 'জমা দিতে সমস্যা হয়েছে।');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin w-12 h-12 border-4 border-[#1e6bd6] border-t-transparent rounded-full" />
                <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">লোডিং হচ্ছে...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FiAlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">{error}</h2>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    অনুগ্রহ করে লিংকটি পুনরায় চেক করুন অথবা দোকান মালিকের সাথে যোগাযোগ করুন।
                </p>
            </div>
        </div>
    );

    const totalBill = data.transactions.reduce((s, t) => s + (t.totalBill || 0), 0);
    const totalPaid = data.transactions.reduce((s, t) => s + (t.paidAmount || 0), 0);
    const brand = BRAND[method] || BRAND.bkash;
    const number = data.shop[method];
    const hasAnyMethod = data.shop.bkash || data.shop.nagad || data.shop.rocket;

    return (
        <div className={`min-h-screen bg-[#f1f5f9] font-nunito pb-12 transition-all ${(showPay || showSubmit) ? 'overflow-hidden h-screen' : ''}`}>
            {/* Header */}
            <div className="bg-[#1e6bd6] text-white pt-10 pb-20 px-6 rounded-b-[40px] shadow-2xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white text-[#1e6bd6] rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg overflow-hidden border border-white/50">
                                {data.shop.logo ? (
                                    <img src={data.shop.logo} alt="Shop Logo" className="w-full h-full object-cover" />
                                ) : data.shop.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight">{data.shop.name}</h1>
                                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest opacity-80">ডিজিটাল মেমো</p>
                            </div>
                        </div>
                        {data.shop.phone && (
                            <a href={`tel:${data.shop.phone}`} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/20">
                                <FiPhone size={18} />
                            </a>
                        )}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-70">স্বাগতম,</p>
                        <h2 className="text-2xl font-black truncate">{data.customer}</h2>
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-blue-100/80">
                            <FiClock size={14} />
                            <span>আপডেট: {new Date().toLocaleDateString('bn-BD')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-xl mx-auto px-6 -mt-12 space-y-6 relative z-20">

                {/* Summary Card */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-blue-900/5 p-8 border border-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full -mr-20 -mt-20 opacity-60" />
                    <div className="text-center relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <FiAlertCircle size={12} />
                            পরিশোধযোগ্য
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">মোট বকেয়া পরিমাণ</p>
                        <div className="flex items-baseline justify-center gap-2 mb-6">
                            <span className="text-2xl font-black text-red-400">Tk</span>
                            <span className="text-6xl font-black text-red-500 tracking-tighter">{data.totalDue?.toLocaleString('en-BD')}</span>
                        </div>

                        {submitted ? (
                            <div className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-emerald-100">
                                <FiCheckCircle size={18} /> পেমেন্ট জমা দেওয়া হয়েছে, অনুমোদনের অপেক্ষায়
                            </div>
                        ) : hasAnyMethod ? (
                            <button
                                onClick={() => setShowPay(true)}
                                className="w-full bg-[#1e6bd6] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                পেমেন্ট করুন <FiChevronRight size={18} />
                            </button>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dashed border-gray-100">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট বিল</p>
                            <TkBadge amount={totalBill} color="text-gray-800" />
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট জমা</p>
                            <TkBadge amount={totalPaid} color="text-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">লেনদেন ইতিহাস</h4>
                        <span className="text-[10px] font-black bg-blue-50 text-[#1e6bd6] px-3 py-1 rounded-full uppercase tracking-widest">
                            {data.transactions.length} টি রেকর্ড
                        </span>
                    </div>
                    <div className="space-y-2">
                        {data.transactions.map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-black text-gray-800 leading-tight truncate">{t.title}</h5>
                                        {t.items?.length > 0 && (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase truncate">
                                                {t.items.map(item => item.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <TkBadge amount={t.totalBill} size="sm" color="text-gray-900" />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">মোট বিল</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex gap-4">
                                        <div>
                                            <TkBadge amount={t.paidAmount} size="sm" color="text-emerald-500" />
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">জমা</p>
                                        </div>
                                        <div>
                                            <TkBadge amount={t.dueAmount} size="sm" color="text-red-500" />
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">বাকি</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                        <FiClock size={10} /> {fmt(t.date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2">
                        <img src="/shoposbd.png" alt="Logo" className="w-5 h-5 opacity-40 grayscale" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">ShopOS BD</span>
                    </div>
                </div>
            </div>

            {/* ===== PAYMENT MODAL (Step 1: Choose method & see number) ===== */}
            {showPay && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md sm:rounded-3xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                        <button onClick={() => setShowPay(false)} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all z-10">
                            <FiX size={20} />
                        </button>

                        {/* Tabs */}
                        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${Object.entries(BRAND).filter(([id]) => data.shop[id]).length}, 1fr)` }}>
                            {Object.entries(BRAND).filter(([id]) => data.shop[id]).map(([id, b]) => (
                                <button
                                    key={id}
                                    onClick={() => setMethod(id)}
                                    className="py-5 text-center font-black text-xs uppercase tracking-widest transition-all border-b-2"
                                    style={{ borderBottomColor: method === id ? b.primary : 'transparent', color: method === id ? b.primary : '#aaa' }}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>

                        {/* Amount + Number */}
                        <div style={{ background: brand.primary }} className="p-6 text-white text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">মোট বকেয়া</p>
                            <div className="flex items-baseline justify-center gap-2 mb-5">
                                <span className="text-2xl font-black opacity-80">Tk</span>
                                <span className="text-5xl font-black">{data.totalDue?.toLocaleString('en-BD')}</span>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-2 text-left">নিচের নম্বরে "Send Money" করুন:</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black tracking-widest">{number}</span>
                                    <button onClick={() => copyNumber(number)} className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all shadow-lg">
                                        {copied ? <FiCheckCircle /> : <FiCopy />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-5 space-y-3 max-h-[35vh] overflow-y-auto">
                            {[
                                `${brand.dial} ডায়াল করুন অথবা ${brand.name} অ্যাপে যান।`,
                                `"Send Money" অপশন সিলেক্ট করুন।`,
                                `প্রাপক নম্বর হিসেবে ${number} দিন।`,
                                `পরিমাণ হিসেবে Tk ${data.totalDue?.toLocaleString('en-BD')} দিন।`,
                                `পেমেন্ট শেষে Transaction ID সংরক্ষণ করুন এবং নিচে জমা দিন।`,
                            ].map((step, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1e6bd6] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-blue-100">{idx + 1}</span>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 pt-0 flex gap-3">
                            <button onClick={() => setShowPay(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all">
                                বন্ধ করুন
                            </button>
                            <button onClick={() => { setShowPay(false); setShowSubmit(true); setForm(f => ({ ...f, amount: String(data.totalDue) })); }} className="flex-1 py-3.5 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all" style={{ background: brand.primary }}>
                                <FiSend size={16} /> ID জমা দিন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SUBMIT TRANSACTION ID MODAL (Step 2) ===== */}
            {showSubmit && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md sm:rounded-3xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                        <div style={{ background: brand.primary }} className="p-6 text-white">
                            <button onClick={() => { setShowSubmit(false); setShowPay(true); }} className="absolute top-4 left-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
                                <span className="text-lg font-black">←</span>
                            </button>
                            <button onClick={() => setShowSubmit(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
                                <FiX size={18} />
                            </button>
                            <div className="text-center mt-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">ট্র্যান্সেকশন আইডি দিন</p>
                                <p className="font-black text-lg opacity-90">{brand.name} পেমেন্ট ভেরিফাই করুন</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">ট্র্যান্সেকশন আইডি *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="ট্র্যান্সেকশন আইডি দিন"
                                    value={form.transactionId}
                                    onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-base font-black focus:border-current outline-none transition-all"
                                    style={{ '--tw-ring-color': brand.primary }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">আপনার মোবাইল নম্বর (01XXXXXXXXX)</label>
                                <input
                                    type="text"
                                    placeholder="01XXXXXXXXX"
                                    value={form.mobile}
                                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-base font-bold focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">পরিমাণ (Tk)</label>
                                <input
                                    type="number"
                                    placeholder="পরিমাণ"
                                    value={form.amount}
                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-base font-bold focus:outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
                                style={{ background: brand.primary }}
                            >
                                {submitting ? (
                                    <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> জমা হচ্ছে...</>
                                ) : (
                                    <><FiSend size={16} /> VERIFY</>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 font-bold">সাবমিট করার পর দোকানদার যাচাই করবে • ১-৬ ঘণ্টার মধ্যে সক্রিয় হবে</p>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                body { background-color: #f1f5f9; }
                .font-nunito { font-family: 'Nunito', sans-serif; }
            `}</style>
        </div>
    );
}

export default function InvoicePage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="animate-spin w-10 h-10 border-4 border-[#1e6bd6] border-t-transparent rounded-full" />
            </div>
        }>
            <InvoiceContent params={params} />
        </Suspense>
    );
}
