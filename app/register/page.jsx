"use client";
import { useState, useEffect, Suspense } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiArrowRight, FiGift, FiLayers, FiImage, FiUploadCloud, FiTrash2, FiRefreshCw } from 'react-icons/fi';
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
    logo: '',
    referralCode: refFromUrl.toUpperCase(),
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return Swal.fire('Error', 'Logo size should be less than 2MB', 'error');
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let finalLogo = '';

      // 1. Upload Logo if exists
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('image', logoFile);
        const uploadRes = await api.post('/image-hub/public-upload', logoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalLogo = uploadRes.data.data.url;
      }

      // 2. Register the user
      const payload = { ...formData, logo: finalLogo };
      if (payload.referralCode) {
        payload.referralCode = payload.referralCode.trim().toUpperCase();
      } else {
        delete payload.referralCode;
      }

      await api.post('/client-auth/register', payload);

      // 3. Login
      const loginRes = await api.post('/client-auth/login', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', loginRes.data.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.data.client));

      Swal.fire({
        title: 'Success!',
        text: 'Account created and shop logo uploaded successfully!',
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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6 font-nunito">
      <div className="container mx-auto max-w-lg w-full bg-white rounded-3xl auth-card border border-gray-100 p-10 shadow-2xl shadow-blue-50">
        <div className="text-center mb-10">
          <Link href="/">
            <img src="/shoposbd.png" alt="Logo" className="w-16 h-16 mx-auto mb-6 hover:scale-110 transition-transform" />
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create your Shop</h1>
          <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Start your 14-day premium trial today</p>
        </div>

        {/* Logo Upload Circle */}
        <div className="flex flex-col items-center mb-10">
           <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group-hover:border-blue-400 transition-all">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FiImage size={24} />
                    <span className="text-[8px] font-black uppercase mt-1">Shop Logo</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <FiUploadCloud className="text-white" size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>
              {logoPreview && (
                <button 
                  type="button" 
                  onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <FiTrash2 size={12} />
                </button>
              )}
           </div>
           <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest">Upload Shop Logo (Recommended)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Owner Name</label>
                <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                    <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Mobile</label>
                <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                    <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
                        placeholder="017XXXXXXXX"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                    />
                </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
              <input
                type="email" required
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
                placeholder="shop@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Shop Name</label>
            <div className="relative group">
              <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
              <input
                type="text" required
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                placeholder="e.g. Dream Digital Shop"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                <div className="relative group">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
                    placeholder="Dhaka"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600" size={18} />
                  <input
                    type="password" required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full bg-[#1e6bd6] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-6 active:scale-[0.98] ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <><FiRefreshCw className="animate-spin" /> Finalizing...</>
            ) : (
              <>Create Your Shop <FiArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-10 font-bold uppercase tracking-widest text-[10px]">
          Already registered? <Link href="/login" className="text-blue-600 font-black hover:underline ml-1">Sign In</Link>
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
