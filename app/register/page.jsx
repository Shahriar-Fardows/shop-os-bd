"use client";
import { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios';

export default function ClientRegister() {
  const router = useRouter();
  const api = useAxios();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', mobileNumber: '', city: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First register the user
      await api.post('/client-auth/register', formData);
      
      // Then login to get the token
      const loginRes = await api.post('/client-auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', loginRes.data.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.data.client));

      Swal.fire({
        title: 'Success!',
        text: 'Account created successfully. Redirecting to dashboard...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Registration failed',
        icon: 'error',
        confirmButtonColor: '#1e6bd6'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-nunito">
      <div className="container mx-auto max-w-md w-full bg-white rounded-3xl auth-card border border-gray-100 p-8">
        <div className="text-center mb-10">
          <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-gray-400 mt-2 font-medium">Join our marketplace today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
                    <input 
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                        placeholder="John Doe"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone</label>
                <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
                    <input 
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                        placeholder="017XXXXXXXX"
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                    />
                </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
              <input 
                type="email" required
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                placeholder="name@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">City</label>
            <div className="relative group">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
              <input 
                type="text" required
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                placeholder="Dhaka"
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
              <input 
                type="password" required
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand text-white rounded-lg py-3 font-bold text-base flex items-center justify-center gap-3 hover:bg-brand-hover transition-all shadow-xl shadow-blue-50 mt-6 active:scale-[0.98]"
          >
            Create Account <FiArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8 font-medium">
          Already have an account? <Link href="/login" className="text-brand font-bold hover:underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
