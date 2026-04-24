"use client";
import {
    FiHome, FiHelpCircle, FiUser, FiLogOut, FiLink, FiDollarSign, FiImage,
    FiCreditCard, FiScissors, FiFileText, FiGrid, FiFile, FiMail, FiGift, FiPackage, FiLock, FiBox, FiMessageSquare
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';
import { getActiveTools } from '@/lib/tools';

// Tool keys must match server/src/app/modules/platform-config/tools.catalog.ts
const TOOL_LINKS = [
    { key: 'digitalKhata',      href: '/dashboard/accounting',          label: 'ডিজিটাল খাতা',         icon: FiDollarSign },
    { key: 'digitalKhata',      href: '/dashboard/inventory',           label: 'পণ্য ইনভেন্টরি',        icon: FiBox },
    { key: 'linksHub',          href: '/dashboard/links',               label: 'লিংক হাব',              icon: FiLink },
    { key: 'imageHub',          href: '/dashboard/image-hub',           label: 'ইমেজ হাব',              icon: FiImage },
    { key: 'nidPrinter',        href: '/dashboard/nid-printer',         label: 'এনআইডি প্রিন্টার',      icon: FiCreditCard },
    { key: 'imageEditor',       href: '/dashboard/image-edit',          label: 'ইমেজ এডিটর',            icon: FiScissors },
    { key: 'cvMaker',           href: '/dashboard/cv-maker',            label: 'সিভি / বায়োডাটা',       icon: FiFileText },
    { key: 'applicationLetter', href: '/dashboard/application-letter',  label: 'আবেদনপত্র',             icon: FiMail },
    { key: 'cashMemo',          href: '/dashboard/cash-memo',           label: 'ক্যাশ মেমো',            icon: FiFile },
    { key: 'qrCode',            href: '/dashboard/qr-code',             label: 'কিউআর কোড',             icon: FiGrid },
];

const Sidebar = ({ handleLogout }) => {
    const pathname = usePathname();
    const router = useRouter();
    const api = useAxios();
    const [hasUnread, setHasUnread] = useState(false);
    const [activeTools, setActiveTools] = useState([]);
    const [supportAllowed, setSupportAllowed] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        let alive = true;
        const loadAccess = async () => {
            try {
                const [meRes, cfgRes] = await Promise.all([
                    api.get('/client-auth/me').catch(() => null),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/platform-config`).then(r => r.json()).catch(() => null),
                ]);
                if (!alive) return;
                const user = meRes?.data?.data || null;
                const config = cfgRes?.data || null;
                const tools = getActiveTools(user, config);
                setActiveTools(tools);
                setSupportAllowed(tools.includes('support'));
            } catch {}
        };
        loadAccess();
        return () => { alive = false; };
    }, [api]);

    useEffect(() => {
        if (!supportAllowed) return;
        const checkNotifications = async () => {
            try {
                const res = await api.get('/support/unread-status');
                if (res.data.data.hasNewReply && !hasUnread) {
                    setHasUnread(true);
                    if (audioRef.current) audioRef.current.play().catch(() => {});
                } else if (!res.data.data.hasNewReply) {
                    setHasUnread(false);
                }
            } catch {}
        };
        const interval = setInterval(checkNotifications, 15000);
        checkNotifications();
        return () => clearInterval(interval);
    }, [api, hasUnread, supportAllowed]);

    const handleLockedClick = (e, label) => {
        e.preventDefault();
        Swal.fire({
            title: 'টুল লক আছে',
            html: `<b>${label}</b> আপনার বর্তমান প্ল্যানে সক্রিয় নেই।<br/>সাবস্ক্রাইব করে এই টুলটি ব্যবহার করুন।`,
            icon: 'info',
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'প্ল্যান আপগ্রেড করুন',
            showCancelButton: true,
            cancelButtonText: 'এখন না',
        }).then(r => {
            if (r.isConfirmed) router.push('/dashboard/subscribe');
        });
    };

    const renderToolLink = ({ key, href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const unlocked = activeTools.includes(key);

        if (!unlocked) {
            return (
                <button
                    key={href}
                    onClick={(e) => handleLockedClick(e, label)}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:bg-gray-50 font-medium transition-all group relative"
                    title="লক — আপগ্রেড করুন"
                >
                    <Icon size={20} className="text-gray-300" />
                    <span className="flex-1 text-left truncate">{label}</span>
                    <FiLock size={12} className="text-gray-300 group-hover:text-[#1e6bd6] transition-colors" />
                </button>
            );
        }

        return (
            <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                    isActive
                    ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                    : 'text-gray-500 hover:bg-gray-50 font-medium'
                }`}
            >
                <Icon size={20} className={isActive ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <aside className="w-64 border-r border-gray-100 flex flex-col h-screen bg-white font-nunito shadow-sm">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" />

            <div className="p-6 flex items-center gap-3">
                <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
                <div className="flex flex-col">
                    <h1 className="text-sm font-extrabold tracking-tight text-gray-800 uppercase leading-none">ShopOS BD</h1>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">শপ কনসোল</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
                <nav className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">মূল মেনু</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiHome size={20} className={pathname === '/dashboard' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>ড্যাশবোর্ড</span>
                    </Link>

                    {TOOL_LINKS.map(renderToolLink)}
                </nav>
            </div>

            <div className="p-3 border-t border-gray-100 space-y-1 bg-gray-50/20">
                <div className="px-3 mb-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">সিস্টেম</span>
                </div>

                <Link
                    href="/dashboard/subscribe"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                        pathname === '/dashboard/subscribe'
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiPackage size={20} className={pathname === '/dashboard/subscribe' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>সাবস্ক্রিপশন</span>
                    <span className="absolute right-3 text-[9px] font-extrabold bg-[#1e6bd6] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        আপগ্রেড
                    </span>
                </Link>

                <Link
                    href="/dashboard/sms"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                        pathname === '/dashboard/sms'
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiMessageSquare size={20} className={pathname === '/dashboard/sms' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>SMS সেবা</span>
                </Link>

                <Link
                    href="/dashboard/refer"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                        pathname === '/dashboard/refer'
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiGift size={20} className={pathname === '/dashboard/refer' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>রেফার ও আয়</span>
                    <span className="absolute right-3 text-[9px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-200">
                        আয়
                    </span>
                </Link>

                {supportAllowed ? (
                    <Link
                        href="/dashboard/support"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                            pathname === '/dashboard/support'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiHelpCircle size={20} className={pathname === '/dashboard/support' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>সাপোর্ট সেন্টার</span>
                        {hasUnread && (
                            <span className="absolute right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200 border-2 border-white" />
                        )}
                    </Link>
                ) : (
                    <button
                        onClick={(e) => handleLockedClick(e, 'সাপোর্ট সেন্টার')}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-400 hover:bg-gray-50 font-medium transition-all"
                    >
                        <FiHelpCircle size={20} className="text-gray-300" />
                        <span className="flex-1 text-left">সাপোর্ট সেন্টার</span>
                        <FiLock size={12} className="text-gray-300" />
                    </button>
                )}

                <Link
                    href="/dashboard/profile"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                        pathname === '/dashboard/profile'
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiUser size={20} className={pathname === '/dashboard/profile' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>আমার প্রোফাইল</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold group mt-2"
                >
                    <FiLogOut size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                    <span>লগআউট</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
