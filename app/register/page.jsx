"use client";
import { useState, useEffect, Suspense } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiArrowRight, FiGift, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';
import useAxios from '@/hooks/useAxios';

function RegisterInner() {
  const router = useRouter();
  const api = useAxios();
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobileNumber: '', city: '', shopName: '',
    referralCode: refFromUrl.toUpperCase(),
  });
  const [refInfo, setRefInfo] = useState(null); // referral discount preview

  // Fetch referral discount % from backend platform config (public endpoint)
  useEffect(() => {
    if (!formData.referralCode) return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    fetch(`${API}/platform-config`)
      .then(r => r.json())
      .then(j => {
        if (j?.data?.referral?.newUserDiscount) {
          setRefInfo({ discount: j.data.referral.newUserDiscount });
        }
      })
      .catch(() => {});
  }, [formData.referralCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register the user (send referral code if present — backend can link it)
      const payload = { ...formData };
      if (payload.referralCode) {
        payload.referralCode = payload.referralCode.trim().toUpperCase();
      } else {
        delete payload.referralCode;
      }

      await api.post('/client-auth/register', payload);

      // Login
      const loginRes = await api.post('/client-auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', loginRes.data.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.data.client));

      // (Referral is recorded automatically by the backend when the registration payload includes referralCode)

      Swal.fire({
        title: 'Success!',
        text: payload.referralCode
          ? `Account created! Referral code "${payload.referralCode}" applied.`
          : 'Account created successfully. Redirecting to dashboard...',
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
      <div className="container mx-auto max-w-md w-full bg-white rounded-lg auth-card border border-gray-100 p-8">
        <div className="text-center mb-8">
          <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-gray-400 mt-2 font-medium">Join our marketplace today</p>
        </div>

        {/* Referral banner */}
        {formData.referralCode && refInfo && (
          <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <FiGift size={18} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-800">
                🎉 Referral code: <span className="font-mono">{formData.referralCode}</span>
              </p>
              <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                প্রথম সাবস্ক্রিপশনে <strong>{refInfo.discount}% ছাড়</strong> পাবেন!
              </p>
            </div>
          </div>
        )}

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
                        value={formData.name}
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
                        value={formData.mobileNumber}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Shop / Brand Name</label>
            <div className="relative group">
              <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand" size={18} />
              <input
                type="text" required
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-11 pr-4 text-xs focus:bg-white focus:border-brand outline-none transition-all"
                placeholder="Rahim Store"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
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
                value={formData.city}
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
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1">
              <FiGift size={11} className="text-amber-500" /> Referral Code (Optional)
            </label>
            <div className="relative group">
              <FiGift className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500" size={18} />
              <input
                type="text"
                className="w-full bg-amber-50/50 border border-amber-100 rounded-lg py-2.5 pl-11 pr-4 text-xs font-extrabold tracking-widest uppercase text-gray-800 focus:bg-white focus:border-amber-400 outline-none transition-all"
                placeholder="SHOP-XXXXXX"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
              />
            </div>
            <p className="text-[10px] font-bold text-gray-400 px-1">
              বন্ধুর কোড থাকলে দিন, আপনিও ছাড় পাবেন
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-brand text-white rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-hover transition-all shadow-xl shadow-blue-50 mt-6 active:scale-[0.98]"
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

export default function ClientRegister() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterInner />
    </Suspense>
  );
}
