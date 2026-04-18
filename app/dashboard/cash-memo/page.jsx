"use client";
import { useState, useEffect, useRef } from 'react';
import {
    FiFileText, FiPrinter, FiPlus, FiX, FiRefreshCw, FiTrash2,
    FiAlertCircle, FiDollarSign, FiHome, FiUser, FiPackage,
    FiChevronLeft, FiChevronRight, FiCheck, FiEye
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const DEFAULT_MEMO = {
    shopName: 'Your Shop Name',
    shopTagline: 'Computer · Print · Photocopy · Scan',
    shopAddress: '',
    shopPhone: '',
    memoNo: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [
        { name: 'Photocopy (A4)', qty: 10, rate: 2 },
        { name: 'Color Print', qty: 2, rate: 10 },
    ],
    discount: 0,
    paid: 0,
    note: 'Thank you for your business!',
    primary: '#1e6bd6',
};

const DRAFT_KEY = 'shoposbd-memo-draft-v2';

const PRESET_ITEMS = [
    'Photocopy (A4)', 'Photocopy (Legal)', 'Black & White Print', 'Color Print',
    'Passport Photo (4 copies)', 'Lamination (A4)', 'Lamination (ID)',
    'Scanning', 'Binding (Spiral)', 'CV / Bio-Data Print', 'NID Print',
    'Internet Browsing (per hour)', 'Typing (per page)', 'Email Writing'
];

const STEPS = [
    { id: 'shop', label: 'Shop', icon: FiHome, help: 'Your shop information' },
    { id: 'memo', label: 'Memo', icon: FiFileText, help: 'Memo number & date' },
    { id: 'customer', label: 'Customer', icon: FiUser, help: 'Customer details' },
    { id: 'items', label: 'Items', icon: FiPackage, help: 'Products / services' },
    { id: 'payment', label: 'Payment', icon: FiDollarSign, help: 'Discount & paid amount' },
    { id: 'review', label: 'Review', icon: FiEye, help: 'Preview & print' },
];

export default function CashMemoPage() {
    const [memo, setMemo] = useState(DEFAULT_MEMO);
    const [loaded, setLoaded] = useState(false);
    const [step, setStep] = useState(0);
    const printRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) setMemo({ ...DEFAULT_MEMO, ...JSON.parse(saved) });
            const savedStep = localStorage.getItem(DRAFT_KEY + '-step');
            if (savedStep) setStep(Math.min(parseInt(savedStep) || 0, STEPS.length - 1));
        } catch {}
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(memo));
            localStorage.setItem(DRAFT_KEY + '-step', String(step));
        } catch {}
    }, [memo, step, loaded]);

    const update = (key, val) => setMemo((m) => ({ ...m, [key]: val }));
    const addItem = () => update('items', [...memo.items, { name: '', qty: 1, rate: 0 }]);
    const removeItem = (i) => update('items', memo.items.filter((_, idx) => idx !== i));
    const updateItem = (i, key, val) => update('items', memo.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

    const subtotal = memo.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
    const discount = Number(memo.discount) || 0;
    const total = Math.max(0, subtotal - discount);
    const paid = Math.min(Number(memo.paid) || 0, total);
    const due = total - paid;

    const handlePrint = () => window.print();

    const handleReset = async () => {
        const res = await Swal.fire({
            title: 'Clear memo?', text: 'This clears customer & items, keeps shop info.',
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#1e6bd6', confirmButtonText: 'Yes, clear',
        });
        if (res.isConfirmed) {
            setMemo((m) => ({
                ...m,
                memoNo: '', customerName: '', customerPhone: '', customerAddress: '',
                items: [{ name: '', qty: 1, rate: 0 }],
                discount: 0, paid: 0,
            }));
            setStep(1);
        }
    };

    const handleNew = () => {
        setMemo((m) => ({
            ...m,
            memoNo: String(Date.now()).slice(-6),
            date: new Date().toISOString().slice(0, 10),
            customerName: '', customerPhone: '', customerAddress: '',
            items: [{ name: '', qty: 1, rate: 0 }],
            discount: 0, paid: 0,
        }));
        setStep(2);
    };

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));
    const pct = Math.round(((step + 1) / STEPS.length) * 100);
    const current = STEPS[step];

    return (
        <div className="font-nunito pb-20">
            <div className="flex justify-between items-center mb-6 no-print px-6 pt-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cash Memo / Receipt Maker</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                        Professional Shop Receipt · Step-by-Step · Auto-Saved
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleNew} className="text-[#1e6bd6] hover:text-[#1656ac] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <FiRefreshCw /> New Memo
                    </button>
                    <button onClick={handleReset} className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <FiTrash2 /> Clear
                    </button>
                    <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 shadow-sm shadow-blue-100">
                        <FiPrinter /> Print Memo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6 items-start px-6">

                {/* Step Form */}
                <div className="no-print space-y-4 xl:sticky xl:top-6">
                    {/* Stepper */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest">
                                Step {step + 1} of {STEPS.length}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pct}% Complete</span>
                        </div>
                        <div className="h-1.5 bg-blue-50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-[#1e6bd6] transition-all duration-300 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const done = i < step;
                                const active = i === step;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setStep(i)}
                                        title={s.label}
                                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                                            active
                                                ? 'bg-[#1e6bd6] text-white shadow-sm shadow-blue-100 scale-105'
                                                : done
                                                    ? 'bg-blue-50 text-[#1e6bd6] border border-blue-100'
                                                    : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {done ? <FiCheck size={14} /> : <Icon size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Form Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shadow-sm">
                                <current.icon size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">{current.label}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{current.help}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {current.id === 'shop' && (
                                <>
                                    <Field label="Shop Name">
                                        <input value={memo.shopName} onChange={(e) => update('shopName', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Tagline">
                                        <input value={memo.shopTagline} onChange={(e) => update('shopTagline', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Shop Address">
                                        <input value={memo.shopAddress} onChange={(e) => update('shopAddress', e.target.value)} placeholder="Full address" className={inputClass} />
                                    </Field>
                                    <Field label="Phone / Mobile">
                                        <input value={memo.shopPhone} onChange={(e) => update('shopPhone', e.target.value)} placeholder="01XXXXXXXXX" className={inputClass} />
                                    </Field>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Shop info auto-saved. Set once — reused for every memo.</p>
                                </>
                            )}

                            {current.id === 'memo' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Field label="Memo No">
                                        <input value={memo.memoNo} onChange={(e) => update('memoNo', e.target.value)} placeholder="001" className={inputClass} />
                                    </Field>
                                    <Field label="Date">
                                        <input type="date" value={memo.date} onChange={(e) => update('date', e.target.value)} className={inputClass} />
                                    </Field>
                                </div>
                            )}

                            {current.id === 'customer' && (
                                <>
                                    <Field label="Customer Name">
                                        <input value={memo.customerName} onChange={(e) => update('customerName', e.target.value)} className={inputClass} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Phone">
                                            <input value={memo.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Address">
                                            <input value={memo.customerAddress} onChange={(e) => update('customerAddress', e.target.value)} className={inputClass} />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {current.id === 'items' && (
                                <div className="space-y-2">
                                    {memo.items.map((it, i) => (
                                        <div key={i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    value={it.name}
                                                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                                                    list="preset-items"
                                                    placeholder="Item / Service"
                                                    className={`flex-1 ${inputClass}`}
                                                />
                                                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 px-1">
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Field label="Qty">
                                                    <input type="number" min="0" value={it.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} className={inputClass} />
                                                </Field>
                                                <Field label="Rate ৳">
                                                    <input type="number" min="0" step="0.01" value={it.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} className={inputClass} />
                                                </Field>
                                                <Field label="Total ৳">
                                                    <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm font-extrabold text-[#1e6bd6] text-right">
                                                        {((Number(it.qty) || 0) * (Number(it.rate) || 0)).toFixed(0)}
                                                    </div>
                                                </Field>
                                            </div>
                                        </div>
                                    ))}
                                    <datalist id="preset-items">
                                        {PRESET_ITEMS.map((p) => <option key={p} value={p} />)}
                                    </datalist>
                                    <button onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Item
                                    </button>
                                </div>
                            )}

                            {current.id === 'payment' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Discount ৳">
                                            <input type="number" min="0" value={memo.discount} onChange={(e) => update('discount', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Paid ৳">
                                            <input type="number" min="0" value={memo.paid} onChange={(e) => update('paid', e.target.value)} className={inputClass} />
                                        </Field>
                                    </div>
                                    <Field label="Note to Customer">
                                        <input value={memo.note} onChange={(e) => update('note', e.target.value)} placeholder="Thank you!" className={inputClass} />
                                    </Field>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5 mt-2">
                                        <Row label="Subtotal" value={`৳ ${subtotal.toLocaleString('en-BD')}`} />
                                        <Row label="Discount" value={`- ৳ ${discount.toLocaleString('en-BD')}`} />
                                        <div className="h-px bg-blue-200 my-1" />
                                        <Row label="Grand Total" value={`৳ ${total.toLocaleString('en-BD')}`} strong />
                                        <Row label="Paid" value={`৳ ${paid.toLocaleString('en-BD')}`} />
                                        <Row label="Due" value={`৳ ${due.toLocaleString('en-BD')}`} strong highlight={due > 0 ? 'red' : 'green'} />
                                    </div>
                                </>
                            )}

                            {current.id === 'review' && (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                        <div className="flex items-center gap-2">
                                            <FiCheck className="text-emerald-600" />
                                            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Memo Ready!</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-emerald-600 mt-2 leading-relaxed">
                                            Preview is shown on the right. Click below to print.
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-gray-600 space-y-1">
                                        <div className="flex justify-between"><span>Customer:</span><span>{memo.customerName || '—'}</span></div>
                                        <div className="flex justify-between"><span>Items:</span><span>{memo.items.length}</span></div>
                                        <div className="flex justify-between"><span>Grand Total:</span><span className="text-[#1e6bd6]">৳ {total.toLocaleString('en-BD')}</span></div>
                                        <div className="flex justify-between"><span>Due:</span><span className={due > 0 ? 'text-red-600' : 'text-emerald-600'}>৳ {due.toLocaleString('en-BD')}</span></div>
                                    </div>
                                    <button
                                        onClick={handlePrint}
                                        className="w-full py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiPrinter /> Print / Save as PDF
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100">
                            <button
                                onClick={prev}
                                disabled={step === 0}
                                className="px-4 py-2 rounded-lg bg-gray-50 text-gray-500 font-extrabold text-xs uppercase tracking-widest hover:bg-gray-100 disabled:opacity-40 flex items-center gap-1.5"
                            >
                                <FiChevronLeft /> Back
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={next}
                                    className="px-5 py-2 rounded-lg bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold text-xs uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center gap-1.5"
                                >
                                    Next <FiChevronRight />
                                </button>
                            ) : (
                                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Done ✓</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <FiAlertCircle className="text-[#1e6bd6] shrink-0 mt-0.5" size={16} />
                        <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                            Auto-saved. Shop info set once — for each new customer just jump to step 3.
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex justify-center">
                    <div
                        ref={printRef}
                        className="memo-sheet bg-white shadow-xl"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '15mm',
                            fontFamily: 'Nunito, Arial, sans-serif',
                            color: '#171717',
                            fontSize: '11pt'
                        }}
                    >
                        <div style={{
                            borderBottom: `3px solid ${memo.primary}`,
                            paddingBottom: '8pt',
                            marginBottom: '10pt',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h1 style={{ color: memo.primary, fontSize: '22pt', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                                    {memo.shopName || 'Your Shop'}
                                </h1>
                                <div style={{ fontSize: '10pt', fontWeight: 600, color: '#6b7280', marginTop: '2pt' }}>
                                    {memo.shopTagline}
                                </div>
                                <div style={{ fontSize: '9.5pt', marginTop: '4pt', color: '#374151' }}>
                                    {memo.shopAddress && <div>{memo.shopAddress}</div>}
                                    {memo.shopPhone && <div><strong>Mobile:</strong> {memo.shopPhone}</div>}
                                </div>
                            </div>
                            <div style={{
                                background: memo.primary, color: '#fff',
                                padding: '6pt 14pt', borderRadius: '4pt',
                                textAlign: 'center', fontWeight: 800,
                                letterSpacing: '2px', fontSize: '12pt'
                            }}>
                                CASH MEMO
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10pt', fontSize: '10pt' }}>
                            <div>
                                <div><strong>Memo No:</strong> {memo.memoNo || '—'}</div>
                                <div><strong>Date:</strong> {memo.date}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div><strong>Customer:</strong> {memo.customerName || '—'}</div>
                                {memo.customerPhone && <div><strong>Phone:</strong> {memo.customerPhone}</div>}
                                {memo.customerAddress && <div><strong>Address:</strong> {memo.customerAddress}</div>}
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', marginBottom: '12pt' }}>
                            <thead>
                                <tr style={{ background: memo.primary, color: '#fff' }}>
                                    <th style={{ padding: '6pt', textAlign: 'center', width: '8%', fontWeight: 700 }}>SL</th>
                                    <th style={{ padding: '6pt', textAlign: 'left', fontWeight: 700 }}>Description</th>
                                    <th style={{ padding: '6pt', textAlign: 'center', width: '14%', fontWeight: 700 }}>Qty</th>
                                    <th style={{ padding: '6pt', textAlign: 'right', width: '18%', fontWeight: 700 }}>Rate (৳)</th>
                                    <th style={{ padding: '6pt', textAlign: 'right', width: '20%', fontWeight: 700 }}>Total (৳)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memo.items.map((it, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '5pt', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ padding: '5pt' }}>{it.name || '—'}</td>
                                        <td style={{ padding: '5pt', textAlign: 'center' }}>{it.qty}</td>
                                        <td style={{ padding: '5pt', textAlign: 'right' }}>{Number(it.rate).toLocaleString('en-BD')}</td>
                                        <td style={{ padding: '5pt', textAlign: 'right', fontWeight: 700 }}>
                                            {((Number(it.qty) || 0) * (Number(it.rate) || 0)).toLocaleString('en-BD')}
                                        </td>
                                    </tr>
                                ))}
                                {Array.from({ length: Math.max(0, 6 - memo.items.length) }).map((_, i) => (
                                    <tr key={'e' + i} style={{ borderBottom: '1px solid #f3f4f6', height: '22pt' }}>
                                        <td></td><td></td><td></td><td></td><td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14pt' }}>
                            <div style={{ width: '42%', fontSize: '10.5pt' }}>
                                <TotalRow label="Subtotal" value={subtotal} />
                                <TotalRow label="Discount" value={-discount} />
                                <div style={{ borderTop: `2px solid ${memo.primary}`, margin: '4pt 0' }} />
                                <TotalRow label="Grand Total" value={total} strong primary={memo.primary} />
                                <TotalRow label="Paid" value={paid} />
                                <TotalRow label="Due" value={due} strong primary={due > 0 ? '#dc2626' : '#059669'} />
                            </div>
                        </div>

                        {memo.note && (
                            <div style={{
                                fontSize: '10pt', fontStyle: 'italic',
                                color: '#6b7280', marginTop: '20pt',
                                padding: '8pt 12pt',
                                background: '#f9fafb',
                                borderLeft: `3px solid ${memo.primary}`,
                                borderRadius: '2pt'
                            }}>
                                <strong style={{ color: memo.primary, fontStyle: 'normal' }}>Note:</strong> {memo.note}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { background: #fff !important; }
                    .no-print { display: none !important; }
                    .memo-sheet {
                        box-shadow: none !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                    }
                    aside, header { display: none !important; }
                    body * { visibility: hidden; }
                    .memo-sheet, .memo-sheet * { visibility: visible; }
                    .memo-sheet { position: absolute; top: 0; left: 0; }
                }
            `}</style>
        </div>
    );
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all";

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function Row({ label, value, strong, highlight }) {
    const color = highlight === 'red' ? '#dc2626' : highlight === 'green' ? '#059669' : '#1e6bd6';
    return (
        <div className="flex justify-between items-center text-xs">
            <span className={`font-bold uppercase tracking-widest ${strong ? 'text-gray-700' : 'text-gray-500'}`}>{label}</span>
            <span className={`${strong ? 'font-extrabold text-sm' : 'font-bold'}`} style={{ color: strong ? color : '#374151' }}>{value}</span>
        </div>
    );
}

function TotalRow({ label, value, strong, primary }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2pt 0',
            fontWeight: strong ? 800 : 500,
            color: strong ? (primary || '#1e6bd6') : '#374151',
            fontSize: strong ? '11.5pt' : '10.5pt'
        }}>
            <span>{label}</span>
            <span>৳ {Number(value).toLocaleString('en-BD')}</span>
        </div>
    );
}
