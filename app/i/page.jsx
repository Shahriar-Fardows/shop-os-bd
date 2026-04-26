"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';


function InvoiceContent() {
    const params   = useSearchParams();
    const clientId = params.get('c');
    const customer = params.get('n');

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

    const fmt = d => d
        ? new Date(d).toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #1e6bd6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#4b5563' }}>{error}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>লিংকটি সঠিক কিনা নিশ্চিত করুন।</p>
            </div>
        </div>
    );

    const count = data.transactions.length;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Hind Siliguri', sans-serif; background: #f0f4ff; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
                .card { animation: fadeUp 0.35s ease both; }
            `}</style>

            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f0ff 0%, #f0f4ff 60%, #fafafa 100%)', padding: '28px 16px 48px' }}>
                <div style={{ maxWidth: 460, margin: '0 auto' }}>

                    {/* ── Shop Header ── */}
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #1e6bd6 0%, #1350a8 100%)',
                        borderRadius: 20, padding: '20px 22px',
                        color: '#fff', marginBottom: 14,
                        boxShadow: '0 8px 32px #1e6bd630',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: 14,
                                background: 'rgba(255,255,255,0.18)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, fontWeight: 900,
                            }}>
                                {data.shop.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' }}>দোকান</p>
                                <h1 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>{data.shop.name}</h1>
                                {data.shop.phone && <p style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{data.shop.phone}</p>}
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>গ্রাহক</p>
                            <p style={{ fontSize: 20, fontWeight: 800 }}>{data.customer}</p>
                        </div>
                    </div>

                    {/* ── Total Due ── */}
                    <div className="card" style={{
                        background: '#fff', borderRadius: 18,
                        border: '1.5px solid #fee2e2',
                        boxShadow: '0 2px 16px #ef44441a',
                        padding: '20px 22px', marginBottom: 14,
                        textAlign: 'center',
                        animationDelay: '0.06s',
                    }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>মোট বাকি পরিমাণ</p>
                        <p style={{ fontSize: 42, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>৳{data.totalDue?.toLocaleString('bn-BD')}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginTop: 8 }}>অনুগ্রহ করে এই পরিমাণ পরিশোধ করুন</p>
                    </div>

                    {/* ── Transactions ── */}
                    {count > 0 && (
                        <div className="card" style={{
                            background: '#fff', borderRadius: 18,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 2px 12px #0000000d',
                            overflow: 'hidden', marginBottom: 14,
                            animationDelay: '0.12s',
                        }}>
                            {/* List header */}
                            <div style={{
                                padding: '12px 18px',
                                background: '#f8fafc',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <p style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    লেনদেন ইতিহাস
                                </p>
                                <span style={{
                                    background: '#1e6bd615', color: '#1e6bd6',
                                    borderRadius: 99, padding: '2px 10px',
                                    fontSize: 11, fontWeight: 800,
                                }}>
                                    {count}টি রেকর্ড
                                </span>
                            </div>

                            {/* Transaction rows */}
                            {data.transactions.map((t, i) => {
                                const hasItems = t.items?.length > 0;
                                return (
                                    <div key={t._id || i} style={{
                                        padding: '16px 18px',
                                        borderBottom: i < count - 1 ? '1px solid #f3f4f6' : 'none',
                                    }}>
                                        {/* Date */}
                                        <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 10 }}>
                                            📅 {fmt(t.date)}
                                        </p>

                                        {/* Items list */}
                                        {hasItems && (
                                            <div style={{ marginBottom: 10 }}>
                                                {t.items.map((item, j) => (
                                                    <div key={j} style={{
                                                        display: 'flex', justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '6px 0',
                                                        borderBottom: j < t.items.length - 1 ? '1px dashed #f3f4f6' : 'none',
                                                    }}>
                                                        <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 700 }}>
                                                            {item.name}
                                                        </span>
                                                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1f2937' }}>
                                                            ৳{item.price?.toLocaleString('bn-BD')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Total bill */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: '#f8fafc',
                                            borderRadius: 10, padding: '9px 14px',
                                        }}>
                                            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>মোট বিল</span>
                                            <span style={{ fontSize: 15, fontWeight: 900, color: '#1f2937' }}>
                                                ৳{t.totalBill?.toLocaleString('bn-BD')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Contact ── */}
                    <div className="card" style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 18, padding: '18px 22px',
                        textAlign: 'center',
                        animationDelay: '0.18s',
                    }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#1e6bd6', marginBottom: 8 }}>
                            পরিশোধ করতে যোগাযোগ করুন
                        </p>
                        {data.shop.phone && (
                            <a href={`tel:${data.shop.phone}`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: '#1e6bd6', color: '#fff',
                                borderRadius: 12, padding: '10px 22px',
                                fontWeight: 800, fontSize: 14,
                                textDecoration: 'none',
                            }}>
                                📞 {data.shop.phone}
                            </a>
                        )}
                        <p style={{ fontSize: 10, color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 14 }}>
                            ShopOS BD দ্বারা পরিচালিত
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}

export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #1e6bd6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        }>
            <InvoiceContent />
        </Suspense>
    );
}
