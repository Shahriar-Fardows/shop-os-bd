"use client";
import { FiHome, FiBox, FiHelpCircle, FiUser, FiLogOut, FiLink, FiDollarSign, FiImage, FiCreditCard, FiScissors, FiFileText, FiGrid, FiFile, FiMail, FiGift } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import useAxios from '@/hooks/useAxios';

const Sidebar = ({ handleLogout }) => {
    const pathname = usePathname();
    const api = useAxios();
    const [hasUnread, setHasUnread] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await api.get('/support/unread-status');
                if (res.data.data.hasNewReply && !hasUnread) {
                    setHasUnread(true);
                    if (audioRef.current) audioRef.current.play().catch(e => {});
                } else if (!res.data.data.hasNewReply) {
                    setHasUnread(false);
                }
            } catch (error) {
                console.error("Notification check failed", error);
            }
        };
        const interval = setInterval(checkNotifications, 15000);
        checkNotifications();
        return () => clearInterval(interval);
    }, [api, hasUnread]);

    return (
        <aside className="w-64 border-r border-gray-100 flex flex-col h-screen bg-white font-nunito shadow-sm">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" />
            
            <div className="p-6 flex items-center gap-3">
                <img src="/shoposbd.png" alt="ShopOS BD" className="w-10 h-10 object-contain" />
                <div className="flex flex-col">
                    <h1 className="text-sm font-extrabold tracking-tight text-gray-800 uppercase leading-none">ShopOS BD</h1>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Store Console</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
                <nav className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">Main Menu</span>
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
                        <span>Dashboard Overview</span>
                    </Link>
                    <Link 
                        href="/dashboard/accounting"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/accounting' 
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50' 
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiDollarSign size={20} className={pathname === '/dashboard/accounting' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Digital Khata</span>
                    </Link>
                    <Link 
                        href="/dashboard/links"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/links' 
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50' 
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiLink size={20} className={pathname === '/dashboard/links' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Links Hub</span>
                    </Link>
                    <Link 
                        href="/dashboard/image-hub"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/image-hub' 
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50' 
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiImage size={20} className={pathname === '/dashboard/image-hub' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Image Hub (R2)</span>
                    </Link>
                    <Link 
                        href="/dashboard/nid-printer"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/nid-printer' 
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50' 
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiCreditCard size={20} className={pathname === '/dashboard/nid-printer' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>NID Printer</span>
                    </Link>
                    <Link
                        href="/dashboard/image-edit"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/image-edit'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiScissors size={20} className={pathname === '/dashboard/image-edit' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Image Editor (BG)</span>
                    </Link>
                    <Link
                        href="/dashboard/cv-maker"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/cv-maker'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiFileText size={20} className={pathname === '/dashboard/cv-maker' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>CV / Bio-Data Maker</span>
                    </Link>
                    <Link
                        href="/dashboard/application-letter"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/application-letter'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiMail size={20} className={pathname === '/dashboard/application-letter' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Application Letter</span>
                    </Link>
                    <Link
                        href="/dashboard/cash-memo"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/cash-memo'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiFile size={20} className={pathname === '/dashboard/cash-memo' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>Cash Memo Maker</span>
                    </Link>
                    <Link
                        href="/dashboard/qr-code"
                        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                            pathname === '/dashboard/qr-code'
                            ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                            : 'text-gray-500 hover:bg-gray-50 font-medium'
                        }`}
                    >
                        <FiGrid size={20} className={pathname === '/dashboard/qr-code' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                        <span>QR Code Maker</span>
                    </Link>
                </nav>
            </div>

            <div className="p-3 border-t border-gray-100 space-y-1 bg-gray-50/20">
                <div className="px-3 mb-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">System & Support</span>
                </div>
                
                <Link
                    href="/dashboard/refer"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                        pathname === '/dashboard/refer'
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiGift size={20} className={pathname === '/dashboard/refer' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>Refer & Earn</span>
                    <span className="absolute right-3 text-[9px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-200">
                        ৳100
                    </span>
                </Link>

                <Link
                    href="/dashboard/support"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all relative ${
                        pathname === '/dashboard/support' 
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold' 
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiHelpCircle size={20} className={pathname === '/dashboard/support' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>Support Center</span>
                    {hasUnread && (
                        <span className="absolute right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200 border-2 border-white" />
                    )}
                </Link>

                <Link 
                    href="/dashboard/profile"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                        pathname === '/dashboard/profile' 
                        ? 'bg-blue-50 text-[#1e6bd6] font-bold' 
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                >
                    <FiUser size={20} className={pathname === '/dashboard/profile' ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                    <span>My Account Profile</span>
                </Link>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold group mt-2"
                >
                    <FiLogOut size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                    <span>Logout Session</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
