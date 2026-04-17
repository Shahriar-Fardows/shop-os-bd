"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuth(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!isAuth) return null;

    return (
        <div className="flex h-screen bg-gray-50 font-nunito">
            <Sidebar handleLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                {/* Enforcing container mx-auto globally for all dashboard pages */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
