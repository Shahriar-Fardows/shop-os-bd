"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiPackage } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const UNITS = ['pcs', 'kg', 'gm', 'ltr', 'ml', 'box', 'pack', 'dozen', 'sheet', 'roll', 'meter'];

const FIELDS = [
    { key: 'name',          label: 'পণ্যের নাম',        placeholder: 'যেমন: A4 পেপার, প্রিন্টার কার্ট্রিজ',  required: true,  type: 'text',   col: 2 },
    { key: 'sku',           label: 'কোড / SKU',          placeholder: 'পণ্যের কোড (ঐচ্ছিক)',                 required: false, type: 'text',   col: 1 },
    { key: 'unit',          label: 'পরিমাপের একক',      placeholder: 'pcs, kg, box…',                      required: false, type: 'select', col: 1 },
    { key: 'costPrice',     label: 'ক্রয় মূল্য (৳)',    placeholder: 'কত টাকায় কিনেছেন',                  required: false, type: 'number', col: 1 },
    { key: 'sellingPrice',  label: 'বিক্রয় মূল্য (৳)', placeholder: 'কত টাকায় বিক্রি করবেন',              required: false, type: 'number', col: 1 },
    { key: 'stock',         label: 'বর্তমান স্টক',       placeholder: 'এখন কতটি আছে',                      required: false, type: 'number', col: 1 },
    { key: 'lowStockAlert', label: 'কম স্টক সতর্কতা',  placeholder: 'কতে নামলে সতর্ক করবে',               required: false, type: 'number', col: 1 },
    { key: 'note',          label: 'মন্তব্য',            placeholder: 'যেকোনো টীকা (ঐচ্ছিক)',               required: false, type: 'text',   col: 2 },
];

export default function AddProductPage() {
    const api    = useAxios();
    const router = useRouter();
    const [form, setForm] = useState({
        name: '', sku: '', unit: 'pcs',
        costPrice: '', sellingPrice: '', stock: '0', lowStockAlert: '5', note: '',
    });
    const [saving, setSaving] = useState(false);

    const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const margin = form.sellingPrice && form.costPrice && Number(form.costPrice) > 0
        ? (((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100).toFixed(0)
        : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            Swal.fire('ত্রুটি', 'পণ্যের নাম দিন।', 'error'); return;
        }
        setSaving(true);
        try {
            await api.post('/products', {
                name:          form.name.trim(),
                sku:           form.sku.trim(),
                unit:          form.unit || 'pcs',
                costPrice:     Number(form.costPrice)     || 0,
                sellingPrice:  Number(form.sellingPrice)  || 0,
                stock:         Number(form.stock)         || 0,
                lowStockAlert: Number(form.lowStockAlert) || 5,
                note:          form.note.trim(),
            });
            Swal.fire({ icon: 'success', title: 'পণ্য সংরক্ষিত হয়েছে!', showConfirmButton: false, timer: 1400 });
            router.push('/dashboard/inventory');
        } catch (err) {
            Swal.fire('ত্রুটি', err?.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
        }
        setSaving(false);
    };

    return (
        <div className="font-nunito pb-20 container mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()}
                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all">
                    <FiArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">নতুন পণ্য যোগ করুন</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ইনভেন্টরিতে নতুন পণ্য</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-blue-50/40">
                        <div className="w-9 h-9 rounded-lg bg-[#1e6bd6] text-white flex items-center justify-center">
                            <FiPackage size={16} />
                        </div>
                        <p className="text-sm font-extrabold text-gray-800">পণ্যের তথ্য</p>
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
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live preview */}
                {(form.name || form.sellingPrice || form.stock) && (
                    <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-5">
                        <p className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest mb-3">প্রিভিউ</p>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-lg font-black text-gray-800">{form.name || '—'}</p>
                                <p className="text-xs text-gray-400 font-bold mt-0.5">{form.sku ? `কোড: ${form.sku} · ` : ''}একক: {form.unit}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-[#1e6bd6]">৳{Number(form.sellingPrice || 0).toLocaleString()}</p>
                                {margin && <p className="text-xs font-bold text-emerald-600">+{margin}% মুনাফা</p>}
                            </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-sm font-bold text-gray-600">
                            <span>স্টক: <strong className="text-gray-800">{form.stock || 0} {form.unit}</strong></span>
                            <span>ক্রয়: <strong>৳{Number(form.costPrice || 0).toLocaleString()}</strong></span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-extrabold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                        বাতিল
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold text-sm uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-60 transition-all">
                        {saving ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <FiSave size={15} />}
                        {saving ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
}
