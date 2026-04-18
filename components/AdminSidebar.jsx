"use client";
import {
    FiHome, FiUsers, FiMessageSquare, FiSettings,
    FiLogOut, FiShield, FiActivity, FiBarChart2
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/support', label: 'Support Tickets', icon: FiMessageSquare },
    { href: '/admin/stats', label: 'Platform Stats', icon: FiBarChart2 },
    { href: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminSidebar({ handleLogout }) {
    const pathname = usePathname();

    const isActive = (item) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <aside className="w-60 border-r border-gray-100 flex flex-col h-screen bg-white font-nunito shadow-sm shrink-0">
            <div className="p-5 flex items-center gap-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-[#1e6bd6] flex items-center justify-center shadow-sm shadow-blue-100">
                    <FiShield size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-extrabold tracking-tight text-gray-800 uppercase leading-none">Admin Panel</h1>
                    <span className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest block">ShopOS BD</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
                <nav className="space-y-1">
                    <div className="px-3 mb-2">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Navigation</span>
                    </div>
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm transition-all ${
                                    active
                                        ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50/20">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-50 font-medium transition-all mb-1"
                >
                    <FiActivity size={18} className="text-gray-400" />
                    <span>Back to Dashboard</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold group"
                >
                    <FiLogOut size={18} className="text-red-400 group-hover:text-red-600" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
