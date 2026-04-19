"use client";
import { FiBell, FiFacebook, FiUsers, FiPhone, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

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

    const handleOpenWhatsapp = async () => {
        const { value: phoneNumber } = await Swal.fire({
            title: 'Open WhatsApp',
            input: 'text',
            inputLabel: 'কাস্টমারের ফোন নাম্বার দিন',
            inputPlaceholder: '01XXXXXXXXX',
            showCancelButton: true,
            confirmButtonColor: '#25D366',
            confirmButtonText: 'Open Chat',
            inputValidator: (value) => {
                if (!value) {
                    return 'নাম্বার দেওয়া বাধ্যতামূলক!';
                }
            }
        });

        if (phoneNumber) {
            // Remove non-digit characters
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const finalNumber = cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`;
            window.open(`https://wa.me/${finalNumber}`, '_blank');
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-10 font-nunito">
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <a 
                        href="https://www.facebook.com/groups/shoposbd" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                    >
                        <FiUsers size={16} />
                        <span className="hidden md:inline">FB Group</span>
                    </a>
                    <a 
                        href="https://www.facebook.com/profile.php?id=61572035892338" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                    >
                        <FiFacebook size={16} />
                        <span className="hidden md:inline">Official Page</span>
                    </a>
                </div>

                <div className="h-6 w-[1px] bg-gray-100 hidden sm:block mx-2"></div>

                <button 
                    onClick={handleOpenWhatsapp}
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-xs font-black hover:bg-[#128C7E] transition-all shadow-lg shadow-emerald-100 group"
                >
                    <FaWhatsapp size={18} className="group-hover:scale-110 transition-transform" />
                    <span>OPEN WHATSAPP</span>
                    <FiChevronRight className="opacity-50" />
                </button>
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
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand flex items-center justify-center text-sm font-extrabold shadow-sm border border-blue-100 uppercase italic">
                        {getInitials(user?.name)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
