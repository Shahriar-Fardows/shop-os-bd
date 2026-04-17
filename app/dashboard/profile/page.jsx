"use client";
import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
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
                <div className="md:col-span-2">
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
                </div>
            </div>
        </div>
    );
}
