"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiCopy, FiX, FiChevronRight, FiSend, FiArrowLeft, FiActivity } from 'react-icons/fi';

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

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPay, setShowPay] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [method, setMethod] = useState('bkash');
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({ transactionId: '', mobile: '', amount: '', note: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!clientId || !customer) { setError('লিঙ্কটি সঠিক নয়।'); setLoading(false); return; }
        fetch(`${API}/accounting/public-invoice?clientId=${clientId}&customer=${encodeURIComponent(customer)}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) setData(res.data);
                else setError(res.message || 'ডেটা খুঁজে পাওয়া যায়নি।');
            })
            .catch(() => setError('সার্ভার সমস্যার কারণে সংযোগ করা সম্ভব হয়নি।'))
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
            alert(err.message || 'জমা দিতে সমস্যা হয়েছে।');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
            <div className="flex flex-col items-center gap-5">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-blue-600 font-bold animate-pulse text-xs tracking-widest uppercase">প্রসেসিং হচ্ছে...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[35%] flex items-center justify-center mx-auto mb-8 animate-bounce shadow-inner">
                    <FiAlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-3 leading-tight">{error}</h2>
                <p className="text-sm text-gray-500 font-medium px-4">
                    অনুগ্রহ করে লিংকটি পুনরায় চেক করুন অথবা দোকান মালিকের সাথে সরাসরি যোগাযোগ করুন।
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
        <div className={`min-h-screen bg-[#F8FAFC] font-nunito pb-10 transition-all ${(showPay || showSubmit) ? 'overflow-hidden h-screen' : ''}`}>
            
            {/* --- Premium Header --- */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#334155] text-white pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl p-1 rounded-2xl border border-white/20 shadow-xl">
                                {data.shop.logo ? (
                                    <img src={data.shop.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black">{data.shop.name?.[0]}</div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight drop-shadow-sm">{data.shop.name}</h1>
                                <span className="bg-blue-500/20 text-blue-300 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">Digital Invoice</span>
                            </div>
                        </div>
                        {data.shop.phone && (
                            <a href={`tel:${data.shop.phone}`} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group">
                                <FiPhone size={20} className="group-hover:scale-110 transition-transform"/>
                            </a>
                        )}
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-[32px] p-7 border border-white/10 shadow-inner">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Details</p>
                        <h2 className="text-3xl font-black truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{data.customer}</h2>
                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-gray-400">
                            <FiClock size={14} className="text-blue-400" />
                            <span>Last Updated: {new Date().toLocaleDateString('bn-BD')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Dashboard --- */}
            <div className="max-w-xl mx-auto px-6 -mt-16 space-y-6 relative z-20">

                {/* --- Payment Summary Card --- */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-8 border border-white overflow-hidden group">
                    <div className="text-center relative">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Pending Dues
                        </div>
                        
                        <div className="flex flex-col items-center gap-1 mb-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">মোট বকেয়া পরিমাণ</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-red-400">Tk</span>
                                <span className="text-6xl font-black text-slate-800 tracking-tighter">{data.totalDue?.toLocaleString('en-BD')}</span>
                            </div>
                        </div>

                        {submitted ? (
                            <div className="w-full bg-emerald-50 text-emerald-600 py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 border border-emerald-100 shadow-sm">
                                <div className="bg-emerald-500 text-white p-1 rounded-full"><FiCheckCircle size={16} /></div>
                                পেমেন্ট যাচাই করা হচ্ছে...
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (hasAnyMethod) {
                                        setShowPay(true);
                                    } else {
                                        alert("দোকানদার এখনও কোনো পেমেন্ট নম্বর (bKash/Nagad/Rocket) সেট করেননি। অনুগ্রহ করে সরাসরি যোগাযোগ করুন।");
                                    }
                                }}
                                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.97] transition-all"
                            >
                                পেমেন্ট করুন <FiChevronRight size={20} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t-2 border-dashed border-slate-50">
                        <div className="bg-slate-50 rounded-3xl p-4 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">মোট বিল</p>
                            <TkBadge amount={totalBill} color="text-slate-800" size="lg" />
                        </div>
                        <div className="bg-emerald-50/50 rounded-3xl p-4 text-center">
                            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">মোট জমা</p>
                            <TkBadge amount={totalPaid} color="text-emerald-600" size="lg" />
                        </div>
                    </div>
                </div>

                {/* --- Recent Activity --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <FiActivity size={16} />
                            </div>
                            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">লেনদেন ইতিহাস</h4>
                        </div>
                        <span className="text-[10px] font-black bg-white text-slate-400 px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                            {data.transactions.length} Records
                        </span>
                    </div>

                    <div className="space-y-3">
                        {data.transactions.map((t, i) => (
                            <div key={i} className="bg-white rounded-[28px] p-5 border border-white shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h5 className="font-black text-slate-800 text-xl leading-tight mb-1">{t.title}</h5>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {t.items?.map((item, idx) => (
                                                <span key={idx} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">{item.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <TkBadge amount={t.totalBill} size="lg" color="text-slate-900" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Bill Amount</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                                    <div>
                                        <TkBadge amount={t.paidAmount} size="sm" color="text-emerald-500" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Paid</p>
                                    </div>
                                    <div>
                                        <TkBadge amount={t.dueAmount} size="sm" color="text-red-500" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Due</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                            <FiClock size={10} /> {fmt(t.date)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Logo */}
                <div className="flex flex-col items-center gap-4 py-8">
                    <div className="h-px w-20 bg-slate-200" />
                    <div className="flex items-center gap-3 opacity-30">
                        <img src="/shoposbd.png" alt="Logo" className="w-6 h-6 grayscale" />
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em]">ShopOS BD</span>
                    </div>
                </div>
            </div>

            {/* --- UI MODALS: ENHANCED & RESPONSIVE --- */}
            {(showPay || showSubmit) && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    
                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-md sm:rounded-[40px] rounded-t-[40px] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                        
                        {/* Step 1: Choose Provider */}
                        {showPay && (
                            <>
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Payment Method</span>
                                    <button onClick={() => setShowPay(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white transition-all"><FiX size={20}/></button>
                                </div>
                                <div className="flex bg-white">
                                    {Object.entries(BRAND).filter(([id]) => data.shop[id]).map(([id, b]) => (
                                        <button
                                            key={id}
                                            onClick={() => setMethod(id)}
                                            className="flex-1 py-6 flex flex-col items-center gap-2 transition-all relative"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${method === id ? 'scale-110 shadow-lg' : 'opacity-40 grayscale'}`} style={{ background: b.primary }}>
                                                <span className="text-white font-black text-xs">{b.name[0]}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${method === id ? 'text-slate-800' : 'text-slate-400'}`}>{b.name}</span>
                                            {method === id && <div className="absolute bottom-0 w-8 h-1 rounded-t-full" style={{ background: b.primary }} />}
                                        </button>
                                    ))}
                                </div>
                                
                                <div style={{ background: brand.primary }} className="p-8 text-white transition-colors duration-500">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2 text-center">Amount to Pay</p>
                                    <div className="flex items-baseline justify-center gap-2 mb-8">
                                        <span className="text-2xl font-black opacity-60">Tk</span>
                                        <span className="text-6xl font-black tracking-tight">{data.totalDue?.toLocaleString('en-BD')}</span>
                                    </div>
                                    <div className="bg-black/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Merchant Number</p>
                                                <span className="text-2xl font-black tracking-widest">{number}</span>
                                            </div>
                                            <button onClick={() => copyNumber(number)} className="bg-white text-slate-900 h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-90 transition-all">
                                                {copied ? <FiCheckCircle className="text-emerald-500"/> : <FiCopy />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                        {[`Dial ${brand.dial} or use ${brand.name} App`, `Select "Send Money" Option`, `Enter Number: ${number}`, `Enter Amount: ${data.totalDue}`, `Save the Transaction ID`].map((step, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                                                <p className="text-sm font-bold text-slate-600">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => { setShowPay(false); setShowSubmit(true); setForm(f => ({ ...f, amount: String(data.totalDue) })); }} 
                                        className="w-full py-5 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                                        style={{ background: brand.primary }}
                                    >
                                        Next: Submit Transaction ID <FiChevronRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Submit Form */}
                        {showSubmit && (
                            <form onSubmit={handleSubmitPayment}>
                                <div style={{ background: brand.primary }} className="p-8 text-white relative">
                                    <button type="button" onClick={() => { setShowSubmit(false); setShowPay(true); }} className="absolute top-6 left-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"><FiArrowLeft size={20}/></button>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Verification</p>
                                        <h3 className="text-2xl font-black">Submit Transaction</h3>
                                    </div>
                                </div>
                                <div className="p-8 space-y-5">
                                    <div className="space-y-4">
                                        <div className="group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Transaction ID *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Example: BK1029384"
                                                value={form.transactionId}
                                                onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-base font-black focus:border-slate-300 focus:bg-white outline-none transition-all uppercase placeholder:normal-case"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Mobile No</label>
                                                <input
                                                    type="tel"
                                                    placeholder="017..."
                                                    value={form.mobile}
                                                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Amount</label>
                                                <input
                                                    type="number"
                                                    value={form.amount}
                                                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                                        style={{ background: brand.primary }}
                                    >
                                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend size={18}/>}
                                        Confirm Payment
                                    </button>
                                    <p className="text-center text-[10px] text-slate-400 font-bold leading-relaxed px-4">পেমেন্ট সাবমিট করার ১-৬ ঘণ্টার মধ্যে ম্যানুয়ালি যাচাই করে আপডেট করে দেওয়া হবে।</p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                body { background-color: #F8FAFC; }
                .font-nunito { font-family: 'Nunito', sans-serif; }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
                .fade-in { animation-name: fadeIn; }
                .slide-in-from-bottom-10 { animation-name: slideInBottom; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInBottom { from { transform: translateY(10%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
}

export default function InvoicePage({ params }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <InvoiceContent params={params} />
        </Suspense>
    );
}