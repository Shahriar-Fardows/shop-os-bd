"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheck, FiCopy, FiArrowRight, FiPackage, FiRefreshCw, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/* ─── bKash brand colours ─── */
const BRAND = {
    bkash: { primary: '#E2136E', light: '#fce8f1', name: 'bKash',  dial: '*247#' },
    nagad: { primary: '#F7941D', light: '#fff3e0', name: 'Nagad',  dial: '*167#' },
};

function SubscribeContent() {
    const api    = useAxios();
    const router = useRouter();
    const params = useSearchParams();
    const urlPlanId = params.get('planId');

    /* ── state ── */
    const [step,       setStep]       = useState(urlPlanId ? 'pay' : 'pick'); // pick | pay | done
    const [plans,      setPlans]      = useState([]);
    const [plan,       setPlan]       = useState(null);
    const [payConfig,  setPayConfig]  = useState({ bkashNumber: '', nagadNumber: '' });
    const [user,       setUser]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [copied,     setCopied]     = useState(false);
    const [method,     setMethod]     = useState('bkash');
    const [txId,       setTxId]       = useState('');
    const [phone,      setPhone]      = useState('');

    /* ── load user from localStorage ── */
    useEffect(() => {
        try { const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)); } catch {}
    }, []);

    /* ── load plans + payment config ── */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            // Plans (public endpoint — no auth needed)
            const pr = await fetch(`${API_BASE}/packages`);
            const pd = await pr.json();
            const allPlans = pd.data || [];
            setPlans(allPlans);

            // If planId in URL, find and set it
            if (urlPlanId) {
                const found = allPlans.find(p => p._id === urlPlanId);
                if (found) { setPlan(found); setStep('pay'); }
            }

            // Payment config — from backend /platform-config (public endpoint)
            try {
                const cr = await fetch(`${API_BASE}/platform-config`);
                const cj = await cr.json();
                if (cj?.data?.payment) {
                    setPayConfig(cj.data.payment);
                }
            } catch {
                setPayConfig({ bkashNumber: '', nagadNumber: '' });
            }

        } catch (e) {
            console.error('loadAll error', e);
        } finally {
            setLoading(false);
        }
    }, [api, urlPlanId]);

    useEffect(() => { loadAll(); }, [loadAll]);

    /* ── helpers ── */
    const selectPlan = (p) => { setPlan(p); setStep('pay'); };
    const brand      = BRAND[method] || BRAND.bkash;
    const number     = method === 'bkash' ? payConfig.bkashNumber : payConfig.nagadNumber;

    const copyNumber = () => {
        if (!number) return;
        navigator.clipboard.writeText(number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ── submit payment ── */
    const handleSubmit = async () => {
        if (!txId.trim()) return Swal.fire('', 'Transaction ID দিন', 'warning');
        if (!phone.trim()) return Swal.fire('', 'আপনার মোবাইল নম্বর দিন', 'warning');

        setSubmitting(true);
        try {
            // Backend API — admin sees this in /dashboard/payments
            await api.post('/payments', {
                planId: plan?._id,
                planName: plan?.name,
                amount: plan?.price,
                transactionId: txId.trim().toUpperCase(),
                senderPhone: phone.trim(),
                method,
            });

            // Discord notification (server-side — webhook URL stays safe in .env)
            await fetch('/api/notify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: user?.name || 'N/A',
                    userEmail: user?.email || 'N/A',
                    userPhone: user?.mobileNumber || phone,
                    planName: plan?.name || 'N/A',
                    amount: plan?.price || 0,
                    transactionId: txId.trim().toUpperCase(),
                    submittedAt: new Date().toLocaleString('en-BD'),
                }),
            }).catch(() => {}); // non-critical

            setStep('done');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'সাবমিট করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       LOADING
    ═══════════════════════════════════════════════════════════ */
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-72 gap-4">
            <FiRefreshCw className="animate-spin text-[#1e6bd6]" size={30} />
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">লোড হচ্ছে...</p>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════
       STEP: DONE ✓
    ═══════════════════════════════════════════════════════════ */
    if (step === 'done') return (
        <div className="max-w-sm mx-auto text-center py-12 space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-500 flex items-center justify-center mx-auto">
                <FiCheckCircle size={38} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">পেমেন্ট সাবমিট!</h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Admin অনুমোদন করার পর আপনার সাবস্ক্রিপশন সক্রিয় হবে। সাধারণত ১–৬ ঘণ্টার মধ্যে।
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-2 text-[12px]">
                {[
                    ['প্ল্যান', plan?.name],
                    ['পরিমাণ', `৳${plan?.price}`],
                    ['Method', method.toUpperCase()],
                    ['Trx ID', txId.toUpperCase()],
                    ['মোবাইল', phone],
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                        <span className="text-gray-400 font-bold">{k}</span>
                        <span className="font-extrabold text-gray-800">{v}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => router.push('/dashboard')}
                    className="w-full py-3 rounded-2xl bg-[#1e6bd6] text-white font-extrabold text-sm uppercase tracking-widest hover:bg-[#1656ac] flex items-center justify-center gap-2">
                ড্যাশবোর্ড <FiArrowRight size={15} />
            </button>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════
       STEP: PICK PLAN
    ═══════════════════════════════════════════════════════════ */
    if (step === 'pick') return (
        <div className="space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">সাবস্ক্রিপশন প্ল্যান</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">একটি প্ল্যান বেছে নিন এবং পেমেন্ট করুন</p>
            </div>

            {plans.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FiPackage className="mx-auto text-gray-300 mb-3" size={36} />
                    <p className="text-sm font-extrabold text-gray-500">কোনো প্ল্যান পাওয়া যায়নি</p>
                    <p className="text-[11px] text-gray-400 mt-1">Admin প্ল্যান যোগ করলে এখানে দেখাবে</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((p) => (
                        <div key={p._id}
                             className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col overflow-hidden">
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center">
                                        <FiPackage size={18} />
                                    </div>
                                </div>
                                <h3 className="text-base font-extrabold text-gray-800 mb-1">{p.name}</h3>
                                <p className="text-[11px] font-medium text-gray-500 mb-4 leading-relaxed">{p.description}</p>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-extrabold text-[#1e6bd6]">৳{p.price}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        / {p.durationInMonths === 1 ? 'মাস' : p.durationInMonths === 12 ? 'বছর' : `${p.durationInMonths} মাস`}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    {(p.features || []).map((f, fi) => (
                                        <div key={fi} className="flex items-center gap-2">
                                            <FiCheck size={11} className="text-emerald-500 shrink-0" />
                                            <span className="text-[11px] font-medium text-gray-600">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-100">
                                <button onClick={() => selectPlan(p)}
                                        className="w-full py-2.5 rounded-xl bg-[#1e6bd6] text-white font-extrabold text-xs uppercase tracking-widest hover:bg-[#1656ac] flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-100">
                                    এই প্ল্যান নিন <FiArrowRight size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    /* ═══════════════════════════════════════════════════════════
       STEP: PAY — bKash-style UI
    ═══════════════════════════════════════════════════════════ */
    return (
        <div className="flex items-start justify-center pb-10">
            <div className="w-full max-w-sm">

                {/* Back button */}
                {!urlPlanId && (
                    <button onClick={() => setStep('pick')}
                            className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 hover:text-gray-600 transition-colors">
                        <FiChevronLeft size={15} /> প্ল্যান পরিবর্তন
                    </button>
                )}

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 overflow-hidden border border-gray-100">

                    {/* ── Header: Method tabs ── */}
                    <div className="grid grid-cols-2 border-b border-gray-100">
                        {Object.entries(BRAND).map(([id, b]) => {
                            const available = id === 'bkash' ? !!payConfig.bkashNumber : !!payConfig.nagadNumber;
                            return (
                                <button key={id}
                                        onClick={() => available && setMethod(id)}
                                        disabled={!available}
                                        className={`py-4 text-center font-extrabold text-sm transition-all border-b-2 disabled:opacity-30 disabled:cursor-not-allowed ${
                                            method === id
                                                ? 'border-b-current bg-white'
                                                : 'border-transparent bg-gray-50/60 text-gray-400'
                                        }`}
                                        style={{ color: method === id ? b.primary : undefined }}
                                >
                                    {b.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Plan info strip ── */}
                    {plan && (
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                     style={{ background: brand.light, color: brand.primary }}>
                                    <FiPackage size={17} />
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-gray-700 leading-none">{plan.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                        {plan.durationInMonths === 1 ? '১ মাস' : plan.durationInMonths === 12 ? '১ বছর' : `${plan.durationInMonths} মাস`}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xl font-extrabold" style={{ color: brand.primary }}>
                                ৳ {plan.price}
                            </span>
                        </div>
                    )}

                    {/* ── Pink/Orange body ── */}
                    <div style={{ background: brand.primary }} className="p-5">

                        {/* Section title */}
                        <p className="text-center text-white font-extrabold text-sm mb-3 tracking-wide">
                            ট্র্যান্সেকশন আইডি দিন
                        </p>

                        {/* Transaction ID input */}
                        <input
                            type="text"
                            value={txId}
                            onChange={e => setTxId(e.target.value.toUpperCase())}
                            placeholder="ট্র্যান্সেকশন আইডি দিন"
                            className="w-full px-4 py-3 rounded-xl bg-white text-sm font-extrabold text-gray-800 tracking-widest outline-none placeholder:font-medium placeholder:text-gray-400 mb-4"
                            style={{ border: `2px solid ${brand.primary}` }}
                        />

                        {/* Phone input */}
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="আপনার মোবাইল নম্বর (01XXXXXXXXX)"
                            className="w-full px-4 py-3 rounded-xl bg-white text-sm font-bold text-gray-700 outline-none placeholder:font-medium placeholder:text-gray-400 mb-4"
                        />

                        {/* Instructions list */}
                        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                            {[
                                <>
                                    <span className="text-white">{brand.dial} ডায়াল করুন অথবা {brand.name} অ্যাপে যান।</span>
                                </>,
                                <>
                                    <span style={{ color: '#FFD700', fontWeight: 800 }}>"Send Money"</span>
                                    <span className="text-white/90"> -এ ক্লিক করুন।</span>
                                </>,
                                <>
                                    <span className="text-white/80">প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুন: </span>
                                    {number ? (
                                        <>
                                            <span className="font-extrabold text-white">{number}</span>
                                            <button type="button" onClick={copyNumber}
                                                    className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 text-white text-[10px] font-extrabold">
                                                {copied ? <FiCheck size={10} /> : <FiCopy size={10} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-yellow-300 font-extrabold">Number not set by admin</span>
                                    )}
                                </>,
                                <>
                                    <span className="text-white/80">টাকার পরিমাণ: </span>
                                    <span style={{ color: '#FFD700', fontWeight: 800 }}>{plan?.price || '—'}</span>
                                </>,
                                <span className="text-white/90">নিশ্চিত করতে এখন আপনার {brand.name} মোবাইল মেনু পিন লিখুন।</span>,
                                <span className="text-white/90">সবকিছু ঠিক থাকলে, আপনি {brand.name} থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।</span>,
                                <>
                                    <span className="text-white/90">এখন উপরের বক্সে আপনার </span>
                                    <span className="font-extrabold text-white">Transaction ID</span>
                                    <span className="text-white/90"> দিন এবং নিচের </span>
                                    <span style={{ color: '#FFD700', fontWeight: 800 }}>VERIFY</span>
                                    <span className="text-white/90"> বাটনে ক্লিক করুন।</span>
                                </>,
                            ].map((content, i) => (
                                <div key={i} className={`flex items-start gap-3 px-4 py-3 text-[12px] leading-relaxed ${
                                    i < 6 ? 'border-b border-white/20' : ''
                                }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0 mt-2" />
                                    <span>{content}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── VERIFY Button ── */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !txId.trim() || !phone.trim()}
                        className="w-full py-4 font-extrabold text-sm uppercase tracking-widest text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: submitting ? '#666' : brand.primary }}
                    >
                        {submitting
                            ? <><FiRefreshCw size={16} className="animate-spin" /> যাচাই হচ্ছে...</>
                            : 'VERIFY'
                        }
                    </button>
                </div>

                {/* Note */}
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                    সাবমিট করার পর Admin যাচাই করবে · ১–৬ ঘণ্টার মধ্যে সক্রিয় হবে
                </p>
            </div>
        </div>
    );
}

export default function SubscribePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-72">
                <FiRefreshCw className="animate-spin text-[#1e6bd6]" size={28} />
            </div>
        }>
            <SubscribeContent />
        </Suspense>
    );
}
