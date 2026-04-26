"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiAlertCircle, FiCopy, FiX, FiCheckCircle, FiSend, FiArrowLeft, FiPackage } from 'react-icons/fi';

const BRAND = {
    bkash:  { primary: '#E2136E', name: 'bKash',  dial: '*247#' },
    nagad:  { primary: '#F7941D', name: 'Nagad',  dial: '#167#' },
    rocket: { primary: '#8C3494', name: 'Rocket', dial: '*322#' },
};

const TkBadge = ({ amount, color = 'text-gray-800' }) => (
    <span className={`font-bold ${color} text-sm flex items-baseline gap-1`}>
        <span className="opacity-70 text-[10px]">Tk</span>
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
    }, [clientId, customer, API]);

    const copyNumber = (num) => {
        navigator.clipboard.writeText(num);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/payment-requests/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    customerName: data.customer,
                    customerMobile: form.mobile,
                    transactionId: form.transactionId,
                    amount: Number(form.amount),
                    method
                })
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
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
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-[#1e6bd6] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="text-center max-w-sm">
                <FiAlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-800">{error}</h2>
            </div>
        </div>
    );

    const totalBill = data.transactions.reduce((sum, t) => sum + (t.totalBill || 0), 0);
    const totalPaid = data.transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
    const brand = BRAND[method];
    const number = data.shop[method];
    const fmt = d => new Date(d).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' });
    const hasAnyMethod = data.shop.bkash || data.shop.nagad || data.shop.rocket;

    return (
        <div className="min-h-screen bg-white font-nunito pb-10">
            {/* Header */}
            <div className="bg-[#1e6bd6] text-white p-4">
                <div className="max-w-xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {data.shop.logo ? (
                            <img src={data.shop.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : <span className="text-[#1e6bd6] font-bold">{data.shop.name?.[0]}</span>}
                    </div>
                    <div>
                        <h1 className="text-base font-bold">{data.shop.name}</h1>
                        <p className="text-[10px] opacity-80">ডিজিটাল মেমো</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 mt-4 space-y-4">
                {/* Dues Summary */}
                <div className="border border-gray-200 p-6 rounded-lg">
                    <div className="text-center mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">মোট বকেয়া পরিমাণ</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-lg font-bold text-red-500">Tk</span>
                            <span className="text-4xl font-bold text-red-500">{data.totalDue?.toLocaleString('en-BD')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mb-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">মোট বিল</p>
                            <TkBadge amount={totalBill} color="text-gray-800" />
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">মোট জমা</p>
                            <TkBadge amount={totalPaid} color="text-emerald-600" />
                        </div>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg font-bold text-center border border-emerald-100 text-sm">
                            পেমেন্ট যাচাই করা হচ্ছে...
                        </div>
                    ) : !showPay && !showSubmit && (
                        <button
                            onClick={() => {
                                if (hasAnyMethod) setShowPay(true);
                                else alert("দোকানদার নম্বর সেট করেননি।");
                            }}
                            className="w-full bg-[#1e6bd6] text-white py-3 rounded-lg font-bold text-sm uppercase"
                        >
                            বকেয়া পরিশোধ করুন
                        </button>
                    )}
                </div>

                {/* IN-PAGE PAYMENT FLOW (No Popup) */}
                {showPay && !submitted && (
                    <div className="border-2 border-[#1e6bd6] rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase text-gray-400">মাধ্যম নির্বাচন করুন</span>
                            <button onClick={() => setShowPay(false)}><FiX/></button>
                        </div>
                        <div className="flex">
                            {Object.entries(BRAND).filter(([id]) => data.shop[id]).map(([id, b]) => (
                                <button
                                    key={id}
                                    onClick={() => setMethod(id)}
                                    className={`flex-1 py-3 text-center border-b-2 transition-all font-bold text-xs ${method === id ? 'border-[#1e6bd6] bg-blue-50 text-[#1e6bd6]' : 'border-transparent text-gray-400'}`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">নিচের নম্বরে সেন্ড মানি করুন:</p>
                            <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
                                <span className="text-lg font-bold tracking-widest">{number}</span>
                                <button onClick={() => copyNumber(number)} className="bg-gray-100 px-3 py-1.5 rounded text-[10px] font-bold uppercase">
                                    {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-xs text-gray-600">১. {brand.name} থেকে {number} নম্বরে {data.totalDue} টাকা সেন্ড মানি করুন।</p>
                            <button 
                                onClick={() => { setShowPay(false); setShowSubmit(true); setForm(f => ({ ...f, amount: String(data.totalDue) })); }} 
                                className="w-full py-3 text-white rounded-lg font-bold text-sm"
                                style={{ background: brand.primary }}
                            >
                                ট্র্যানজেকশন আইডি জমা দিন
                            </button>
                        </div>
                    </div>
                )}

                {showSubmit && !submitted && (
                    <form onSubmit={handleSubmitPayment} className="border-2 border-[#1e6bd6] rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <button type="button" onClick={() => { setShowSubmit(false); setShowPay(true); }} className="text-xs font-bold text-gray-400 uppercase tracking-widest">← ব্যাক</button>
                            <span className="text-xs font-bold text-[#1e6bd6] uppercase tracking-widest">ভেরিফিকেশন</span>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">ট্র্যানজেকশন আইডি *</label>
                            <input
                                required type="text" placeholder="যেমন: BK1029384"
                                value={form.transactionId}
                                onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold focus:border-[#1e6bd6] outline-none transition-all uppercase"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="tel" placeholder="মোবাইল নম্বর"
                                value={form.mobile}
                                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold"
                            />
                            <input
                                type="number" placeholder="পরিমাণ"
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold"
                            />
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className="w-full py-3 text-white rounded-lg font-bold text-sm"
                            style={{ background: brand.primary }}
                        >
                            {submitting ? 'প্রসেসিং...' : 'জমা দিন'}
                        </button>
                    </form>
                )}

                {/* Transaction History */}
                <div className="pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">লেনদেন ইতিহাস</h4>
                    <div className="space-y-2">
                        {data.transactions.map((t, i) => (
                            <div key={i} className="border border-gray-100 p-3 rounded-lg flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0 flex items-center gap-3">
                                    <h5 className="font-bold text-gray-800 text-sm truncate">
                                        {t.items?.length > 0 ? t.items.map(item => item.name).join(', ') : t.title}
                                    </h5>
                                    <span className="text-[10px] font-bold text-gray-300 shrink-0">{fmt(t.date)}</span>
                                </div>
                                <div className="shrink-0">
                                    <TkBadge amount={t.totalBill} color="text-gray-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="py-8 border-t border-gray-50 text-center opacity-20">
                    <p className="text-[10px] font-bold text-gray-800 uppercase tracking-[0.4em]">ShopOS BD</p>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');
                body { background-color: #ffffff; color: #374151; }
                .font-nunito { font-family: 'Nunito', sans-serif; }
            `}</style>
        </div>
    );
}

export default function InvoicePage({ params }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <InvoiceContent params={params} />
        </Suspense>
    );
}