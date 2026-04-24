"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiPackage, FiActivity, FiTrash2 } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const UNITS = ['pcs', 'kg', 'gm', 'ltr', 'ml', 'box', 'pack', 'dozen', 'sheet', 'roll', 'meter'];

const FIELDS = [
    { key: 'name',          label: 'পণ্যের নাম',        placeholder: 'পণ্যের নাম',          required: true,  type: 'text',   col: 2 },
    { key: 'sku',           label: 'কোড / SKU',          placeholder: 'পণ্যের কোড',          required: false, type: 'text',   col: 1 },
    { key: 'unit',          label: 'পরিমাপের একক',      placeholder: 'pcs, kg…',            required: false, type: 'select', col: 1 },
    { key: 'costPrice',     label: 'ক্রয় মূল্য (৳)',    placeholder: 'ক্রয় মূল্য',         required: false, type: 'number', col: 1 },
    { key: 'sellingPrice',  label: 'বিক্রয় মূল্য (৳)', placeholder: 'বিক্রয় মূল্য',        required: false, type: 'number', col: 1 },
    { key: 'stock',         label: 'বর্তমান স্টক',       placeholder: 'বর্তমান স্টক',        required: false, type: 'number', col: 1 },
    { key: 'lowStockAlert', label: 'কম স্টক সতর্কতা',  placeholder: 'সতর্কতার সীমা',       required: false, type: 'number', col: 1 },
    { key: 'note',          label: 'মন্তব্য',            placeholder: 'যেকোনো টীকা',        required: false, type: 'text',   col: 2 },
];

export default function EditProductPage() {
    const api    = useAxios();
    const router = useRouter();
    const params = useParams();
    const id     = params?.id;

    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get('/products').then(r => {
            const found = (r.data?.data || []).find(p => p._id === id);
            if (found) {
                setForm({
                    name:          found.name          || '',
                    sku:           found.sku           || '',
                    unit:          found.unit          || 'pcs',
                    costPrice:     String(found.costPrice     ?? ''),
                    sellingPrice:  String(found.sellingPrice  ?? ''),
                    stock:         String(found.stock         ?? 0),
                    lowStockAlert: String(found.lowStockAlert ?? 5),
                    note:          found.note          || '',
                });
            } else {
                Swal.fire('ত্রুটি', 'পণ্য পাওয়া যায়নি।', 'error').then(() => router.push('/dashboard/inventory'));
            }
            setLoading(false);
        }).catch(() => { setLoading(false); router.push('/dashboard/inventory'); });
    }, [id]);

    const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const margin = form?.sellingPrice && form?.costPrice && Number(form.costPrice) > 0
        ? (((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100).toFixed(0)
        : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { Swal.fire('ত্রুটি', 'পণ্যের নাম দিন।', 'error'); return; }
        setSaving(true);
        try {
            await api.patch(`/products/${id}`, {
                name:          form.name.trim(),
                sku:           form.sku.trim(),
                unit:          form.unit || 'pcs',
                costPrice:     Number(form.costPrice)     || 0,
                sellingPrice:  Number(form.sellingPrice)  || 0,
                stock:         Number(form.stock)         || 0,
                lowStockAlert: Number(form.lowStockAlert) || 5,
                note:          form.note.trim(),
            });
            Swal.fire({ icon: 'success', title: 'আপডেট হয়েছে!', showConfirmButton: false, timer: 1400 });
            router.push('/dashboard/inventory');
        } catch (err) {
            Swal.fire('ত্রুটি', err?.response?.data?.message || 'আপডেট ব্যর্থ।', 'error');
        }
        setSaving(false);
    };

    const handleAdjust = async () => {
        const { value } = await Swal.fire({
            title: `<span class="font-nunito font-black text-lg text-[#1e6bd6]">স্টক সমন্বয়</span>`,
            html: `
                <div class="text-left font-nunito p-2 space-y-3">
                    <p class="text-sm font-bold text-gray-500">বর্তমান স্টক: <span class="text-[#1e6bd6] font-black">${form?.stock} ${form?.unit}</span></p>
                    <div class="flex gap-2">
                        <button type="button" id="btn-in"  class="flex-1 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm">↓ মাল ঢোকে</button>
                        <button type="button" id="btn-out" class="flex-1 py-3 rounded-xl bg-red-100 text-red-700 font-black text-sm">↑ মাল যায়</button>
                    </div>
                    <input id="adj-qty" type="number" min="1" class="swal2-input !m-0 !w-full !rounded-lg" placeholder="পরিমাণ লিখুন">
                    <input id="adj-type" type="hidden" value="in">
                </div>
            `,
            confirmButtonText: 'প্রয়োগ করুন',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true, cancelButtonText: 'বাতিল',
            allowOutsideClick: false, showCloseButton: true,
            didOpen: () => {
                document.getElementById('btn-in').addEventListener('click', () => {
                    document.getElementById('adj-type').value = 'in';
                    document.getElementById('btn-in').classList.add('ring-2', 'ring-emerald-400');
                    document.getElementById('btn-out').classList.remove('ring-2', 'ring-red-400');
                });
                document.getElementById('btn-out').addEventListener('click', () => {
                    document.getElementById('adj-type').value = 'out';
                    document.getElementById('btn-out').classList.add('ring-2', 'ring-red-400');
                    document.getElementById('btn-in').classList.remove('ring-2', 'ring-emerald-400');
                });
            },
            preConfirm: () => {
                const qty  = Number(document.getElementById('adj-qty').value);
                const type = document.getElementById('adj-type').value;
                if (!qty || qty <= 0) return Swal.showValidationMessage('পরিমাণ দিন');
                return { delta: type === 'out' ? -qty : qty };
            }
        });
        if (!value) return;
        try {
            const r = await api.patch(`/products/${id}/adjust`, value);
            setForm(f => ({ ...f, stock: String(r.data?.data?.stock ?? f.stock) }));
            Swal.fire({ icon: 'success', title: 'স্টক আপডেট হয়েছে', showConfirmButton: false, timer: 1200 });
        } catch (err) {
            Swal.fire('ত্রুটি', err?.response?.data?.message || 'ব্যর্থ', 'error');
        }
    };

    const handleDelete = async () => {
        const r = await Swal.fire({
            title: 'পণ্য মুছবেন?', text: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
        });
        if (r.isConfirmed) {
            await api.delete(`/products/${id}`);
            router.push('/dashboard/inventory');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <span className="animate-spin border-4 border-[#1e6bd6] border-t-transparent rounded-full w-8 h-8" />
        </div>
    );
    if (!form) return null;

    return (
        <div className="font-nunito pb-20 container mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()}
                        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all">
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">পণ্য সম্পাদনা</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{form.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleAdjust}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#1e6bd6] border border-blue-100 text-xs font-extrabold uppercase tracking-widest hover:bg-blue-100 transition-all">
                        <FiActivity size={13} /> স্টক সমন্বয়
                    </button>
                    <button onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100 text-xs font-extrabold uppercase tracking-widest hover:bg-red-100 transition-all">
                        <FiTrash2 size={13} /> মুছুন
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-blue-50/40">
                        <div className="w-9 h-9 rounded-lg bg-[#1e6bd6] text-white flex items-center justify-center">
                            <FiPackage size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-gray-800">পণ্যের তথ্য</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">সব তথ্য পরিবর্তন করতে পারবেন</p>
                        </div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                        {FIELDS.map(f => (
                            <div key={f.key} className={f.col === 2 ? 'col-span-2' : 'col-span-1'}>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
                                    {f.label}{f.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {f.type === 'select' ? (
                                    <select
                                        value={form[f.key]}
                                        onChange={e => update(f.key, e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={f.type}
                                        min={f.type === 'number' ? '0' : undefined}
                                        value={form[f.key]}
                                        onChange={e => update(f.key, e.target.value)}
                                        placeholder={f.placeholder}
                                        required={f.required}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary card */}
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-5">
                    <p className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest mb-3">সারাংশ</p>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-black text-gray-800">{form.name}</p>
                            <p className="text-xs text-gray-400 font-bold mt-0.5">{form.sku ? `কোড: ${form.sku} · ` : ''}একক: {form.unit}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base font-black text-[#1e6bd6]">৳{Number(form.sellingPrice || 0).toLocaleString()}</p>
                            {margin && <p className="text-xs font-bold text-emerald-600">+{margin}% মুনাফা</p>}
                        </div>
                    </div>
                    <div className="mt-3 flex gap-5 text-sm font-bold">
                        <span className="text-gray-600">স্টক: <strong className={`${Number(form.stock) <= 0 ? 'text-red-500' : Number(form.stock) <= Number(form.lowStockAlert) ? 'text-amber-600' : 'text-emerald-600'}`}>{form.stock} {form.unit}</strong></span>
                        <span className="text-gray-600">ক্রয়: <strong>৳{Number(form.costPrice || 0).toLocaleString()}</strong></span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-extrabold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                        বাতিল
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold text-sm uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                        {saving ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <FiSave size={15} />}
                        {saving ? 'আপডেট হচ্ছে…' : 'আপডেট করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
}
