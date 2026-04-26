"use client";
import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCheck, FiArrowLeft, FiActivity } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function ProfilePage() {
    const api = useAxios();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return Swal.fire('Error', 'New passwords do not match', 'error');
        }

        try {
            await api.patch('/client-auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            Swal.fire('Success', 'Password changed successfully', 'success');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to change password', 'error');
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading...</div>;
    if (!user) return <div className="p-10 text-center text-gray-400">User not found</div>;

    return (
        <div className="w-full font-nunito">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-brand transition-all">
                    <FiArrowLeft size={18} />
                </Link>
                <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 mx-auto mb-4">
                            {user.name[0]}
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-800">{user.name}</h3>
                        <p className="text-xs text-center text-gray-500 mb-6">{user.role || 'Member'}</p>
                        
                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-3">
                                <FiMail className="text-gray-400" size={16} />
                                <span className="text-sm text-gray-600">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiPhone className="text-gray-400" size={16} />
                                <span className="text-sm text-gray-600">{user.mobileNumber}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiMapPin className="text-gray-400" size={16} />
                                <span className="text-sm text-gray-600">{user.city}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <FiLock className="text-brand" size={18} />
                            <h3 className="text-md font-bold text-gray-800">Change Password</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                                <input 
                                    type="password" required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:border-brand outline-none transition-all"
                                    placeholder="Enter current password"
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                                    <input 
                                        type="password" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:border-brand outline-none transition-all"
                                        placeholder="New password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm Password</label>
                                    <input 
                                        type="password" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:border-brand outline-none transition-all"
                                        placeholder="Confirm new password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    className="bg-brand text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-hover transition-all flex items-center gap-2"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Shop & Payment Settings */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <FiActivity className="text-brand" size={18} />
                            <h3 className="text-md font-bold text-gray-800">Shop & Brand Settings</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Shop Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">দোকানের নাম (SMS-এর জন্য)</label>
                                <div className="flex gap-2">
                                    <input 
                                        id="shop-name-input"
                                        type="text"
                                        defaultValue={user.shopName || ''}
                                        className="flex-1 px-5 py-3 rounded-xl border border-blue-100 bg-gray-50/30 text-base font-bold focus:border-[#1e6bd6] outline-none transition-all"
                                        placeholder="যেমন: রহিম স্টোর"
                                    />
                                    <button 
                                        onClick={async () => {
                                            const name = document.getElementById('shop-name-input').value;
                                            try {
                                                await api.patch('/client/update-me', { shopName: name });
                                                const updatedUser = { ...user, shopName: name };
                                                setUser(updatedUser);
                                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                                Swal.fire({ icon: 'success', title: 'সংরক্ষিত হয়েছে', showConfirmButton: false, timer: 1500 });
                                            } catch (e) {
                                                Swal.fire('ত্রুটি', 'সেভ করা সম্ভব হয়নি', 'error');
                                            }
                                        }}
                                        className="bg-[#1e6bd6] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1656ac] transition-all active:scale-95 shadow-lg shadow-blue-50"
                                    >
                                        সেভ করুন
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold px-1 italic">* এটি আপনার পাঠানো SMS-এর শুরুতে থাকবে। ফাঁকা রাখলে "ShopOSBd" যাবে।</p>
                            </div>

                            {/* Payment Methods */}
                            <div className="pt-6 border-t border-gray-50 space-y-4">
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">পেমেন্ট মেথড সেটিংস</h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'bkash', label: 'bKash Number', color: 'text-[#E2136E]', bg: 'bg-[#fce8f1]', key: 'bkashNumber' },
                                        { id: 'nagad', label: 'Nagad Number', color: 'text-[#F7941D]', bg: 'bg-[#fff3e0]', key: 'nagadNumber' },
                                        { id: 'rocket', label: 'Rocket Number', color: 'text-[#8C3494]', bg: 'bg-[#f3e5f5]', key: 'rocketNumber' },
                                    ].map(p => (
                                        <div key={p.id} className="space-y-2">
                                            <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${p.color}`}>{p.label}</label>
                                            <input 
                                                id={`${p.id}-input`}
                                                type="text"
                                                defaultValue={user[p.key] || ''}
                                                className={`w-full px-4 py-2.5 rounded-xl border border-transparent ${p.bg} ${p.color} text-sm font-black focus:ring-2 focus:ring-current outline-none transition-all placeholder:${p.color}/50`}
                                                placeholder="01XXXXXXXXX"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={async () => {
                                        const bkash = document.getElementById('bkash-input').value;
                                        const nagad = document.getElementById('nagad-input').value;
                                        const rocket = document.getElementById('rocket-input').value;
                                        try {
                                            await api.patch('/client/update-me', { bkashNumber: bkash, nagadNumber: nagad, rocketNumber: rocket });
                                            const updatedUser = { ...user, bkashNumber: bkash, nagadNumber: nagad, rocketNumber: rocket };
                                            setUser(updatedUser);
                                            localStorage.setItem('user', JSON.stringify(updatedUser));
                                            Swal.fire({ icon: 'success', title: 'পেমেন্ট মেথড সংরক্ষিত', showConfirmButton: false, timer: 1500 });
                                        } catch (e) {
                                            Swal.fire('ত্রুটি', 'সেভ করা সম্ভব হয়নি', 'error');
                                        }
                                    }}
                                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    পেমেন্ট সেটিংস সেভ করুন
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
