"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            const parsed = JSON.parse(user || '{}');
            if (parsed.role !== 'admin' && parsed.role !== 'superadmin') {
                router.push('/dashboard');
                return;
            }
        } catch {}
        setIsAuth(true);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!isAuth) return null;

    return (
        <div className="flex h-screen bg-gray-50 font-nunito">
            <AdminSidebar handleLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Admin Topbar */}
                <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ShopOS BD</span>
                        <span className="text-gray-200">/</span>
                        <span className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest">Admin Console</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest">Admin Mode</span>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
