"use client";
import { FiFacebook, FiUsers, FiChevronRight, FiStar, FiClock, FiZap } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import useAxios from '@/hooks/useAxios';

const TopBar = () => {
    const api = useAxios();
    const [user, setUser] = useState(null);

    // Load from localStorage, then refresh from /me so we always see current plan/expiry
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch {}
        }

        let alive = true;
        api.get('/client-auth/me')
            .then(res => {
                if (!alive || !res.data?.data) return;
                setUser(res.data.data);
                localStorage.setItem('user', JSON.stringify(res.data.data));
            })
            .catch(() => {});
        return () => { alive = false; };
    }, [api]);

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
                if (!value) return 'নাম্বার দেওয়া বাধ্যতামূলক!';
            }
        });

        if (phoneNumber) {
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            const finalNumber = cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`;
            window.open(`https://wa.me/${finalNumber}`, '_blank');
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Derive plan badge
    const expiresAt = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
    const now = new Date();
    const isPaidActive = user?.planType === 'paid' && expiresAt && expiresAt > now;
    const planName = isPaidActive ? (user?.currentPackage?.name || 'Premium') : 'Free Plan';

    const daysLeft = isPaidActive
        ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

    const expiryLabel = isPaidActive
        ? expiresAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Upgrade for more tools';

    // Color palette by plan status
    const planStyle = isPaidActive
        ? (daysLeft <= 7
            ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', pulse: true }
            : { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-[#1e6bd6]', icon: 'text-[#1e6bd6]', pulse: false })
        : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: 'text-gray-400', pulse: false };

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
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-xs font-black hover:bg-[#128C7E] transition-all group"
                >
                    <FaWhatsapp size={18} className="group-hover:scale-110 transition-transform" />
                    <span>OPEN WHATSAPP</span>
                    <FiChevronRight className="opacity-50" />
                </button>
            </div>

            <div className="flex items-center gap-4">

                {/* Current Plan Badge — replaces the old notification bell */}
                <Link
                    href="/dashboard/subscribe"
                    className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border transition-all hover:shadow-none ${planStyle.bg} ${planStyle.border}`}
                    title={isPaidActive ? `Expires on ${expiryLabel}` : 'Upgrade to unlock more tools'}
                >
                    <div className={`relative ${planStyle.icon}`}>
                        {isPaidActive ? <FiStar size={16} /> : <FiZap size={16} />}
                        {planStyle.pulse && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight">
                        <span className={`text-[11px] font-extrabold uppercase tracking-widest ${planStyle.text}`}>
                            {planName}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                            <FiClock size={9} />
                            {isPaidActive
                                ? (daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left · ${expiryLabel}`)
                                : expiryLabel}
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-800 leading-none">
                            {user?.name || 'Guest User'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                            {isPaidActive ? 'Verified Partner' : 'Standard Store'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand flex items-center justify-center text-sm font-extrabold shadow-none border border-blue-100 uppercase italic overflow-hidden">
                        {user?.logo ? (
                            <img src={user.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            getInitials(user?.name)
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
