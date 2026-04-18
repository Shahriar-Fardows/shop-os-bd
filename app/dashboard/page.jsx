"use client";
import Link from 'next/link';
import {
    FiScissors, FiFileText, FiGrid, FiCreditCard, FiImage,
    FiLink, FiDollarSign, FiArrowRight, FiZap, FiShield,
    FiPrinter, FiCrop, FiDroplet, FiBox, FiActivity, FiFile, FiMail
} from 'react-icons/fi';

const tools = [
    {
        href: '/dashboard/image-edit',
        icon: FiScissors,
        label: 'Image Editor',
        desc: 'BG Remove, Crop, Eraser, PP Photo Sheet, Border',
        badge: 'AI Powered',
        color: 'blue',
    },
    {
        href: '/dashboard/cv-maker',
        icon: FiFileText,
        label: 'CV / Bio-Data Maker',
        desc: 'BD-style CV with A4 preview and direct print',
        badge: 'Print Ready',
        color: 'blue',
    },
    {
        href: '/dashboard/application-letter',
        icon: FiMail,
        label: 'Application Letter',
        desc: 'Leave, Job, TC, Scholarship — দরখাস্ত instantly',
        badge: 'দরখাস্ত',
        color: 'blue',
    },
    {
        href: '/dashboard/cash-memo',
        icon: FiFile,
        label: 'Cash Memo Maker',
        desc: 'Print-ready shop receipts with items, discount & due',
        badge: 'New Tool',
        color: 'blue',
    },
    {
        href: '/dashboard/qr-code',
        icon: FiGrid,
        label: 'QR Code Maker',
        desc: 'Text, WiFi, vCard — custom colors & download',
        badge: 'Free Tool',
        color: 'blue',
    },
    {
        href: '/dashboard/nid-printer',
        icon: FiCreditCard,
        label: 'NID Printer',
        desc: 'Print NID cards in correct size and layout',
        badge: 'Print',
        color: 'blue',
    },
    {
        href: '/dashboard/accounting',
        icon: FiDollarSign,
        label: 'Digital Khata',
        desc: 'Track shop income, expense and daily hishab',
        badge: 'Finance',
        color: 'blue',
    },
    {
        href: '/dashboard/image-hub',
        icon: FiImage,
        label: 'Image Hub (R2)',
        desc: 'Store and manage shop images on cloud',
        badge: 'Cloud',
        color: 'blue',
    },
    {
        href: '/dashboard/links',
        icon: FiLink,
        label: 'Links Hub',
        desc: 'Quick access to bKash, Nagad, couriers & more',
        badge: 'Quick Links',
        color: 'blue',
    },
];

const highlights = [
    {
        icon: FiZap,
        title: 'AI Background Removal',
        desc: 'Remove photo backgrounds instantly — runs fully in your browser, no upload needed.',
        link: '/dashboard/image-edit',
    },
    {
        icon: FiPrinter,
        title: 'PP Photo Sheet',
        desc: 'Create passport-size photo sheets (4R / A4) with custom count and cut marks.',
        link: '/dashboard/image-edit',
    },
    {
        icon: FiFileText,
        title: 'BD-Style CV Maker',
        desc: 'Fill a form, get a print-ready A4 CV instantly — no Word or PDF software needed.',
        link: '/dashboard/cv-maker',
    },
    {
        icon: FiShield,
        title: '100% Private',
        desc: 'All image processing happens in your browser. Your customer data never leaves your device.',
        link: null,
    },
];

export default function DashboardPage() {
    const today = new Date().toLocaleDateString('en-BD', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="space-y-10 p-8 pb-20 font-nunito">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{today}</p>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Welcome to <span className="text-[#1e6bd6]">ShopOS BD</span>
                    </h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                        Your complete computer shop console
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50"></span>
                    <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">System Online</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tools', value: '9', sub: 'Available now', accent: 'blue' },
                    { label: 'Print Shop', value: '5', sub: 'Direct print tools', accent: 'blue' },
                    { label: 'AI Tools', value: '2', sub: 'Browser-based AI', accent: 'blue' },
                    { label: 'Free Tools', value: '100%', sub: 'No extra charges', accent: 'blue' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{s.label}</p>
                        <h3 className="text-2xl font-extrabold text-[#1e6bd6] mt-1.5 leading-none">{s.value}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Tools Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">All Tools</span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{tools.length} tools available</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tools.map((t) => {
                        const Icon = t.icon;
                        return (
                            <Link
                                key={t.href}
                                href={t.href}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all group flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 text-[#1e6bd6] border border-blue-100">
                                        {t.badge}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-extrabold text-gray-800 tracking-tight leading-tight">{t.label}</h4>
                                    <p className="text-[11px] font-bold text-gray-400 mt-1 leading-relaxed">{t.desc}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest group-hover:gap-3 transition-all">
                                    Open Tool <FiArrowRight size={12} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Feature Highlights */}
            <div>
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Feature Highlights</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlights.map((h, i) => {
                        const Icon = h.icon;
                        const inner = (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-gray-800 tracking-tight">{h.title}</h4>
                                    <p className="text-[11px] font-bold text-gray-400 mt-1 leading-relaxed">{h.desc}</p>
                                </div>
                            </div>
                        );
                        return h.link ? (
                            <Link key={i} href={h.link}>{inner}</Link>
                        ) : (
                            <div key={i}>{inner}</div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Access Banner */}
            <div className="bg-[#1e6bd6] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl shadow-blue-100">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                    <FiActivity size={22} />
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-extrabold text-white tracking-tight">Computer Dokan Console</h4>
                    <p className="text-xs text-white/70 font-bold mt-1 uppercase tracking-widest">
                        Designed for Bangladeshi print & internet shops — scan, print, edit, track
                    </p>
                </div>
                <Link
                    href="/dashboard/image-edit"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-[#1e6bd6] font-extrabold text-xs uppercase tracking-widest shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                    Start Editing <FiArrowRight size={14} />
                </Link>
            </div>

        </div>
    );
}
