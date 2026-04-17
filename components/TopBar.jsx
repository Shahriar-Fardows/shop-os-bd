"use client";
import { FiSearch, FiBell } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const TopBar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("User data parse failed", error);
            }
        }
    }, []);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-10 font-nunito">
            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
                <div className="relative w-full group">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search stores & analytics..." 
                        className="w-full bg-gray-50 border-gray-50 border rounded-full py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                    <FiBell size={20} className="text-gray-400 group-hover:text-brand transition-colors" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                </div>
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-800 leading-none">
                            {user?.name || 'Guest User'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                            {user?.planType === 'Premium' ? 'Verified Partner' : 'Standard Store'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand flex items-center justify-center text-sm font-extrabold shadow-sm border border-blue-100 uppercase italic">
                        {getInitials(user?.name)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
