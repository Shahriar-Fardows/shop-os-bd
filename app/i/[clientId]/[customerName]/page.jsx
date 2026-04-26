"use client";
import { useState, useEffect, Suspense, use } from 'react';
import { FiPhone, FiClock, FiAlertCircle, FiCopy, FiX, FiCheckCircle, FiSend, FiArrowLeft, FiChevronRight } from 'react-icons/fi';

const BRAND = {
    bkash:  { primary: '#E2136E', name: 'bKash',  dial: '*247#' },
    nagad:  { primary: '#F7941D', name: 'Nagad',  dial: '#167#' },
    rocket: { primary: '#8C3494', name: 'Rocket', dial: '*322#' },
};

const TkBadge = ({ amount, color = 'text-gray-800', size = 'text-sm' }) => (
    <span className={`font-bold ${color} ${size} flex items-baseline gap-1 justify-center`}>
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
    const [view, setView] = useState('invoice'); // 'invoice' or 'payment'
    const [method, setMethod] = useState('bkash');
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({ transactionId: '', amount: '' });
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
                    transactionId: form.transactionId,
                    amount: Number(form.amount),
                    method
                })
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
            setSubmitted(true);
            setView('invoice');
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

    if (view === 'payment') {
        return (
            <div className="min-h-screen bg-white font-nunito pb-10">
                <div className="bg-[#1e6bd6] text-white p-4">
                    <div className="max-w-xl mx-auto flex items-center gap-4">
                        <button onClick={() => setView('invoice')} className="p-2 -ml-2"><FiArrowLeft size={20}/></button>
                        <h1 className="font-bold">বকেয়া পরিশোধ ({brand.name})</h1>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-4 mt-6">
                    <div className="flex border-b border-gray-100 mb-6">
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

                    <div className="space-y-6">
                        {/* Instructions */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                            <h3 className="font-bold text-gray-800 text-sm mb-4">পেমেন্ট করার নিয়মাবলী:</h3>
                            <div className="space-y-3">
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">১. {brand.dial} ডায়াল করুন অথবা {brand.name} অ্যাপে যান।</p>
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">২. "Send Money" অপশনে ক্লিক করুন।</p>
                                <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">প্রাপক নম্বর</p>
                                        <p className="text-lg font-bold tracking-widest text-[#1e6bd6]">{number}</p>
                                    </div>
                                    <button onClick={() => copyNumber(number)} className="bg-blue-50 text-[#1e6bd6] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                                        <FiCopy/> {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">৩. টাকার পরিমাণ হিসেবে নিচের টাকাটি লিখুন:</p>
                                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                    <p className="text-[9px] text-gray-400 uppercase font-bold">টাকার পরিমাণ</p>
                                    <p className="text-lg font-bold text-red-500">Tk {data.totalDue?.toLocaleString('en-BD')}</p>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">৪. নিশ্চিত করতে এখন আপনার {brand.name} মোবাইল মেনু পিন লিখুন।</p>
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">৫. সবকিছু ঠিক থাকলে, আপনি একটি নিশ্চিতকরণ বার্তা পাবেন।</p>
                                <p className="text-xs text-gray-600 leading-relaxed font-bold">৬. এখন নিচের বক্সে আপনার Transaction ID দিন এবং VERIFY বাটনে ক্লিক করুন।</p>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <form onSubmit={handleSubmitPayment} className="space-y-4 bg-white p-1">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block px-1">Transaction ID *</label>
                                    <input
                                        required type="text" placeholder="Transaction ID লিখুন"
                                        value={form.transactionId}
                                        onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-base font-bold focus:border-[#1e6bd6] outline-none transition-all uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block px-1">টাকার পরিমাণ *</label>
                                    <input
                                        required type="number" placeholder="কত টাকা পাঠিয়েছেন?"
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-base font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={submitting}
                                className="w-full py-4 text-white rounded-lg font-bold text-sm uppercase tracking-widest bg-[#1e6bd6] flex items-center justify-center gap-2"
                            >
                                {submitting ? 'ভেরিফাই হচ্ছে...' : <><FiSend/> VERIFY</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="border border-gray-200 p-6 rounded-lg">
                    <div className="text-center mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">মোট বকেয়া পরিমাণ</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-lg font-bold text-red-500">Tk</span>
                            <span className="text-4xl font-bold text-red-500">{data.totalDue?.toLocaleString('en-BD')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 mb-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">মোট বিল</p>
                            <TkBadge amount={totalBill} color="text-gray-800" size="text-lg" />
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">মোট জমা</p>
                            <TkBadge amount={totalPaid} color="text-emerald-600" size="text-lg" />
                        </div>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg font-bold text-center border border-emerald-100 text-sm flex items-center justify-center gap-2">
                            <FiCheckCircle/> পেমেন্ট যাচাই করা হচ্ছে...
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                if (hasAnyMethod) {
                                    setForm(f => ({ ...f, amount: String(data.totalDue) }));
                                    setView('payment');
                                } else alert("দোকানদার নম্বর সেট করেননি।");
                            }}
                            className="w-full bg-[#1e6bd6] text-white py-3 rounded-lg font-bold text-sm uppercase flex items-center justify-center gap-2"
                        >
                            বকেয়া পরিশোধ করুন <FiChevronRight/>
                        </button>
                    )}
                </div>

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