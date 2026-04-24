"use client";
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle,
    FiBox, FiPackage, FiCalendar, FiRefreshCw, FiEdit3,
    FiArrowRight, FiBarChart2, FiActivity
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

const BANK_KEY = 'shoposbd-bank-balance-v1';

function useBanglaGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'শুভ সকাল';
    if (h < 17) return 'শুভ অপরাহ্ন';
    if (h < 20) return 'শুভ সন্ধ্যা';
    return 'শুভ রাত্রি';
}

function banglaNumber(n) {
    return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

function formatBDT(n) {
    return '৳' + Number(n || 0).toLocaleString('en-BD');
}

const FILTERS = [
    { key: 'all',   label: 'সব' },
    { key: 'today', label: 'আজ' },
    { key: 'week',  label: 'এই সপ্তাহ' },
    { key: 'month', label: 'এই মাস' },
];

function filterByDate(txns, key) {
    if (key === 'all') return txns;
    const now = new Date();
    return txns.filter(t => {
        const d = new Date(t.date);
        if (key === 'today') return d.toDateString() === now.toDateString();
        if (key === 'week') {
            const start = new Date(now); start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            return d >= start;
        }
        if (key === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
    });
}

export default function DashboardPage() {
    const api = useAxios();
    const greeting = useBanglaGreeting();
    const [userName, setUserName] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('month');
    const [bankBalance, setBankBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const bankInputRef = useRef(null);

    const today = new Date().toLocaleDateString('bn-BD', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    useEffect(() => {
        const saved = localStorage.getItem(BANK_KEY);
        if (saved) setBankBalance(Number(saved) || 0);
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [meRes, txnRes, prodRes] = await Promise.all([
                api.get('/client-auth/me').catch(() => null),
                api.get('/accounting').catch(() => ({ data: { data: [] } })),
                api.get('/products').catch(() => ({ data: { data: [] } })),
            ]);
            setUserName(meRes?.data?.data?.name || '');
            setTransactions(txnRes.data?.data || []);
            setProducts(prodRes.data?.data || []);
        } catch {}
        setLoading(false);
    }, [api]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleEditBank = async () => {
        const { value } = await Swal.fire({
            title: '<span class="font-nunito font-black text-lg text-[#1e6bd6]">ব্যাংক ব্যালান্স আপডেট করুন</span>',
            input: 'number',
            inputValue: bankBalance,
            inputLabel: 'বর্তমান ব্যাংক ব্যালান্স (৳)',
            confirmButtonText: 'সংরক্ষণ',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            cancelButtonText: 'বাতিল',
        });
        if (value !== undefined) {
            const n = Number(value) || 0;
            setBankBalance(n);
            localStorage.setItem(BANK_KEY, String(n));
        }
    };

    // Derived stats
    const filtered = filterByDate(transactions, filter);
    const income  = filtered.filter(t => t.type !== 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = filtered.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const totalDue = transactions.reduce((s, t) => s + (t.dueAmount || 0), 0); // always all-time
    const cashInHand = income - expense;

    // Best/worst selling products from all transactions
    const salesMap = {};
    transactions.forEach(t => {
        (t.items || []).forEach(item => {
            const n = (item.name || '').trim();
            if (!n) return;
            salesMap[n] = (salesMap[n] || 0) + 1;
        });
    });
    const salesArr = Object.entries(salesMap).sort((a, b) => b[1] - a[1]);
    const bestSelling  = salesArr.slice(0, 3);
    const worstSelling = salesArr.length > 1 ? salesArr.slice(-3).reverse() : [];

    // Stock stats
    const totalStock      = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
    const totalStockValue = products.reduce((s, p) => s + (Number(p.stock) || 0) * (Number(p.costPrice) || 0), 0);
    const lowStockCount   = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockAlert || 0)).length;
    const outStockCount   = products.filter(p => (p.stock || 0) <= 0).length;

    return (
        <div className="space-y-7 p-6 pb-20 font-nunito">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{today}</p>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {greeting}{userName ? `, ${userName}` : ''} 👋
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">আপনার শপ ওভারভিউ</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-lg p-1">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${filter === f.key ? 'bg-[#1e6bd6] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button onClick={fetchAll} className="ml-1 text-gray-300 hover:text-[#1e6bd6] transition-colors px-2" title="রিফ্রেশ">
                        <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Finance Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'নগদ প্রাপ্তি',  value: formatBDT(income),      color: 'text-emerald-600',  border: 'border-l-emerald-500', icon: FiTrendingUp },
                    { label: 'নগদ প্রদান',    value: formatBDT(expense),     color: 'text-red-500',      border: 'border-l-red-400',    icon: FiTrendingDown },
                    { label: 'মোট পাওনা',     value: formatBDT(totalDue),    color: 'text-amber-600',    border: 'border-l-amber-400',  icon: FiAlertCircle },
                    { label: 'মোট দেনা',      value: '৳০',                   color: 'text-gray-400',     border: 'border-l-gray-300',   icon: FiActivity },
                    { label: 'হাতে আছে',      value: formatBDT(cashInHand),  color: 'text-[#1e6bd6]',    border: 'border-l-[#1e6bd6]',  icon: FiDollarSign },
                    { label: 'ব্যাংকে আছে',   value: formatBDT(bankBalance), color: 'text-purple-600',   border: 'border-l-purple-400', icon: FiBarChart2, editable: true },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.border} relative`}>
                            <div className="flex items-center justify-between mb-2">
                                <Icon size={14} className={s.color} />
                                {s.editable && (
                                    <button onClick={handleEditBank} className="text-gray-300 hover:text-[#1e6bd6] transition-colors" title="সম্পাদনা">
                                        <FiEdit3 size={12} />
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{s.label}</p>
                            <h3 className={`text-base font-black mt-1 ${s.color} leading-tight`}>{s.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Best/Worst + Transaction count */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center">
                            <FiCalendar size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-gray-700">মোট লেনদেন</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filter === 'all' ? 'সর্বকালীন' : FILTERS.find(f => f.key === filter)?.label}</p>
                        </div>
                    </div>
                    <p className="text-4xl font-black text-[#1e6bd6]">{banglaNumber(filtered.length)}</p>
                    <div className="mt-3 flex gap-3 text-xs font-bold text-gray-400">
                        <span className="text-emerald-600">{banglaNumber(filtered.filter(t => t.type !== 'Expense').length)} আয়</span>
                        <span>·</span>
                        <span className="text-red-500">{banglaNumber(filtered.filter(t => t.type === 'Expense').length)} খরচ</span>
                    </div>
                    <Link href="/dashboard/accounting" className="mt-4 flex items-center gap-1 text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest hover:gap-2 transition-all">
                        খাতা দেখুন <FiArrowRight size={11} />
                    </Link>
                </div>

                {/* Best selling */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                            <FiTrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-gray-700">সর্বাধিক বিক্রিত</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">সব সময়ের শীর্ষ পণ্য</p>
                        </div>
                    </div>
                    {bestSelling.length > 0 ? (
                        <div className="space-y-2">
                            {bestSelling.map(([name, count], i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                        <span className="text-sm font-bold text-gray-700 truncate">{name}</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-emerald-600 shrink-0 ml-2">{banglaNumber(count)}x</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-300 font-bold italic">বিক্রয় ডেটা নেই</p>
                    )}
                </div>

                {/* Worst selling */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                            <FiTrendingDown size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold text-gray-700">সর্বনিম্ন বিক্রিত</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">কম বিক্রির পণ্য</p>
                        </div>
                    </div>
                    {worstSelling.length > 0 ? (
                        <div className="space-y-2">
                            {worstSelling.map(([name, count], i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</span>
                                        <span className="text-sm font-bold text-gray-700 truncate">{name}</span>
                                    </div>
                                    <span className="text-xs font-extrabold text-red-400 shrink-0 ml-2">{banglaNumber(count)}x</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-300 font-bold italic">বিক্রয় ডেটা নেই</p>
                    )}
                </div>
            </div>

            {/* Expense quick + Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expense summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                                <FiTrendingDown size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-gray-700">মোট খরচ</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{FILTERS.find(f => f.key === filter)?.label}</p>
                            </div>
                        </div>
                        <Link href="/dashboard/accounting" className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest hover:underline flex items-center gap-1">
                            সব দেখুন <FiArrowRight size={10} />
                        </Link>
                    </div>
                    <p className="text-3xl font-black text-red-500">{formatBDT(expense)}</p>
                    <div className="mt-3 bg-red-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-red-600">
                            {filtered.filter(t => t.type === 'Expense').length > 0
                                ? `${banglaNumber(filtered.filter(t => t.type === 'Expense').length)} টি খরচের এন্ট্রি`
                                : 'এই সময়কালে কোনো খরচ নেই'}
                        </p>
                    </div>
                </div>

                {/* Stock summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center">
                                <FiBox size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-gray-700">স্টক</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">পণ্য মজুদ সারাংশ</p>
                            </div>
                        </div>
                        <Link href="/dashboard/inventory" className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest hover:underline flex items-center gap-1">
                            সব দেখুন <FiArrowRight size={10} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">মোট স্টক</p>
                            <p className="text-sm font-black text-gray-700 mt-0.5">মোট মজুদ পণ্য সংখ্যা</p>
                            <p className="text-2xl font-black text-[#1e6bd6] mt-1">{banglaNumber(totalStock.toLocaleString())}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">স্টক মূল্য</p>
                            <p className="text-sm font-black text-gray-700 mt-0.5">সর্বমোট মজুদ পণ্য মূল্য</p>
                            <p className="text-xl font-black text-purple-600 mt-1">{formatBDT(totalStockValue)}</p>
                        </div>
                    </div>
                    {(lowStockCount + outStockCount) > 0 && (
                        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                            <FiAlertCircle size={13} className="text-amber-600 shrink-0" />
                            <p className="text-xs font-bold text-amber-700">
                                {outStockCount > 0 && <span>{banglaNumber(outStockCount)} টি পণ্য শেষ</span>}
                                {outStockCount > 0 && lowStockCount > 0 && ' · '}
                                {lowStockCount > 0 && <span>{banglaNumber(lowStockCount)} টি কম স্টকে</span>}
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
