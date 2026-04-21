"use client";
import { useState, useEffect, Suspense } from 'react';
import { FiLock, FiCheck, FiArrowRight } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import useAxios from '@/hooks/useAxios';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const api = useAxios();
    
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = searchParams.get('token');
        const e = searchParams.get('email');
        if (t) setToken(t);
        if (e) setEmail(e);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return Swal.fire('Error', 'Passwords do not match', 'error');
        }
        if (newPassword.length < 6) {
            return Swal.fire('Error', 'Password must be at least 6 characters', 'error');
        }

        setLoading(true);
        try {
            Swal.fire({
                title: 'Resetting Password...',
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false
            });

            await api.post('/client-auth/reset-password', {
                token,
                email,
                newPassword
            });

            Swal.fire({
                title: 'Success!',
                text: 'Your password has been reset successfully.',
                icon: 'success',
                confirmButtonColor: '#1e6bd6'
            });

            router.push('/login');
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to reset password. Link may be expired.',
                icon: 'error',
                confirmButtonColor: '#1e6bd6'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-nunito">
                <div className="max-w-md w-full bg-white rounded-lg border border-gray-100 p-10 text-center shadow-xl shadow-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <FiLock size={24} />
                    </div>
                    <h2 className="text-xl font-black text-gray-800 mb-2">Invalid Reset Link</h2>
                    <p className="text-sm text-gray-500 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
                    <Link href="/forgot-password" 
                          className="inline-block bg-[#1e6bd6] text-white px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-nunito">
            <div className="max-w-md w-full bg-white rounded-lg border border-gray-100 p-10 shadow-xl shadow-gray-100">
                <div className="text-center mb-10">
                    <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set New Password</h1>
                    <p className="text-sm text-gray-400 mt-2 font-medium">Please enter a strong password for your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e6bd6] transition-colors" size={18} />
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 text-sm focus:bg-white focus:border-[#1e6bd6] outline-none transition-all font-bold"
                                placeholder="••••••••"
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirm New Password</label>
                        <div className="relative group">
                            <FiCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e6bd6] transition-colors" size={18} />
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 text-sm focus:bg-white focus:border-[#1e6bd6] outline-none transition-all font-bold"
                                placeholder="••••••••"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1e6bd6] text-white rounded-lg py-3.5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl shadow-[#1e6bd6]/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Reset Password <FiArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-nunito">
                <div className="max-w-md w-full bg-white rounded-lg border border-gray-100 p-10 shadow-xl shadow-gray-100 text-center">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#1e6bd6] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Initializing reset session...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

