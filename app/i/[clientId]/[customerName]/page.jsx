"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiInfo, FiCopy, FiX, FiChevronRight, FiPackage } from 'react-icons/fi';

const BRAND = {
    bkash: { primary: '#E2136E', light: '#fce8f1', name: 'bKash', dial: '*247#' },
    nagad: { primary: '#F7941D', light: '#fff3e0', name: 'Nagad', dial: '*167#' },
    rocket: { primary: '#8C3494', light: '#f3e5f5', name: 'Rocket', dial: '*322#' },
};

function InvoiceContent({ params }) {
    const { clientId, customerName } = use(params);
    const customer = decodeURIComponent(customerName);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPay, setShowPay] = useState(false);
    const [method, setMethod] = useState('bkash');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!clientId || !customer) { setError('ইনভয়েস লিংক ভুল।'); setLoading(false); return; }
        const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        fetch(`${api}/accounting/public-invoice?clientId=${clientId}&customer=${encodeURIComponent(customer)}`)
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
                    অনুগ্রহ করে লিংকটি পুনরায় চেক করুন অথবা দোকান মালিকের সাথে যোগাযোগ করুন।
                </p>
            </div>
        </div>
    );

    const totalBill = data.transactions.reduce((s, t) => s + (t.totalBill || 0), 0);
    const totalPaid = data.transactions.reduce((s, t) => s + (t.paidAmount || 0), 0);
    const brand = BRAND[method] || BRAND.bkash;
    const number = data.shop[method];

    return (
        <div className={`min-h-screen bg-[#f1f5f9] font-nunito pb-12 transition-all ${showPay ? 'overflow-hidden' : ''}`}>
            {/* Top Branding / Header */}
            <div className="bg-[#1e6bd6] text-white pt-10 pb-20 px-6 rounded-b-[40px] shadow-2xl shadow-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
                
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white text-[#1e6bd6] rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg overflow-hidden border border-white/50">
                                {data.shop.logo ? (
                                    <img src={data.shop.logo} alt="Shop Logo" className="w-full h-full object-cover" />
                                ) : (
                                    data.shop.name?.[0]?.toUpperCase()
                                )}
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

            {/* Main Content Container */}
            <div className="max-w-xl mx-auto px-6 -mt-12 space-y-6 relative z-20">
                
                {/* Summary Card */}
                <div className="bg-white rounded-[32px] shadow-xl shadow-blue-900/5 p-8 border border-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full -mr-20 -mt-20 opacity-60" />
                    
                    <div className="text-center relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <FiAlertCircle size={12} />
                            পরিশোধযোগ্য
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">মোট বকেয়া পরিমাণ</p>
                        <h3 className="text-6xl font-black text-gray-900 mb-6 tracking-tighter flex items-center justify-center">
                            <span className="text-3xl mr-1 text-red-500">৳</span>
                            <span className="text-red-500">{data.totalDue?.toLocaleString('bn-BD')}</span>
                        </h3>

                        <button 
                            onClick={() => setShowPay(true)}
                            className="w-full bg-[#1e6bd6] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            পেমেন্ট করুন <FiChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dashed border-gray-100">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট বিল</p>
                            <p className="text-lg font-black text-gray-800 tracking-tight">৳{totalBill?.toLocaleString('bn-BD')}</p>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট জমা</p>
                            <p className="text-lg font-black text-emerald-500 tracking-tight">৳{totalPaid?.toLocaleString('bn-BD')}</p>
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
                                        <p className="text-sm font-black text-gray-900">৳{t.totalBill?.toLocaleString('bn-BD')}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">মোট বিল</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-xs font-black text-emerald-500">৳{t.paidAmount?.toLocaleString('bn-BD')}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">জমা</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-red-500">৳{t.dueAmount?.toLocaleString('bn-BD')}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">বাকি</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 justify-end uppercase tracking-widest">
                                            <FiClock size={10} /> {fmt(t.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2">
                        <img src="/shoposbd.png" alt="Logo" className="w-5 h-5 opacity-40 grayscale" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">ShopOS BD</span>
                    </div>
                </div>
            </div>

            {/* Payment Modal (bKash Style) */}
            {showPay && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md sm:rounded-3xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                        <button 
                            onClick={() => setShowPay(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all z-10"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="grid grid-cols-3 border-b border-gray-100">
                            {Object.entries(BRAND).map(([id, b]) => {
                                const available = !!data.shop[id];
                                return (
                                    <button 
                                        key={id}
                                        onClick={() => available && setMethod(id)}
                                        disabled={!available}
                                        className={`py-5 text-center font-black text-xs uppercase tracking-widest transition-all border-b-2 disabled:opacity-20 ${
                                            method === id ? 'border-b-current' : 'border-transparent text-gray-300 bg-gray-50/50'
                                        }`}
                                        style={{ color: method === id ? b.primary : undefined }}
                                    >
                                        {b.name}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ background: brand.primary }} className="p-6 text-white text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">মোট বকেয়া</p>
                            <h4 className="text-4xl font-black mb-6">৳{data.totalDue?.toLocaleString('bn-BD')}</h4>
                            
                            <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-3 text-left">নিচের নম্বরে "Send Money" করুন:</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black tracking-widest">{number || 'নম্বর দেয়া নেই'}</span>
                                    {number && (
                                        <button 
                                            onClick={() => copyNumber(number)}
                                            className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all shadow-lg"
                                        >
                                            {copied ? <FiCheckCircle /> : <FiCopy />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                            {[
                                `${brand.dial} ডায়াল করে অথবা অ্যাপ থেকে পেমেন্ট করুন।`,
                                `"Send Money" অপশন সিলেক্ট করুন।`,
                                `উপরের নম্বরটি প্রাপক হিসেবে দিন।`,
                                `পরিমাণ হিসেবে ৳${data.totalDue?.toLocaleString('bn-BD')} দিন।`,
                                `পেমেন্ট শেষে ট্র্যান্সেকশন আইডি সংরক্ষণ করুন এবং দোকানদারকে জানান।`,
                            ].map((step, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1e6bd6] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-blue-100">{idx + 1}</span>
                                    <p className="text-sm font-bold text-gray-600 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 pt-0">
                            <button 
                                onClick={() => setShowPay(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
                            >
                                ঠিক আছে
                            </button>
                        </div>
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
