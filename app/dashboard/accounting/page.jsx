"use client";
import { useState, useEffect } from 'react';
import {
    FiPlus, FiTrash2, FiMinusCircle, FiList,
    FiLayers, FiActivity, FiShield, FiMessageSquare
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function DigitalKhataPage() {
    const api = useAxios();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/accounting');
            setTransactions(res.data.data);
        } catch {}
        setLoading(false);
    };



    /* ── SMART PAY ── */
    const handleSmartPay = async (customerName, txns) => {
        const totalDue = txns.reduce((s, t) => s + (t.dueAmount || 0), 0);
        const { value: amount } = await Swal.fire({
            title: `<span class="font-nunito font-black text-xl text-[#1e6bd6]">পেমেন্ট: ${customerName}</span>`,
            input: 'number',
            inputLabel: `মোট বাকি: ৳${totalDue}`,
            confirmButtonText: 'পেমেন্ট নিন',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            cancelButtonText: 'বাতিল',
            allowOutsideClick: false,
            showCloseButton: true,
        });
        if (!amount) return;
        let remaining = Number(amount);
        const sorted = [...txns].sort((a, b) => new Date(a.date) - new Date(b.date));
        try {
            Swal.fire({ title: 'পেমেন্ট প্রক্রিয়া হচ্ছে…', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
            for (const t of sorted) {
                if (remaining <= 0) break;
                const pay = Math.min(remaining, t.dueAmount);
                await api.patch(`/accounting/update-payment/${t._id}`, { addAmount: pay });
                remaining -= pay;
            }
            fetchData();
            Swal.fire('সফল', `৳${amount} ${customerName}-এর হিসাবে যোগ হয়েছে।`, 'success');
        } catch {
            Swal.fire('ত্রুটি', 'পেমেন্ট আংশিক প্রযুক্ত হয়েছে। রেকর্ড যাচাই করুন।', 'error');
        }
    };

    /* ── QUICK ADD ── */
    const handleQuickAdd = async (type) => {
        const label = type === 'Income' ? 'আয়' : 'খরচ';
        const { value: val } = await Swal.fire({
            title: `${label} রেকর্ড করুন`,
            html: `<input id="q-t" class="swal2-input" placeholder="বিবরণ"><input id="q-a" type="number" class="swal2-input" placeholder="পরিমাণ (৳)">`,
            confirmButtonText: 'সংরক্ষণ',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            cancelButtonText: 'বাতিল',
            allowOutsideClick: false,
            showCloseButton: true,
            preConfirm: () => ({ title: document.getElementById('q-t').value, amount: Number(document.getElementById('q-a').value), type }),
        });
        if (val) { await api.post('/accounting/add', val); fetchData(); }
    };

    /* ── VIEW ITEMS ── */
    const handleViewItems = (items = []) => {
        Swal.fire({
            title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">বিক্রয় বিবরণ</span>',
            html: `
                <div class="text-left font-nunito p-2">
                    <table class="w-full text-sm">
                        <thead class="text-sm text-gray-400 uppercase border-b">
                            <tr><th class="py-2 text-left">পণ্য</th><th class="py-2 text-right">মূল্য</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            ${items.map(i => `<tr><td class="py-3 font-bold text-gray-700">${i.name}</td><td class="py-3 text-right font-black text-[#1e6bd6]">৳${i.price}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            confirmButtonText: 'বন্ধ করুন',
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true,
        });
    };

    /* ── DELETE ── */
    const handleDelete = (id) => {
        Swal.fire({
            title: 'লেনদেন মুছবেন?',
            text: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
            allowOutsideClick: false,
            showCloseButton: true,
        }).then(r => { if (r.isConfirmed) api.delete(`/accounting/${id}`).then(fetchData); });
    };

    /* ── SEND SMS TO BAKI CUSTOMER ── */
    const handleSendSms = async (customer) => {
        const phone = customer.mobile?.trim();
        if (!phone) {
            Swal.fire('ত্রুটি', 'এই গ্রাহকের মোবাইল নম্বর নেই', 'error');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const longLink = `https://shoposbd.com/i/${user.shortId || user._id}/${encodeURIComponent(customer.name)}`;
        
        // Generate short link via API
        let shortCode = '';
        try {
            const shortRes = await api.post('/s/shorten', { url: longLink });
            shortCode = shortRes.data.data;
        } catch (e) {
            console.error('Shortening failed', e);
        }

        const link = shortCode ? `shoposbd.com/s/${shortCode}` : `shoposbd.com/i/${user.shortId || user._id}/${encodeURIComponent(customer.name)}`;
        const template = `( ShopOSBd ) আপনার ${customer.dueAmount?.toLocaleString()}৳ বাকি আছে। লিঙ্ক: ${link}`;

        const { isConfirmed } = await Swal.fire({
            title: `<span class="font-nunito font-black text-lg text-[#1e6bd6]">SMS পাঠান: ${customer.name}</span>`,
            html: `
                <div class="text-left font-nunito p-2 space-y-3">
                    <p class="text-sm text-gray-500">প্রাপক: <strong>${phone}</strong></p>
                    <p class="text-sm text-gray-500">বাকি: <strong class="text-[#1e6bd6]">৳${customer.dueAmount?.toLocaleString()}</strong></p>
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p class="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">SMS টেমপ্লেট প্রিভিউ:</p>
                        <p class="text-sm text-gray-800 font-medium">${template}</p>
                    </div>
                </div>
            `,
            confirmButtonText: 'পাঠান',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            cancelButtonText: 'বাতিল',
        });

        if (!isConfirmed) return;

        try {
            await api.post('/sms/send', { recipients: [phone], message: template });
            Swal.fire({ icon: 'success', title: 'SMS পাঠানো হয়েছে!', showConfirmButton: false, timer: 1500 });
        } catch (e) {
            Swal.fire('ত্রুটি', e?.response?.data?.message || 'SMS পাঠাতে ব্যর্থ', 'error');
        }
    };

    /* ── YEARLY CLEANUP ── */
    const handleYearlyCleanup = async () => {
        const result = await Swal.fire({
            title: 'বার্ষিক ডেটা পরিষ্কার',
            text: 'চলতি বছরের আগের পেইড রেকর্ড মুছবেন? (বাকি রেকর্ড সুরক্ষিত থাকবে)',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'হ্যাঁ, পরিষ্কার করুন',
            cancelButtonText: 'বাতিল',
            allowOutsideClick: false,
            showCloseButton: true,
        });
        if (result.isConfirmed) {
            try {
                await api.post('/accounting/yearly-cleanup');
                fetchData();
                Swal.fire('সম্পন্ন', 'পুরনো রেকর্ড মুছে ফেলা হয়েছে।', 'success');
            } catch {
                Swal.fire('ত্রুটি', 'পরিষ্কার করা সম্ভব হয়নি।', 'error');
            }
        }
    };

    /* ── STATS ── */
    const inc  = transactions.filter(t => t.type !== 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const exp  = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const baki = transactions.reduce((s, t) => s + (t.dueAmount || 0), 0);

    const groupedBaki = Object.values(
        transactions.filter(t => t.dueAmount > 0).reduce((acc, t) => {
            const key = t.customerMobile || t.customerName || 'সাধারণ গ্রাহক';
            if (!acc[key]) acc[key] = { name: t.customerName || 'সাধারণ গ্রাহক', mobile: t.customerMobile || 'N/A', totalBill: 0, dueAmount: 0, count: 0, allTransactions: [] };
            acc[key].totalBill += (t.totalBill || 0);
            acc[key].dueAmount += (t.dueAmount || 0);
            acc[key].count += 1;
            acc[key].allTransactions.push(t);
            return acc;
        }, {})
    );

    const monthly = {};
    transactions.forEach(t => {
        const months = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
        const d = new Date(t.date);
        const k = `${months[d.getMonth()]} ${d.getFullYear()}`;
        if (!monthly[k]) monthly[k] = { inc: 0, exp: 0, bak: 0 };
        if (t.type !== 'Expense') monthly[k].inc += (t.amount || 0);
        else monthly[k].exp += (t.amount || 0);
        monthly[k].bak += (t.dueAmount || 0);
    });

    const TABS = [
        { key: 'daily',   label: 'দৈনিক খাতা' },
        { key: 'summary', label: 'মাসিক সারাংশ' },
        { key: 'baki',    label: 'গ্রাহক বাকি' },
        { key: 'settings',label: 'সেটিংস' },
    ];

    return (
        <div className="space-y-8 font-nunito pb-20 container mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">ডিজিটাল খাতা</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">দৈনিক হিসাব · আয়-ব্যয় · বাকি ব্যবস্থাপনা</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleQuickAdd('Income')} className="bg-[#1e6bd6] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 active:scale-95">
                        <FiPlus /> আয়
                    </button>
                    <button onClick={() => handleQuickAdd('Expense')} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-black transition-all flex items-center gap-2 active:scale-95">
                        <FiPlus /> খরচ
                    </button>
                <button 
                    onClick={() => router.push('/dashboard/accounting/add')}
                    className="bg-[#1e6bd6] text-white px-6 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-blue-50 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95"
                >
                    <FiPlus /> নতুন বাকি / বিক্রয়
                </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-lg w-fit gap-1 shadow-sm">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`px-5 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${activeTab === t.key ? 'bg-[#1e6bd6] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-lg" />)}</div>
            ) : (
                <>
                    {/* Daily Ledger */}
                    {activeTab === 'daily' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-[#1e6bd6]">
                                    <p className="text-sm font-bold text-gray-400 uppercase">মোট আয়</p>
                                    <h3 className="text-xl font-black text-[#1e6bd6]">৳{inc.toLocaleString()}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-gray-400">
                                    <p className="text-sm font-bold text-gray-400 uppercase">মোট খরচ</p>
                                    <h3 className="text-xl font-black text-gray-700">৳{exp.toLocaleString()}</h3>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                                    <p className="text-sm font-bold text-gray-400 uppercase">মুনাফা</p>
                                    <h3 className="text-xl font-black text-emerald-600">৳{(inc - exp).toLocaleString()}</h3>
                                </div>
                                <div className="bg-[#1e6bd6] p-5 rounded-lg text-white shadow-xl shadow-blue-50">
                                    <p className="text-sm font-bold text-white/70 uppercase">মোট বাকি</p>
                                    <h3 className="text-2xl font-black">৳{baki.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm text-gray-700">
                                    <thead className="bg-gray-50/50 text-sm uppercase font-bold text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4">লেনদেনের বিবরণ</th>
                                            <th className="px-6 py-4 text-center">ধরন</th>
                                            <th className="px-6 py-4 text-right">পরিমাণ (৳)</th>
                                            <th className="px-6 py-4 text-center">কার্যক্রম</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 font-medium">
                                        {transactions.map(t => (
                                            <tr key={t._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-800 text-base">{t.title}</p>
                                                    {t.items?.length > 0 && (
                                                        <p className="text-sm text-gray-400 font-bold uppercase">{t.items.map(i => `${i.name}(৳${i.price})`).join(', ')}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${t.type === 'Expense' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-[#1e6bd6] border-blue-100'}`}>
                                                        {t.type === 'Income' ? 'আয়' : t.type === 'Expense' ? 'খরচ' : 'সেবা'}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-black text-base ${t.type === 'Expense' ? 'text-gray-700' : 'text-[#1e6bd6]'}`}>
                                                    ৳{t.amount?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 flex justify-center">
                                                    <button onClick={() => handleDelete(t._id)} className="text-gray-300 hover:text-red-500 transition-all text-lg">
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {transactions.length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-16 text-center text-gray-300 font-black italic uppercase tracking-widest text-xs">এখনো কোনো লেনদেন নেই</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Customer Baki */}
                    {activeTab === 'baki' && (
                        <div className="bg-white rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                                <h4 className="font-black text-sm uppercase text-gray-800">গ্রাহকভিত্তিক বাকির তালিকা</h4>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white text-sm font-bold text-gray-400 uppercase border-b border-gray-50">
                                    <tr>
                                        <th className="px-6 py-4">গ্রাহক</th>
                                        <th className="px-6 py-4 text-right">মোট বিল</th>
                                        <th className="px-6 py-4 text-right">বাকি আছে</th>
                                        <th className="px-6 py-4 text-center">কার্যক্রম</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {groupedBaki.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center font-black border border-blue-100 shrink-0">
                                                        {c.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-gray-800 text-base">{c.name}</p>
                                                        <p className="text-xs text-gray-400 font-bold tracking-wider">{c.mobile}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-400 text-base">৳{c.totalBill.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[#1e6bd6] font-black text-lg underline decoration-blue-100 decoration-2">৳{c.dueAmount.toLocaleString()}</span>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{c.count} লেনদেন</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleViewItems(c.allTransactions.flatMap(t => t.items))}
                                                        className="bg-blue-50 text-[#1e6bd6] border border-blue-100 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 text-sm font-black uppercase">
                                                        <FiList size={16} /> ইতিহাস
                                                    </button>
                                                    <button onClick={() => router.push(`/dashboard/accounting/add?name=${c.name}&mobile=${c.mobile}`)}
                                                        className="bg-[#1e6bd6] text-white border border-blue-600 px-4 py-2.5 rounded-lg text-sm font-black uppercase flex items-center gap-1.5 hover:opacity-90 shadow-sm active:scale-95 transition-all">
                                                        <FiPlus size={16} /> বাকি
                                                    </button>
                                                    <button onClick={() => handleSmartPay(c.name, c.allTransactions)}
                                                        className="bg-gray-800 text-white border border-black px-4 py-2.5 rounded-lg text-sm font-black uppercase flex items-center gap-1.5 hover:bg-black shadow-sm active:scale-95 transition-all">
                                                        <FiMinusCircle size={16} /> পেমেন্ট
                                                    </button>
                                                    {c.mobile && (
                                                        <button onClick={() => handleSendSms(c)}
                                                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-black uppercase flex items-center gap-1.5 hover:bg-emerald-100 shadow-sm active:scale-95 transition-all"
                                                            title="SMS পাঠান">
                                                            <FiMessageSquare size={16} /> SMS
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {groupedBaki.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-300 italic font-black uppercase tracking-widest text-xs">এই মুহূর্তে কোনো বাকি নেই</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Monthly Summary */}
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-50">
                                    <tr>
                                        <th className="px-6 py-4">মাস</th>
                                        <th className="px-6 py-4 text-right text-[#1e6bd6]">আয়</th>
                                        <th className="px-6 py-4 text-right">খরচ</th>
                                        <th className="px-6 py-4 text-right">বাকি</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                                    {Object.keys(monthly).map(m => (
                                        <tr key={m} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-[#1e6bd6] font-black text-base">{m}</td>
                                            <td className="px-6 py-4 text-right text-[#1e6bd6] text-base">৳{monthly[m].inc.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-gray-500">৳{monthly[m].exp.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-base">৳{monthly[m].bak.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {Object.keys(monthly).length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-16 text-center text-gray-300 font-black italic uppercase tracking-widest text-xs">কোনো ডেটা নেই</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Settings */}
                    {activeTab === 'settings' && (
                        <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-6">
                            {/* Shop Settings */}
                            <div className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-t-[#1e6bd6]">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-50 text-[#1e6bd6] rounded-lg flex items-center justify-center border border-blue-100">
                                        <FiActivity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-800">দোকান / ব্র্যান্ড সেটিংস</h4>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">মেসেজ টেমপ্লেট ও ব্র্যান্ডিং</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">দোকানের নাম (SMS-এর জন্য)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                id="shop-name-input"
                                                type="text"
                                                defaultValue={JSON.parse(localStorage.getItem('user') || '{}').shopName || ''}
                                                className="flex-1 px-5 py-3 rounded-xl border border-blue-100 bg-gray-50/30 text-base font-bold focus:border-[#1e6bd6] outline-none transition-all"
                                                placeholder="যেমন: রহিম স্টোর"
                                            />
                                            <button 
                                                onClick={async () => {
                                                    const name = document.getElementById('shop-name-input').value;
                                                    try {
                                                        const res = await api.patch('/client/update-me', { shopName: name });
                                                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                                                        user.shopName = name;
                                                        localStorage.setItem('user', JSON.stringify(user));
                                                        Swal.fire({ icon: 'success', title: 'সংরক্ষিত হয়েছে', showConfirmButton: false, timer: 1500 });
                                                    } catch (e) {
                                                        Swal.fire('ত্রুটি', 'সেভ করা সম্ভব হয়নি', 'error');
                                                    }
                                                }}
                                                className="bg-[#1e6bd6] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1656ac] transition-all active:scale-95 shadow-lg shadow-blue-50"
                                            >
                                                সেভ করুন
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold px-1 italic">* এটি আপনার পাঠানো SMS-এর শুরুতে থাকবে। ফাঁকা রাখলে "ShopOSBd" যাবে।</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-t-gray-200">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center border border-gray-100">
                                        <FiShield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-800">বার্ষিক ডেটা পরিষ্কার</h4>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">রক্ষণাবেক্ষণ টুল</p>
                                    </div>
                                </div>
                                <p className="text-base text-gray-500 font-medium mb-8">
                                    পারফরমেন্স ঠিক রাখতে চলতি বছরের আগের পেইড রেকর্ড মুছুন।<br />
                                    <span className="text-[#1e6bd6] font-black underline decoration-blue-100 italic">বাকি রেকর্ড কখনো মুছবে না।</span>
                                </p>
                                <button onClick={handleYearlyCleanup}
                                    className="bg-gray-800 text-white px-8 py-3 rounded-lg font-black text-sm uppercase tracking-widest hover:opacity-95 transition-all shadow-lg shadow-blue-50 active:scale-95">
                                    পরিষ্কার করুন
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
