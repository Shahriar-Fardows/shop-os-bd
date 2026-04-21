"use client";
import { useState } from 'react';
import { FiMail, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Swal from 'sweetalert2';
import useAxios from '@/hooks/useAxios';

export default function ClientForgotPassword() {
  const api = useAxios();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      Swal.fire({
        title: 'Sending Reset Link...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false
      });

      const res = await api.post('/client-auth/forgot-password', { email });
      
      Swal.fire({
        title: 'Email Sent!',
        text: res.data?.message || 'Check your inbox for password reset instructions',
        icon: 'success',
        confirmButtonColor: '#1e6bd6'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong',
        icon: 'error',
        confirmButtonColor: '#1e6bd6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl auth-card border border-gray-100 p-10">
        <div className="text-center mb-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand transition-colors mb-6 group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
          <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Forgot Password?</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">Enter your email and we'll send you a link to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand text-white rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-hover transition-all shadow-xl shadow-blue-50 mt-4 active:scale-[0.98]"
          >
            Send Reset Link <FiArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-10 font-medium italic">
          Tip: Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
}
