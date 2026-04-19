"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    FiArrowRight, FiFileText, FiFile, FiMail, FiGrid,
    FiImage, FiActivity, FiCreditCard, FiScissors,
    FiCheck, FiZap, FiShield, FiUsers, FiPackage,
    FiRefreshCw, FiPhone, FiExternalLink, FiStar, FiChevronRight
} from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TOOLS = [
    { icon: FiFileText, label: 'CV / Bio-Data Maker', desc: 'প্রফেশনাল CV তৈরি করুন মিনিটে' },
    { icon: FiFile,     label: 'Cash Memo Maker',     desc: 'ডিজিটাল ক্যাশ মেমো প্রিন্ট করুন' },
    { icon: FiMail,     label: 'Application Letter',  desc: 'দরখাস্ত লিখুন বাংলায়' },
    { icon: FiGrid,     label: 'QR Code Maker',       desc: 'যেকোনো লিংকের QR কোড তৈরি করুন' },
    { icon: FiImage,    label: 'Image Hub',           desc: 'ক্লাউডে ইমেজ সেভ ও শেয়ার করুন' },
    { icon: FiActivity, label: 'Digital Khata',       desc: 'ডিজিটাল হিসাব-নিকাশ রাখুন' },
    { icon: FiCreditCard, label: 'NID Printer',       desc: 'NID কার্ড প্রিন্ট ফরম্যাটে করুন' },
    { icon: FiScissors, label: 'Image Editor (BG)',   desc: 'ব্যাকগ্রাউন্ড রিমুভ করুন সহজে' },
];

export default function HomePage() {
    const [plans, setPlans] = useState([]);
    const [links, setLinks] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [activeTab, setActiveTab] = useState('monthly'); // monthly | 6months | yearly

    useEffect(() => {
        // Fetch Packages
        fetch(`${API}/packages`)
            .then(r => r.json())
            .then(d => setPlans(d.data || []))
            .catch(() => setPlans([]))
            .finally(() => setLoadingPlans(false));

        // Fetch Public Links
        fetch(`${API}/links/public-links`)
            .then(r => r.json())
            .then(d => setLinks(d.data || []))
            .catch(() => setLinks([]))
            .finally(() => setLoadingLinks(false));
    }, []);

    const filteredPlans = useMemo(() => {
        const months = activeTab === 'monthly' ? 1 : activeTab === '6months' ? 6 : 12;
        return plans.filter(p => p.durationInMonths === months && p.status === 'active');
    }, [plans, activeTab]);

    return (
        <div className="min-h-screen bg-white font-nunito selection:bg-blue-100 selection:text-blue-900">

            {/* ── NAVBAR ─────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 shadow-sm">
                <div className="container mx-auto flex justify-between items-center px-6">
                    <div className="flex items-center gap-3">
                        <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
                        <span className="text-lg font-black text-gray-900 tracking-tighter uppercase">ShopOS<span className="text-blue-600">BD</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-10">
                        <a href="#tools" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-all flex items-center gap-1">টুলস</a>
                        <a href="#pricing" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-all">মূল্যতালিকা</a>
                        <a href="#links" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-all">গুরুত্বপূর্ণ লিংক</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-blue-600 px-4 py-2 transition-all">লগইন</Link>
                        <Link href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                            শুরু করুন
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ───────────────────────── */}
            <header className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-lg blur-[120px] -z-10" />
                
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-4 py-2 rounded-lg mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-lg h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Digital Shop OS for Bangladesh</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
                        আপনার দোকানের প্রতিটি কাজ<br />
                        এখন হবে <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">আরও স্মার্ট</span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                        একটি প্ল্যাটফর্মেই পাবেন CV মেকার, ক্যাশ মেমো, QR কোড জেনারেটর এবং আরও অনেক প্রয়োজনীয় টুলস। আজই ডিজিটালাইজ করুন আপনার দোকানকে।
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                        <Link href="/register"
                              className="w-full sm:w-auto bg-blue-600 text-white px-12 py-4 rounded-lg text-base font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2 group">
                            ফ্রি অ্যাকাউন্ট খুলুন <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#pricing"
                           className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-12 py-4 rounded-lg text-base font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-center">
                            প্ল্যানগুলো দেখুন
                        </a>
                    </div>

                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-gray-100 pt-12">
                        {[
                            { v: '১০+', l: 'পাওয়ারফুল টুলস', sub: 'বিজনেসের জন্য' },
                            { v: '১০০%', l: 'বাংলা সাপোর্ট', sub: 'সহজ ইন্টারফেস' },
                            { v: '২৪/৭', l: 'কাস্টমার সাপোর্ট', sub: 'যেকোনো সময়' },
                            { v: '৳০', l: 'ফ্রি স্টার্টার', sub: 'আজীবন ফ্রি' },
                        ].map((s, i) => (
                            <div key={i} className="text-center group">
                                <p className="text-3xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{s.v}</p>
                                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{s.l}</p>
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── TOOLS GRID ─────────────────────────── */}
            <section id="tools" className="py-24 bg-gray-50/30">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="max-w-xl">
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">Powerful Ecosystem</span>
                            <h2 className="text-4xl font-black text-gray-900 leading-tight">আপনার প্রয়োজনীয় সব <br /> টুলস এক জায়গায়</h2>
                        </div>
                        <p className="text-gray-500 font-medium max-w-sm md:text-right">
                            প্রতিদিনের প্রিন্ট ও কম্পিউটার শপের সব কাজ এখন ডিজিটাল। কাজ হবে দ্রুত, প্রফেশনাল এবং নির্ভুল।
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TOOLS.map((tool, i) => {
                            const Icon = tool.icon;
                            return (
                                <div key={i} className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 hover:-translate-y-2 transition-all group">
                                    <div className="w-14 h-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                        <Icon size={26} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.label}</h3>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">{tool.desc}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                        ব্যবহার করুন <FiChevronRight />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FREE LINKS SECTION (MOVED UP) ──────── */}
            <section id="links" className="py-24 bg-blue-600 text-white relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-0" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-lg mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Useful Resources</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white tracking-tight">
                            আপনার প্রয়োজনীয় সব<br />
                            <span className="text-blue-200">গুরুত্বপূর্ণ লিংক</span> এক জায়গায়
                        </h2>
                        <p className="text-blue-100/70 text-base font-medium leading-relaxed max-w-xl mx-auto">
                            প্রতিদিনের কাজে আপনার যে সব সরকারি ও বেসরকারি ওয়েবসাইট প্রয়োজন হয়, তার একটি প্রিমিয়াম ডিরেক্টরি।
                        </p>
                    </div>

                    {loadingLinks ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <FiRefreshCw className="animate-spin text-blue-200" size={40} />
                            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest">লিংকগুলো লোড হচ্ছে...</p>
                        </div>
                    ) : links.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.03] rounded-lg border border-white/10 border-dashed">
                            <FiLink className="mx-auto text-blue-300/30 mb-4" size={48} />
                            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest opacity-60">নতুন লিংক শীঘ্রই যুক্ত হবে</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {links.map((link) => (
                                <a key={link._id} 
                                   href={link.url} target="_blank" rel="noopener noreferrer"
                                   className="group relative bg-white/[0.04] border border-white/10 p-8 rounded-lg transition-all duration-500 flex flex-col h-full hover:bg-white/[0.08] hover:border-white/30 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]">
                                    
                                    {/* Hover Accent Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                    
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 group-hover:bg-blue-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                                <FiExternalLink size={22} />
                                            </div>
                                            <div className="bg-white/10 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-blue-200 border border-white/5">
                                                Public
                                            </div>
                                        </div>

                                        <h4 className="text-base font-black mb-3 text-white group-hover:text-blue-200 transition-colors leading-tight">{link.title}</h4>
                                        <p className="text-sm text-blue-100/60 font-medium leading-relaxed mb-8 flex-1 line-clamp-2">
                                            {link.description || 'Visit official website for important updates and services.'}
                                        </p>

                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-200 group-hover:gap-4 transition-all">
                                            <span>ভিজিট করুন</span>
                                            <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── PRICING SECTION ────────────────────── */}
            <section id="pricing" className="py-24 overflow-hidden relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-50 rounded-lg blur-[100px] -z-10" />
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">Subscription Plans</span>
                        <h2 className="text-4xl font-black text-gray-900 mb-10">আপনার দোকানের জন্য সেরা প্ল্যান</h2>
                        
                        {/* Tab Switcher */}
                        <div className="inline-flex bg-gray-100 p-1.5 rounded-lg mb-4">
                            {[
                                { id: 'monthly', label: '১ মাস' },
                                { id: '6months', label: '৬ মাস' },
                                { id: 'yearly', label: '১ বছর' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-white text-blue-600 shadow-lg shadow-gray-200/50' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'yearly' && (
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">🔥 ২০% সাশ্রয় করুন বার্ষিক প্ল্যানে!</p>
                        )}
                    </div>

                    {loadingPlans ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100">
                            <FiRefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">প্ল্যানগুলো চেক করা হচ্ছে...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <FiPackage className="mx-auto text-gray-300 mb-6" size={56} />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">এই ক্যাটাগরিতে কোনো প্ল্যান নেই</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">আমরা শীঘ্রই নতুন প্ল্যান যোগ করবো। অনুগ্রহ করে অন্য ট্যাবগুলো চেক করুন।</p>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto`}>
                            {filteredPlans.map((plan, i) => {
                                const isProfessional = plan.name?.toLowerCase().includes('professional');
                                return (
                                    <div key={plan._id}
                                         className={`group bg-white rounded-lg border p-10 flex flex-col transition-all duration-500 ${
                                             isProfessional
                                                 ? 'border-blue-600 shadow-[0_30px_60px_-15px_rgba(30,107,214,0.15)] ring-4 ring-blue-50 relative'
                                                 : 'border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50'
                                         }`}>
                                        {isProfessional && (
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-lg shadow-lg shadow-blue-200">
                                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <FiStar size={12} /> Recommended
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="mb-10">
                                            <h3 className="text-2xl font-black text-gray-900 mb-3">{plan.name}</h3>
                                            <p className="text-sm font-medium text-gray-500 leading-relaxed">{plan.description}</p>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-10">
                                            <span className="text-5xl font-black text-gray-900 tracking-tighter">৳{plan.price}</span>
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                / {activeTab === 'monthly' ? 'Month' : activeTab === '6months' ? '6 Mo' : 'Year'}
                                            </span>
                                        </div>

                                        <div className="space-y-4 mb-12 flex-1">
                                            {(plan.features || []).map((f, fi) => (
                                                <div key={fi} className="flex items-start gap-3">
                                                    <div className="mt-1 w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <FiCheck size={12} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-600 leading-snug">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Link
                                            href={`/register?plan=${plan._id}`}
                                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all ${
                                                isProfessional
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
                                                    : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                            }`}
                                        >
                                            এখনই সাবস্ক্রাইব করুন <FiArrowRight size={16} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ── TRUST STRIP ────────────────────────── */}
            <section className="py-20 bg-white border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: FiShield, title: 'নিরাপদ পেমেন্ট গেটওয়ে', desc: 'বিকাশ, নগদ ও রকেটের মাধ্যমে পেমেন্ট করুন নিশ্চিন্তে।', color: 'text-blue-600' },
                            { icon: FiUsers,  title: 'বিশাল কমিউনিটি', desc: 'বাংলাদেশের হাজারো দোকানদার ইতিমধ্যে আমাদের ব্যবহার করছে।', color: 'text-emerald-600' },
                            { icon: FiPhone,  title: 'দ্রুত কাস্টমার সাপোর্ট', desc: 'যেকোনো সমস্যায় আমাদের সাপোর্ট টীম সর্বদা আপনার পাশে।', color: 'text-amber-600' },
                        ].map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="flex flex-col items-center text-center group">
                                    <div className={`w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 ${f.color}`}>
                                        <Icon size={28} />
                                    </div>
                                    <h4 className="text-lg font-black mb-3 text-gray-900">{f.title}</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────── */}
            <footer className="pt-20 pb-10 border-t border-gray-100 bg-gray-50/20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
                                <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">ShopOS<span className="text-blue-600">BD</span></span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium max-w-xs leading-relaxed">
                                ডিজিটাল বাংলাদেশ গড়ার লক্ষ্যে আমরা প্রান্তিক দোকানদারদের টুলস দিয়ে সাহায্য করছি।
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-16 gap-y-8">
                            <div className="flex flex-col gap-4">
                                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Platform</p>
                                <a href="#tools" className="text-sm font-bold text-gray-500 hover:text-blue-600">সব টুলস</a>
                                <a href="#pricing" className="text-sm font-bold text-gray-500 hover:text-blue-600">মূল্যতালিকা</a>
                                <a href="#links" className="text-sm font-bold text-gray-500 hover:text-blue-600">গুরুত্বপূর্ণ লিংক</a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Company</p>
                                <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600">লগইন</Link>
                                <Link href="/register" className="text-sm font-bold text-gray-500 hover:text-blue-600">রেজিস্ট্রেশন</Link>
                                <a href="#" className="text-sm font-bold text-gray-500 hover:text-blue-600">সাপোর্ট</a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">© 2026 ShopOS BD. Made for Bangladesh 🇧🇩</p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600">Privacy Policy</a>
                            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
