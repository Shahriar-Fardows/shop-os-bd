"use client";
import { useState } from 'react';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios';

export default function ClientLogin() {
  const router = useRouter();
  const api = useAxios();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/client-auth/login', formData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.client));
      
      Swal.fire({
        title: 'Welcome Back!',
        text: 'Login successful',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Login failed',
        icon: 'error',
        confirmButtonColor: '#1e6bd6'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl auth-card border border-gray-100 p-10">
        <div className="text-center mb-10">
          <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">Log in to your ShopOS BD account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-12 pr-4 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                placeholder="name@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
                <Link href="/forgot-password" size={16} className="text-xs font-bold text-brand hover:underline">Forgot?</Link>
            </div>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-12 pr-4 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand text-white rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-hover transition-all shadow-xl shadow-blue-50 mt-4 active:scale-95"
          >
            Sign In <FiArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-10 font-medium">
          New here? <Link href="/register" className="text-brand font-extrabold hover:underline ml-1">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}
