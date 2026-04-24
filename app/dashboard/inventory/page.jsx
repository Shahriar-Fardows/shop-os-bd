"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiPlus, FiAlertCircle, FiTrash2, FiEdit2,
    FiActivity, FiSearch, FiRefreshCw, FiPackage
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function InventoryPage() {
    const api    = useAxios();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [filter, setFilter]     = useState('all');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const r = await api.get('/products');
            setProducts(r.data?.data || []);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const filtered = products.filter(p => {
        const matchSearch = !search || (p.name + ' ' + (p.sku || '')).toLowerCase().includes(search.toLowerCase());
        const out  = (p.stock || 0) <= 0;
        const low  = !out && (p.stock || 0) <= (p.lowStockAlert || 0);
        const matchFilter = filter === 'all' || (filter === 'out' && out) || (filter === 'low' && low);
        return matchSearch && matchFilter;
    });

    const totalUnits      = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
    const totalCostValue  = products.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.costPrice) || 0), 0);
    const totalSellValue  = products.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.sellingPrice) || 0), 0);
    const lowCount        = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockAlert || 0)).length;
    const outCount        = products.filter(p => (p.stock || 0) <= 0).length;

    const handleAdjust = async (p, e) => {
        e.preventDefault();
        e.stopPropagation();
        const { value } = await Swal.fire({
            title: `<span class="font-nunito font-black text-lg text-[#1e6bd6]">স্টক সমন্বয়: ${p.name}</span>`,
            html: `
                <div class="text-left font-nunito p-2 space-y-3">
                    <p class="text-sm font-bold text-gray-500">বর্তমান স্টক: <span class="text-[#1e6bd6] font-black">${p.stock} ${p.unit}</span></p>
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
            await api.patch(`/products/${p._id}/adjust`, value);
            fetchProducts();
            Swal.fire({ icon: 'success', title: 'স্টক আপডেট হয়েছে', showConfirmButton: false, timer: 1200 });
        } catch (err) {
            Swal.fire('ত্রুটি', err?.response?.data?.message || 'ব্যর্থ', 'error');
        }
    };

    const handleDelete = async (p, e) => {
        e.preventDefault();
        e.stopPropagation();
        const r = await Swal.fire({
            title: `"${p.name}" মুছবেন?`,
            text: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
        });
        if (r.isConfirmed) {
            await api.delete(`/products/${p._id}`);
            fetchProducts();
        }
    };

    return (
        <div className="space-y-6 font-nunito pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">পণ্য ইনভেন্টরি</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">স্টক ব্যবস্থাপনা · ক্রয় ও বিক্রয় মূল্য</p>
                </div>
                <Link href="/dashboard/inventory/add"
                    className="bg-[#1e6bd6] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-md hover:opacity-90 flex items-center gap-2 active:scale-95 transition-all">
                    <FiPlus /> নতুন পণ্য যোগ করুন
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'মোট পণ্য',        value: products.length,                        color: 'text-[#1e6bd6]',  border: 'border-l-[#1e6bd6]' },
                    { label: 'মোট স্টক',         value: `${totalUnits.toLocaleString()} একক`,  color: 'text-emerald-600', border: 'border-l-emerald-500' },
                    { label: 'স্টক মূল্য (ক্রয়)', value: `৳${totalCostValue.toLocaleString()}`,  color: 'text-gray-700',    border: 'border-l-gray-400' },
                    { label: 'স্টক মূল্য (বিক্রয়)', value: `৳${totalSellValue.toLocaleString()}`, color: 'text-purple-600', border: 'border-l-purple-400' },
                    { label: 'সতর্কতা',           value: `${lowCount + outCount} টি`,            color: 'text-red-600',     border: 'border-l-red-500' },
                ].map((s, i) => (
                    <div key={i} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.border}`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                        <h3 className={`text-lg font-black mt-1 ${s.color}`}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filter + Search */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/30">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { key: 'all',  label: 'সব পণ্য' },
                            { key: 'low',  label: `কম স্টক (${lowCount})` },
                            { key: 'out',  label: `শেষ (${outCount})` },
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${filter === f.key ? 'bg-[#1e6bd6] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="পণ্য খুঁজুন…"
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-100 bg-white text-sm font-medium focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none" />
                    </div>
                    <button onClick={fetchProducts} className="text-gray-400 hover:text-[#1e6bd6] transition-colors shrink-0" title="রিফ্রেশ">
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><FiRefreshCw className="animate-spin text-[#1e6bd6]" size={24} /></div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-6 py-3">পণ্য</th>
                                <th className="px-6 py-3 text-right">ক্রয় / বিক্রয়</th>
                                <th className="px-6 py-3 text-center">স্টক</th>
                                <th className="px-6 py-3 text-center">অবস্থা</th>
                                <th className="px-6 py-3 text-center">কার্যক্রম</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {filtered.map(p => {
                                const out = (p.stock || 0) <= 0;
                                const low = !out && (p.stock || 0) <= (p.lowStockAlert || 0);
                                const margin = p.sellingPrice && p.costPrice && Number(p.costPrice) > 0
                                    ? (((p.sellingPrice - p.costPrice) / p.costPrice) * 100).toFixed(0) : null;
                                return (
                                    <tr key={p._id} className="hover:bg-blue-50/10 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/dashboard/inventory/${p._id}`)}>
                                        <td className="px-6 py-4">
                                            <p className="font-extrabold text-gray-800 text-base">{p.name}</p>
                                            <p className="text-xs text-gray-400 font-bold mt-0.5">
                                                {p.sku ? `কোড: ${p.sku} · ` : ''}একক: {p.unit}
                                                {margin && <span className="ml-2 text-emerald-600">+{margin}% মুনাফা</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs text-gray-400 font-bold">ক্রয়: ৳{Number(p.costPrice || 0).toLocaleString()}</p>
                                            <p className="text-base text-[#1e6bd6] font-black">৳{Number(p.sellingPrice || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-xl ${out ? 'text-red-500' : low ? 'text-amber-500' : 'text-gray-800'}`}>{p.stock}</span>
                                            <p className="text-[10px] text-gray-400 font-bold">{p.unit}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {out
                                                ? <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100">স্টক শেষ</span>
                                                : low
                                                    ? <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">কম স্টক</span>
                                                    : <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">মজুদ আছে</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-center gap-1.5">
                                                <button onClick={(e) => handleAdjust(p, e)}
                                                    className="bg-blue-50 text-[#1e6bd6] px-3 py-2 rounded-lg hover:bg-blue-100 text-xs font-black uppercase flex items-center gap-1 transition-all">
                                                    <FiActivity size={12} /> স্টক
                                                </button>
                                                <Link href={`/dashboard/inventory/${p._id}`}
                                                    className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 text-xs font-black uppercase flex items-center gap-1 transition-all">
                                                    <FiEdit2 size={12} />
                                                </Link>
                                                <button onClick={(e) => handleDelete(p, e)}
                                                    className="bg-red-50 text-red-500 px-3 py-2 rounded-lg hover:bg-red-100 text-xs font-black uppercase flex items-center gap-1 transition-all">
                                                    <FiTrash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <FiPackage size={32} className="text-gray-200" />
                                            <p className="text-gray-400 font-bold text-sm">
                                                {products.length === 0 ? 'এখনো কোনো পণ্য যোগ করা হয়নি' : 'কোনো পণ্য পাওয়া যায়নি'}
                                            </p>
                                            {products.length === 0 && (
                                                <Link href="/dashboard/inventory/add"
                                                    className="px-5 py-2 rounded-xl bg-[#1e6bd6] text-white text-xs font-extrabold uppercase tracking-widest hover:opacity-90">
                                                    + প্রথম পণ্য যোগ করুন
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {products.length > 0 && (
                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <FiAlertCircle className="text-[#1e6bd6] shrink-0 mt-0.5" size={15} />
                    <p className="text-xs font-bold text-blue-700 leading-relaxed">
                        <strong>টিপস:</strong> বিক্রয়ের সময় item নাম ও পণ্যের নাম একই রাখলে স্টক স্বয়ংক্রিয়ভাবে কমবে।
                        সারির যেকোনো জায়গায় ক্লিক করলে সম্পাদনা পেজে যাবেন।
                    </p>
                </div>
            )}
        </div>
    );
}
