"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiArrowRight, FiFileText, FiFile, FiMail, FiGrid,
    FiImage, FiActivity, FiCreditCard, FiScissors,
    FiCheck, FiZap, FiShield, FiUsers, FiPackage,
    FiRefreshCw, FiPhone, FiExternalLink, FiStar, FiChevronRight,
    FiLink, FiTarget, FiTrendingUp, FiCpu, FiGlobe, FiMapPin
} from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Pricing is now fetched from the API


const TOOLS = [
    { icon: FiFileText, label: 'CV / Bio-Data Maker', desc: 'প্রফেশনাল CV তৈরি করুন মিনিটে', color: 'blue' },
    { icon: FiFile,     label: 'Cash Memo Maker',     desc: 'ডিজিটাল ক্যাশ মেমো প্রিন্ট করুন', color: 'emerald' },
    { icon: FiMail,     label: 'Application Letter',  desc: 'দরখাস্ত লিখুন বাংলায়', color: 'amber' },
    { icon: FiGrid,     label: 'QR Code Maker',       desc: 'যেকোনো লিংকের QR কোড তৈরি করুন', color: 'purple' },
    { icon: FiImage,    label: 'Image Hub',           desc: 'ক্লাউডে ইমেজ সেভ ও শেয়ার করুন', color: 'pink' },
    { icon: FiActivity, label: 'Digital Khata',       desc: 'ডিজিটাল হিসাব-নিকাশ ও SMS বাকি খাতা', color: 'cyan' },
    { icon: FiCreditCard, label: 'NID Printer',       desc: 'NID কার্ড প্রিন্ট ফরম্যাটে করুন', color: 'indigo' },
    { icon: FiScissors, label: 'Image Editor (BG)',   desc: 'ব্যাকগ্রাউন্ড রিমুভ করুন সহজে', color: 'rose' },
];

export default function HomePage() {
    const [links, setLinks] = useState([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [activeDuration, setActiveDuration] = useState(12); // Default to Yearly

    useEffect(() => {
        fetch(`${API}/links/public-links`)
            .then(r => r.json())
            .then(d => setLinks(d.data || []))
            .catch(() => setLinks([]))
            .finally(() => setLoadingLinks(false));

        fetch(`${API}/packages`)
            .then(r => r.json())
            .then(d => setPackages(d.data || []))
            .catch(() => setPackages([]))
            .finally(() => setLoadingPackages(false));
    }, []);

    return (
        <div className="min-h-screen bg-white font-nunito selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

            {/* ── NAVBAR ─────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4">
                <div className="container mx-auto flex justify-between items-center px-6">
                    <div className="flex items-center gap-3">
                        <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain hover:rotate-12 transition-transform cursor-pointer" />
                        <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">ShopOS<span className="text-blue-600">BD</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-10">
                        <a href="#tools" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">টুলস</a>
                        <a href="#features" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">ফিচার</a>
                        <a href="#pricing" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">মূল্যতালিকা</a>
                        <a href="#links" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">লিংক</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-blue-600 px-4 py-2 transition-all">লগইন</Link>
                        <Link href="/register" className="bg-[#1e6bd6] text-white px-7 py-3 rounded-lg text-sm font-extrabold shadow-none  hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0">
                            শুরু করুন
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ───────────────────────── */}
            <header className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-white">
                <div className="container mx-auto px-6 text-center relative z-10">
                    {/* Top Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 px-4 py-1.5 rounded-md mb-8">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-sm font-black text-blue-600 uppercase tracking-[0.1em]">NEW UPDATE: SHOP BRANDING & LOGO SUPPORT</span>
                    </div>
                    
                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto">
                        আপনার দোকানের প্রতিটি কাজ <br />
                        এখন হবে <span className="text-blue-600">আরও স্মার্ট</span>
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="max-w-3xl mx-auto text-gray-400 text-sm md:text-base font-bold leading-relaxed mb-12 px-4">
                        নিজস্ব লোগো ব্যবহার করে প্রফেশনাল ক্যাশ মেমো, ডিজিটাল বাকি খাতা, <br className="hidden md:block" />
                        অটো SMS রিমাইন্ডার এবং প্রফেশনাল সব টুলস নিয়ে আপনার দোকানকে করুন আরও শক্তিশালী।
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                        <Link href="/register"
                               className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-lg text-sm font-black shadow-none  hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
                            ফ্রি অ্যাকাউন্ট খুলুন <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#pricing"
                           className="w-full sm:w-auto bg-white text-gray-700 border border-gray-100 px-10 py-4 rounded-lg text-sm font-black hover:bg-gray-50 transition-all text-center">
                            প্ল্যানগুলো দেখুন
                        </a>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-16 border-t border-gray-50">
                        <div className="text-center">
                            <p className="text-3xl font-black text-gray-800 mb-1">১২+</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">পাওয়ারফুল টুলস</p>
                            <p className="text-sm font-bold text-gray-400 uppercase mt-1">সব নতুন আপডেট সহ</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-gray-800 mb-1">১ ক্লিক</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">লোগো সাপোর্ট</p>
                            <p className="text-sm font-bold text-gray-400 uppercase mt-1">নিজস্ব ব্র্যান্ডিং</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-gray-800 mb-1">অটো</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">SMS রিমাইন্ডার</p>
                            <p className="text-sm font-bold text-gray-400 uppercase mt-1">বাকি আদায়ের জন্য</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-gray-800 mb-1">৳০</p>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">ফি স্টার্টার</p>
                            <p className="text-sm font-bold text-gray-400 uppercase mt-1">আজীবন ফ্রি</p>
                        </div>
                    </div>
                </div>
            </header>


            {/* ── TRUSTED BY STRIP ───────────────────── */}
            <section className="pb-32">
                <div className="container mx-auto px-6">
                    <div className="bg-gray-50/50 rounded-lg p-12 border border-gray-100 text-center">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-[4px] mb-10">Trusted by 500+ Digital Shops across Bangladesh</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
                            <span className="text-2xl font-black italic">StorePro</span>
                            <span className="text-2xl font-black uppercase tracking-tighter">DigitalPoint</span>
                            <span className="text-2xl font-bold">QuickPrint</span>
                            <span className="text-2xl font-black">MemoHub</span>
                            <span className="text-2xl font-black tracking-widest uppercase">IT-Solution</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES SECTION ───────────────────── */}
            <section id="features" className="py-24 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <span className="text-sm font-black text-blue-600 uppercase tracking-[4px] mb-4 block">Why ShopOS BD?</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">সব সমস্যার এক <br /> ডিজিটাল সমাধান</h2>
                            <div className="space-y-8 mt-12">
                                {[
                                    { icon: FiZap, title: 'সুপার ফাস্ট পারফরম্যান্স', desc: 'মিনিটেই তৈরি করুন প্রফেশনাল ক্যাশ মেমো এবং সিভি।', color: 'bg-amber-50 text-amber-600' },
                                    { icon: FiTrendingUp, title: 'ব্যবসার গ্রোথ ট্র্যাক করুন', desc: 'ডিজিটাল হিসাব খাতার মাধ্যমে প্রতিদিনের আয়-ব্যয় মনিটর করুন।', color: 'bg-emerald-50 text-emerald-600' },
                                    { icon: FiCpu, title: 'অটোমেটেড ওয়ার্কফ্লো', desc: 'বাকি গ্রাহকদের স্বয়ংক্রিয় SMS লিঙ্ক পাঠিয়ে পেমেন্ট গ্রহণ করুন।', color: 'bg-blue-50 text-blue-600' },
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className={`w-16 h-16 shrink-0 rounded-lg ${f.color} flex items-center justify-center shadow-none group-hover:scale-110 transition-transform`}>
                                            <f.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-800 mb-2">{f.title}</h4>
                                            <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute -inset-10 bg-blue-100/50 rounded-full blur-[100px] -z-10 animate-pulse" />
                            <div className="bg-white p-10 rounded-lg shadow-none border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                        <h5 className="font-black text-gray-800">আজকের ড্যাশবোর্ড</h5>
                                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Live</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Sales</p>
                                            <p className="text-2xl font-black text-gray-900">৳৮৫,৪০০</p>
                                        </div>
                                        <div className="bg-emerald-50 p-6 rounded-lg">
                                            <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1">New Orders</p>
                                            <p className="text-2xl font-black text-emerald-600">১২৪টি</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">বাকি রিমাইন্ডার সেন্ড হচ্ছে...</p>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full w-[70%] animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TOOLS GRID ─────────────────────────── */}
            <section id="tools" className="py-32 bg-[#fafbfc]">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="text-sm font-black text-blue-600 uppercase tracking-[4px] mb-4 block">Our Toolbox</span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8">প্রতিদিনের কাজের জন্য <br /> সেরা টুলসগুলো</h2>
                        <p className="text-gray-500 text-lg font-medium">কম্পিউটার এবং প্রিন্ট শপের জন্য বিশেষভাবে ডিজাইন করা আমাদের প্রতিটি টুল আপনার কাজকে সহজ ও দ্রুত করবে।</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {TOOLS.map((tool, i) => {
                            const Icon = tool.icon;
                            const colors = {
                                blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
                                emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
                                amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600',
                                purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600',
                                pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600',
                                cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600',
                                indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600',
                                rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600',
                            };
                            return (
                                <div key={i} className="bg-white rounded-lg p-10 border border-gray-100 shadow-none hover:shadow-none hover:border-blue-100 hover:-translate-y-4 transition-all duration-500 group">
                                    <div className={`w-16 h-16 rounded-lg ${colors[tool.color]} flex items-center justify-center mb-8 group-hover:text-white transition-all duration-500 group-hover:rotate-12`}>
                                        <Icon size={30} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-3">{tool.label}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-8">{tool.desc}</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                        ব্যবহার করুন <FiArrowRight />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FREE LINKS SECTION ─────────────────── */}
            <section id="links" className="py-32 bg-[#1e6bd6] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.05] rounded-full -translate-y-1/2 translate-x-1/2 blur-[150px] -z-0" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6">
                                <FiLink className="text-blue-200" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Public Directory</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black leading-[1.1] text-white tracking-tight">
                                প্রয়োজনীয় সব লিংক <br />এখন <span className="text-blue-300">আপনার হাতের নাগালে</span>
                            </h2>
                        </div>
                        <p className="text-blue-100/70 text-lg font-medium leading-relaxed max-w-sm lg:text-right">
                            প্রতিদিনের কাজে আপনার যে সব সরকারি ও বেসরকারি ওয়েবসাইট প্রয়োজন হয়, তার একটি প্রিমিয়াম লিস্ট।
                        </p>
                    </div>

                    {loadingLinks ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-black text-blue-200 uppercase tracking-[4px]">লিংকগুলো লোড হচ্ছে...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {links.map((link) => (
                                <a key={link._id} 
                                   href={link.url} target="_blank" rel="noopener noreferrer"
                                   className="group bg-white/[0.05] border border-white/10 p-10 rounded-lg transition-all duration-500 flex flex-col h-full hover:bg-white/[0.1] hover:border-white/30 hover:scale-[1.03]">
                                    
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 group-hover:bg-blue-400 group-hover:text-white transition-all duration-500">
                                            <FiExternalLink size={24} />
                                        </div>
                                        <FiStar className="text-white/20 group-hover:text-amber-400 transition-colors" />
                                    </div>

                                    <h4 className="text-xl font-black mb-4 text-white leading-tight">{link.title}</h4>
                                    <p className="text-blue-100/60 font-medium leading-relaxed mb-10 flex-1 line-clamp-2">
                                        {link.description || 'Visit official website for important updates and services.'}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                                        <span>ভিজিট করুন</span>
                                        <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section id="pricing" className="py-32 bg-white relative">
                <div className="container mx-auto px-6">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-black text-[#1e6bd6] uppercase tracking-[4px] mb-4 block">Pricing Plans</span>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight">আপনার ব্যবসাকে বড় করুন</h2>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-12">কম্পিউটার শপের জন্য বিশেষভাবে ডিজাইন করা আমাদের সাবস্ক্রিপশন প্ল্যানগুলো দেখুন এবং আপনার পছন্দমতো বেছে নিন।</p>

                        {/* Duration Selector */}
                        {!loadingPackages && packages.length > 0 && (
                            <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-2xl gap-1 mb-8 shadow-inner">
                                {[
                                    { label: 'Monthly', value: 1 },
                                    { label: '6 Months', value: 6 },
                                    { label: 'Yearly', value: 12 },
                                ].map((d) => {
                                    const hasPlans = packages.some(p => p.durationInMonths === d.value);
                                    if (!hasPlans) return null;
                                    return (
                                        <button
                                            key={d.value}
                                            onClick={() => setActiveDuration(d.value)}
                                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                activeDuration === d.value
                                                    ? 'bg-white text-[#1e6bd6] shadow-sm scale-105'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Plan Cards */}
                    {loadingPackages ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-black text-blue-600 uppercase tracking-[4px]">প্যাকেজগুলো লোড হচ্ছে...</p>
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-2xl mx-auto">
                            <FiPackage size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-bold text-gray-500">কোনো প্যাকেজ পাওয়া যায়নি।</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {packages
                                .filter(p => p.durationInMonths === activeDuration)
                                .map((plan, i) => {
                                const colors = [
                                    { dot: '#22c55e', text: 'text-green-500', bg: 'bg-green-500', light: 'bg-green-50' },
                                    { dot: '#3b82f6', text: 'text-blue-500', bg: 'bg-blue-500', light: 'bg-blue-50' },
                                    { dot: '#a855f7', text: 'text-purple-500', bg: 'bg-purple-500', light: 'bg-purple-50' },
                                    { dot: '#ef4444', text: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50' },
                                ];
                                const color = colors[i % colors.length];
                                const isPopular = i === 1; // Mark second one as popular by default
                                
                                return (
                                    <div
                                        key={plan._id}
                                        className={`relative flex flex-col rounded-2xl border transition-all duration-500 overflow-hidden ${
                                            isPopular
                                                ? 'border-[#3b82f6] ring-4 ring-blue-50 scale-[1.03] z-10 bg-white shadow-2xl shadow-blue-100'
                                                : 'border-gray-100 bg-white hover:scale-[1.02] hover:shadow-lg hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="h-1.5 w-full" style={{ backgroundColor: color.dot }} />

                                        <div className="p-8 flex flex-col flex-1">

                                            {isPopular && (
                                                <div className="inline-flex self-start items-center gap-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5">
                                                    <FiStar size={10} /> Most Popular
                                                </div>
                                            )}

                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Starting from</p>
                                            <div className="flex items-end gap-1 mb-1">
                                                <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">৳{plan.price}</span>
                                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                                                    / {plan.durationInMonths === 1 ? 'month' : plan.durationInMonths === 12 ? 'year' : `${plan.durationInMonths} months`}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4 mb-2">
                                                <div className={`w-10 h-10 rounded-lg ${color.light} ${color.text} flex items-center justify-center`}>
                                                    <FiPackage size={20} />
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
                                            </div>
                                            
                                            <p className="text-xs font-bold text-gray-400 mb-6 leading-relaxed">
                                                {plan.description || 'Professional features to boost your business growth.'}
                                            </p>

                                            <div className="border-t border-gray-100 my-5" />

                                            <ul className="space-y-4 mb-10 flex-1">
                                                {(plan.features || []).map((f, fi) => (
                                                    <li key={fi} className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-md ${color.light} ${color.text} flex items-center justify-center shrink-0`}>
                                                            <FiCheck size={11} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-600 leading-snug">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Link
                                                href={`/register?planId=${plan._id}`}
                                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all ${
                                                    isPopular
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white'
                                                }`}
                                            >
                                                Get Started <FiArrowRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-center text-xs font-bold text-gray-400 mt-14 uppercase tracking-widest">
                        No hidden fees · Cancel anytime · Digital support included
                    </p>
                </div>
            </section>
            {/* ── FOOTER ─────────────────────────────── */}
            <footer className="pt-32 pb-16 bg-[#fafbfc] border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex flex-col items-center gap-8 mb-24">
                        <div className="flex items-center gap-4">
                            <img src="/shoposbd.png" alt="Logo" className="w-16 h-16" />
                            <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase">ShopOS<span className="text-blue-600">BD</span></span>
                        </div>
                        <p className="max-w-lg text-gray-400 text-lg font-medium leading-relaxed">
                            বাংলাদেশের প্রতিটি কম্পিউটার শপকে ডিজিটাল করার প্রত্যয় নিয়ে আমাদের যাত্রা। কাজ করুন স্মার্টলি, আয় করুন বেশি।
                        </p>
                        <div className="flex items-center gap-10">
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest">Facebook</a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest">YouTube</a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors font-black text-xs uppercase tracking-widest">WhatsApp</a>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
                                    <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">ShopOS<span className="text-blue-600">BD</span></span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium max-w-xs leading-relaxed">
                                    ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে আমরা প্রান্তিক দোকানদারদের টুলস দিয়ে সাহায্য করছি।
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-x-16 gap-y-8">
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Platform</p>
                                    <a href="#tools" className="text-sm font-bold text-gray-500 hover:text-blue-600">সব টুলস</a>
                                    <a href="#pricing" className="text-sm font-bold text-gray-500 hover:text-blue-600">মূল্যতালিকা</a>
                                    <a href="#links" className="text-sm font-bold text-gray-500 hover:text-blue-600">গুরুত্বপূর্ণ লিংক</a>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Company</p>
                                    <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600">লগইন</Link>
                                    <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-blue-600">রেজিস্ট্রেশন</Link>
                                    <a href="#" className="text-sm font-bold text-gray-500 hover:text-blue-600">সাপোর্ট</a>
                                </div>
                            </div>
                        </div>
                        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">© 2026 ShopOS BD. Made for Bangladesh 🇧🇩</p>
                            <div className="flex items-center gap-8">
                                <a href="#" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-blue-600">Privacy Policy</a>
                                <a href="#" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-blue-600">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
