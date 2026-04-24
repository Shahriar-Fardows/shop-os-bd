"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiSearch } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

function AddAccountingContent() {
    const api = useAxios();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    
    const [form, setForm] = useState({
        customerName: searchParams.get('name') || '',
        customerMobile: searchParams.get('mobile') || '',
        paidAmount: 0,
        items: [{ name: '', qty: 1, price: 0, unitPrice: 0 }]
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts((res.data?.data || []).filter(p => (p.stock || 0) > 0));
            } catch {}
        };
        fetchProducts();
    }, [api]);

    const handleAddItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { name: '', qty: 1, price: 0, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (form.items.length === 1) return;
        setForm(f => ({
            ...f,
            items: f.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        
        if (field === 'qty' || field === 'unitPrice') {
            const qty = Number(newItems[index].qty) || 0;
            const unitPrice = Number(newItems[index].unitPrice) || 0;
            newItems[index].price = Math.round(qty * unitPrice);
        }
        
        setForm(f => ({ ...f, items: newItems }));
    };

    const handleProductSelect = (index, productId) => {
        if (!productId) return;
        const p = products.find(prod => prod._id === productId);
        if (!p) return;

        const newItems = [...form.items];
        newItems[index] = {
            ...newItems[index],
            name: p.name,
            unitPrice: p.sellingPrice,
            qty: 1,
            price: p.sellingPrice
        };
        setForm(f => ({ ...f, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = form.items.filter(item => item.name && item.price > 0);
        if (validItems.length === 0) {
            Swal.fire('ত্রুটি', 'কমপক্ষে একটি পণ্য দিন', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: `বিক্রয় — ${form.customerName || 'গ্রাহক'}`,
                customerName: form.customerName,
                customerMobile: form.customerMobile,
                items: validItems.map(({name, qty, price}) => ({name, qty, price})),
                paidAmount: Number(form.paidAmount || 0),
                type: 'Service'
            };
            await api.post('/accounting/add', payload);
            Swal.fire({ icon: 'success', title: 'সাফল্য', text: 'হিসাব সংরক্ষণ করা হয়েছে', timer: 1500, showConfirmButton: false });
            router.push('/dashboard/accounting');
        } catch (error) {
            Swal.fire('ত্রুটি', error?.response?.data?.message || 'সংরক্ষণ ব্যর্থ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalBill = form.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const dueAmount = Math.max(0, totalBill - (Number(form.paidAmount) || 0));

    return (
        <div className="font-nunito pb-20 container mx-auto px-4 md:px-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <button onClick={() => router.back()} className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                    <FiArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">নতুন বিক্রয় / বাকি</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">খাতায় নতুন হিসাব যোগ করুন</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-base font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#1e6bd6] rounded-full"></span>
                            গ্রাহকের তথ্য
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">গ্রাহকের নাম</label>
                                <input 
                                    type="text"
                                    value={form.customerName}
                                    onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                                    className="w-full px-5 py-4 rounded-xl border border-blue-100 bg-gray-50/30 text-base font-bold focus:border-[#1e6bd6] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                                    placeholder="যেমন: রহিম শেখ"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">মোবাইল নম্বর</label>
                                <input 
                                    type="tel"
                                    value={form.customerMobile}
                                    onChange={(e) => setForm(f => ({ ...f, customerMobile: e.target.value }))}
                                    className="w-full px-5 py-4 rounded-xl border border-blue-100 bg-gray-50/30 text-base font-bold focus:border-[#1e6bd6] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#1e6bd6] rounded-full"></span>
                                পণ্যের তালিকা
                            </h3>
                            <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-xs font-black text-[#1e6bd6] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all border border-blue-100">
                                <FiPlus size={16} /> আরো পণ্য যোগ করুন
                            </button>
                        </div>

                        <div className="space-y-6">
                            {form.items.map((item, index) => (
                                <div key={index} className="p-6 rounded-2xl bg-gray-50/50 border border-gray-200 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">ইনভেন্টরি থেকে বাছাই করুন</label>
                                            <select 
                                                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-sm font-bold text-gray-700 outline-none focus:border-[#1e6bd6] transition-all"
                                                onChange={(e) => handleProductSelect(index, e.target.value)}
                                            >
                                                <option value="">— পণ্য নির্বাচন করুন —</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} (৳{p.sellingPrice})</option>
                                                ))}
                                            </select>
                                        </div>
                                        {form.items.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="mt-8 p-3 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                                <FiTrash2 size={20} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1 space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">পণ্যের নাম</label>
                                            <input 
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-sm font-bold outline-none focus:border-[#1e6bd6] transition-all"
                                                placeholder="পণ্যের নাম লিখুন"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">পরিমাণ (Qty)</label>
                                            <input 
                                                type="number"
                                                value={item.qty}
                                                min="1"
                                                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-sm font-bold outline-none focus:border-[#1e6bd6] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">মোট মূল্য (৳)</label>
                                            <input 
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-base font-black text-[#1e6bd6] outline-none focus:border-[#1e6bd6] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Payment */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sticky top-10">
                        <h3 className="text-base font-black text-gray-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#1e6bd6] rounded-full"></span>
                            হিসাব সারাংশ
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-base">
                                <span className="font-bold text-gray-400">মোট বিল</span>
                                <span className="font-black text-gray-900 text-xl">৳{totalBill.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">নগদ প্রদান (৳)</label>
                                <input 
                                    type="number"
                                    value={form.paidAmount}
                                    onChange={(e) => setForm(f => ({ ...f, paidAmount: e.target.value }))}
                                    className="w-full px-5 py-4 rounded-xl border border-emerald-200 bg-emerald-50/30 text-emerald-700 text-2xl font-black outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 transition-all"
                                    placeholder="০.০০"
                                />
                            </div>

                            <div className="pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-xs text-red-400 uppercase tracking-widest">বকেয়া / বাকি</span>
                                    <span className="text-3xl font-black text-red-500">৳{dueAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#1e6bd6] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 hover:bg-[#1656ac] hover:shadow-2xl transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50 active:scale-95"
                            >
                                <FiSave size={20} />
                                {loading ? 'সংরক্ষণ হচ্ছে...' : 'হিসাব সংরক্ষণ করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function AddAccountingPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-black animate-pulse">লোড হচ্ছে...</div>}>
            <AddAccountingContent />
        </Suspense>
    );
}
