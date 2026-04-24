"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InvoiceContent() {
    const params    = useSearchParams();
    const clientId  = params.get('c');
    const customer  = params.get('n');

    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        if (!clientId || !customer) { setError('ইনভয়েস লিংক ভুল।'); setLoading(false); return; }
        const api = process.env.NEXT_PUBLIC_API_URL || '';
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin w-10 h-10 border-4 border-[#1e6bd6] border-t-transparent rounded-full" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-lg font-bold text-gray-600">{error}</p>
                <p className="text-sm text-gray-400 mt-2">লিংকটি সঠিক কিনা নিশ্চিত করুন।</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
            <div className="max-w-lg mx-auto font-nunito">

                {/* Header */}
                <div className="bg-[#1e6bd6] rounded-2xl p-6 text-white mb-4 shadow-lg shadow-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                            {data.shop.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">দোকান</p>
                            <h1 className="text-lg font-black">{data.shop.name}</h1>
                            {data.shop.phone && <p className="text-sm opacity-80 font-medium">{data.shop.phone}</p>}
                        </div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">গ্রাহক</p>
                        <p className="text-xl font-black">{data.customer}</p>
                    </div>
                </div>

                {/* Due Amount */}
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 mb-4 text-center">
                    <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest mb-1">মোট বাকি পরিমাণ</p>
                    <p className="text-4xl font-black text-red-500">৳{data.totalDue?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 font-medium mt-2">অনুগ্রহ করে এই পরিমাণ পরিশোধ করুন</p>
                </div>

                {/* Transactions */}
                {data.transactions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">বাকির বিবরণ ({data.transactions.length}টি লেনদেন)</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {data.transactions.map((t, i) => (
                                <div key={i} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-extrabold text-sm text-gray-800">{t.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{fmt(t.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold text-red-500">৳{t.dueAmount?.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">বাকি</p>
                                        </div>
                                    </div>
                                    {t.items?.length > 0 && (
                                        <div className="space-y-1 mt-2 pt-2 border-t border-gray-50">
                                            {t.items.map((item, j) => (
                                                <div key={j} className="flex justify-between text-xs font-medium text-gray-500">
                                                    <span>{item.name}</span>
                                                    <span className="font-bold">৳{item.price?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs font-bold text-gray-600 pt-1 border-t border-gray-100">
                                                <span>মোট বিল</span>
                                                <span>৳{t.totalBill?.toLocaleString()}</span>
                                            </div>
                                            {t.paidAmount > 0 && (
                                                <div className="flex justify-between text-xs font-bold text-emerald-600">
                                                    <span>পরিশোধিত</span>
                                                    <span>৳{t.paidAmount?.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact to pay */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-sm font-extrabold text-[#1e6bd6] mb-1">পরিশোধ করতে যোগাযোগ করুন</p>
                    {data.shop.phone && (
                        <a href={`tel:${data.shop.phone}`}
                            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#1e6bd6] text-white rounded-xl font-extrabold text-sm hover:bg-[#1656ac] transition-all">
                            📞 {data.shop.phone}
                        </a>
                    )}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">ShopOS BD দ্বারা পরিচালিত</p>
                </div>
            </div>
        </div>
    );
}

export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-10 h-10 border-4 border-[#1e6bd6] border-t-transparent rounded-full" />
            </div>
        }>
            <InvoiceContent />
        </Suspense>
    );
}
