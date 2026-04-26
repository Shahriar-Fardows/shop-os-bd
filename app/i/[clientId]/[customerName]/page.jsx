"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiInfo } from 'react-icons/fi';

function InvoiceContent({ params }) {
    const { clientId, customerName } = use(params);
    const customer = decodeURIComponent(customerName);

    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

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

    return (
        <div className="min-h-screen bg-[#f1f5f9] font-nunito pb-12">
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
                <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 p-8 border border-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    
                    <div className="text-center relative z-10">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">মোট বকেয়া পরিমাণ</p>
                        <h3 className="text-5xl font-black text-red-500 mb-4 tracking-tighter">
                            <span className="text-2xl mr-1">৳</span>
                            {data.totalDue?.toLocaleString('bn-BD')}
                        </h3>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <FiAlertCircle size={12} />
                            পরিশোধের জন্য অনুরোধ করা হলো
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                        <div className="text-center border-r border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট কেনাকাটা</p>
                            <p className="text-lg font-black text-gray-800">৳{totalBill?.toLocaleString('bn-BD')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">মোট জমা</p>
                            <p className="text-lg font-black text-emerald-500">৳{totalPaid?.toLocaleString('bn-BD')}</p>
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

                    <div className="space-y-3">
                        {data.transactions.map((t, i) => (
                            <div key={i} className="group bg-white rounded-3xl p-5 border border-white hover:border-blue-100 transition-all shadow-sm hover:shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col">
                                        <h5 className="font-black text-gray-800 leading-tight mb-1">{t.title}</h5>
                                        <div className="text-[10px] font-bold text-gray-400">
                                            <span>{fmt(t.date)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-red-500">৳{t.dueAmount?.toLocaleString('bn-BD')}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">বাকি</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">মোট বিল: ৳{t.totalBill?.toLocaleString('bn-BD')}</span>
                                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">জমা: ৳{t.paidAmount?.toLocaleString('bn-BD')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="bg-white rounded-[32px] p-8 border border-white shadow-sm text-center">
                    <div className="w-16 h-16 bg-blue-50 text-[#1e6bd6] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <FiCheckCircle size={32} />
                    </div>
                    <h5 className="text-lg font-black text-gray-800 mb-2">দ্রুত পরিশোধ করতে চান?</h5>
                    <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
                        নিচের বাটনে ক্লিক করে সরাসরি দোকান মালিকের সাথে যোগাযোগ করুন এবং পেমেন্ট সম্পন্ন করুন।
                    </p>
                    
                    {data.shop.phone && (
                        <a href={`tel:${data.shop.phone}`} className="w-full flex items-center justify-center gap-3 bg-[#1e6bd6] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <FiPhone size={18} />
                            <span>মালিককে কল করুন</span>
                            <FiArrowRight className="ml-2" />
                        </a>
                    )}
                </div>

                <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2">
                        <img src="/shoposbd.png" alt="Logo" className="w-5 h-5 opacity-40 grayscale" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">ShopOS BD</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-black text-gray-400 hover:text-[#1e6bd6] transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                            <FiInfo size={12} /> সাহায্য লাগবে?
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                
                body {
                    background-color: #f1f5f9;
                }
                
                .font-nunito {
                    font-family: 'Nunito', sans-serif;
                }
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
