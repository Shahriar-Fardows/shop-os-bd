"use client";
import { useState, useEffect, useCallback } from 'react';
import {
    FiGift, FiCopy, FiShare2, FiUsers, FiDollarSign, FiCheck,
    FiTrendingUp, FiAward, FiZap, FiRefreshCw, FiExternalLink, FiClock
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTelegram } from 'react-icons/fa';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function ReferEarnPage() {
    const api = useAxios();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalReferred: 0, totalEarned: 0, pendingReward: 0, referredUsers: [] });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [rewardConfig, setRewardConfig] = useState({ rewardPerReferral: 100, newUserDiscount: 10, bonusMonthAfterReferrals: 5, paymentNote: 'bKash / Nagad' });
    const [cashouts, setCashouts] = useState([]);
    const [activeTab, setActiveTab] = useState('referred'); // referred | cashouts

    const loadUser = useCallback(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        } catch (e) { console.error(e); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/referrals/my-stats');
            if (res.data?.data) setStats(res.data.data);
        } catch (e) {
            console.log('Referral API not available, using defaults');
        } finally {
            setLoading(false);
        }
    }, [api]);

    const fetchConfig = useCallback(async () => {
        try {
            const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${API}/platform-config`);
            const j = await res.json();
            if (j?.data?.referral) {
                setRewardConfig(j.data.referral);
            }
        } catch { /* keep defaults */ }
    }, []);

    const fetchCashouts = useCallback(async () => {
        try {
            const res = await api.get('/referrals/my-cashouts');
            if (res.data?.data) setCashouts(res.data.data);
        } catch (e) { console.error('Failed to fetch cashouts'); }
    }, [api]);

    useEffect(() => {
        loadUser();
        fetchStats();
        fetchConfig();
        fetchCashouts();
    }, [loadUser, fetchStats, fetchConfig, fetchCashouts]);

    const referralCode = user
        ? `SHOP-${(user._id || user.email || 'USER').slice(-6).toUpperCase()}`
        : 'SHOP-XXXXXX';

    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/register?ref=${referralCode}`
        : `https://shoposbd.com/register?ref=${referralCode}`;

    const copyToClipboard = (text, label = 'Copied') => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Swal.fire({
            icon: 'success',
            title: label,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    };

    const shareMessage = encodeURIComponent(
        `🎉 ShopOS BD — বাংলাদেশের প্রিন্ট ও কম্পিউটার শপের জন্য সেরা প্ল্যাটফর্ম!\n\n` +
        `আমি ব্যবহার করি, আপনিও ট্রাই করুন। আমার রেফারেল কোড ব্যবহার করলে ${rewardConfig.newUserDiscount}% ছাড় পাবেন:\n\n` +
        `কোড: ${referralCode}\nলিংক: ${referralLink}`
    );

    const shareLinks = {
        whatsapp: `https://wa.me/?text=${shareMessage}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${shareMessage}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareMessage}`,
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Refer & Earn</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Invite fellow shop owners · Earn rewards together
                </p>
            </div>

            {/* Hero Card — Referral Code */}
            <div className="bg-gradient-to-br from-[#1e6bd6] via-[#2b7fe8] to-[#1656ac] rounded-lg p-6 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                            <FiGift size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Your Referral Code</p>
                            <p className="text-[10px] font-bold text-white/60">Share with friends & shop owners</p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px] bg-white/15 backdrop-blur border border-white/20 rounded-lg px-4 py-3">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Code</p>
                            <p className="text-2xl font-extrabold tracking-wider">{referralCode}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(referralCode, 'Code copied!')}
                            className="px-5 py-3 rounded-lg bg-white text-[#1e6bd6] font-extrabold text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                        >
                            {copied ? <><FiCheck size={15} /> Copied</> : <><FiCopy size={15} /> Copy</>}
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2.5 border border-white/20">
                        <FiExternalLink size={13} className="text-white/70 shrink-0" />
                        <span className="text-xs font-medium truncate flex-1">{referralLink}</span>
                        <button
                            onClick={() => copyToClipboard(referralLink, 'Link copied!')}
                            className="text-[10px] font-extrabold uppercase tracking-widest hover:text-white/80 shrink-0"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Share Buttons */}
            <div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3">Share Instantly</p>
                <div className="grid grid-cols-3 gap-3">
                    <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer"
                       className="flex items-center justify-center gap-2 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all group">
                        <FaWhatsapp className="text-green-500 group-hover:scale-110 transition-transform" size={22} />
                        <span className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">WhatsApp</span>
                    </a>
                    <a href={shareLinks.facebook} target="_blank" rel="noreferrer"
                       className="flex items-center justify-center gap-2 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                        <FaFacebook className="text-[#1877f2] group-hover:scale-110 transition-transform" size={22} />
                        <span className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">Facebook</span>
                    </a>
                    <a href={shareLinks.telegram} target="_blank" rel="noreferrer"
                       className="flex items-center justify-center gap-2 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all group">
                        <FaTelegram className="text-[#0088cc] group-hover:scale-110 transition-transform" size={22} />
                        <span className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">Telegram</span>
                    </a>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'Total Referred', value: stats.totalReferred || 0, sub: 'Shop owners joined', icon: FiUsers, color: 'blue' },
                    { 
                        label: 'Total Earned', 
                        value: `৳${stats.totalEarned || 0}`, 
                        sub: 'Cashback rewards', 
                        icon: FiDollarSign, 
                        color: 'green'
                    },
                    { 
                        label: 'Pending', 
                        value: `৳${stats.pendingReward || 0}`, 
                        sub: 'Awaiting payment', 
                        icon: FiTrendingUp, 
                        color: 'orange',
                        action: {
                            label: 'Withdraw',
                            onClick: async () => {
                                const { value: formValues } = await Swal.fire({
                                    title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">CASHOUT REWARDS</span>',
                                    html: `
                                        <div class="flex flex-col gap-4 text-left font-nunito p-2">
                                            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Withdraw your earned cashback to your bKash Personal number.</p>
                                            
                                            <div class="space-y-1.5">
                                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Amount (৳)</label>
                                                <input id="swal-amount" type="number" class="swal2-input !m-0 !w-full !rounded-lg text-sm bg-gray-50 cursor-not-allowed" placeholder="Min. ৳15" value="${stats.pendingReward || ''}" readonly>
                                                <p class="text-[9px] font-bold text-[#1e6bd6] px-1 uppercase mt-1">Minimum ৳15 Required</p>
                                            </div>

                                            <div class="space-y-1.5">
                                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                                                <div class="w-full py-3 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 flex items-center justify-between">
                                                    <span>bKash (Personal)</span>
                                                    <span class="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">Selected</span>
                                                </div>
                                                <input type="hidden" id="swal-method" value="bKash (Personal)">
                                            </div>

                                            <div class="space-y-1.5">
                                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">bKash Personal Number</label>
                                                <input id="swal-phone" class="swal2-input !m-0 !w-full !rounded-lg text-sm" placeholder="017XXXXXXXX" value="${user?.phone || ''}">
                                            </div>
                                        </div>
                                    `,
                                    confirmButtonText: 'Request Cashout',
                                    confirmButtonColor: '#1e6bd6',
                                    showCancelButton: true,
                                    showCloseButton: true,
                                    preConfirm: () => {
                                        const amount = document.getElementById('swal-amount').value;
                                        const method = document.getElementById('swal-method').value;
                                        const phone = document.getElementById('swal-phone').value;
                                        if (!amount || Number(amount) < 15) return Swal.showValidationMessage('Minimum cashout is ৳15');
                                        if (!phone || phone.length < 11) return Swal.showValidationMessage('Enter a valid bKash number');
                                        return { amount, method, phone };
                                    }
                                });

                                if (formValues) {
                                    try {
                                        Swal.fire({ title: 'Sending Request...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
                                        const res = await api.post('/referrals/cashout', {
                                            ...formValues,
                                            referralCode: referralCode
                                        });
                                        
                                        if (res.data.success) {
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Request Sent',
                                                text: 'Your cashout request has been sent to the admin. You will receive the payment within 24-48 hours.',
                                                confirmButtonColor: '#1e6bd6'
                                            });
                                            fetchCashouts();
                                            fetchStats();
                                        } else {
                                            throw new Error(res.data.message);
                                        }
                                    } catch (error) {
                                        Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to send request', 'error');
                                    }
                                }
                            }
                        }
                    },
                ].map((s, i) => {
                    const Icon = s.icon;
                    const colors = {
                        blue: 'bg-blue-50 text-[#1e6bd6] border-blue-100',
                        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        orange: 'bg-orange-50 text-orange-500 border-orange-100',
                    };
                    return (
                        <div key={i} className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{s.label}</p>
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colors[s.color]}`}>
                                    <Icon size={16} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between flex-1">
                                <h3 className="text-2xl font-extrabold text-gray-900 leading-none">{s.value}</h3>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{s.sub}</p>
                            
                            {s.action && (
                                <button 
                                    onClick={s.action.onClick}
                                    className="mt-4 w-full py-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                                >
                                    {s.action.label}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Combined Activity Section */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('referred')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === 'referred' ? 'bg-[#1e6bd6] text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                                }`}>
                            <FiUsers size={14} /> Referred Shops
                        </button>
                        <button onClick={() => setActiveTab('cashouts')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === 'cashouts' ? 'bg-[#1e6bd6] text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
                                }`}>
                            <FiDollarSign size={14} /> Cashouts
                        </button>
                    </div>
                    <button onClick={() => { fetchStats(); fetchCashouts(); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest hover:bg-gray-100">
                        <FiRefreshCw size={11} /> Refresh Data
                    </button>
                </div>

                <div className="p-0">
                    {activeTab === 'referred' && (
                        <div className="animate-in fade-in duration-300">
                            {loading ? (
                                <div className="p-20 text-center"><FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto" size={24} /></div>
                            ) : stats.referredUsers?.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {stats.referredUsers.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-4 hover:bg-blue-50/10">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center font-extrabold text-sm">
                                                {(r.name || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{new Date(r.joinedAt).toLocaleDateString('en-BD')}</p>
                                            </div>
                                            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                                r.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {r.status || 'pending'}
                                            </span>
                                            <span className="text-sm font-extrabold text-emerald-600 ml-2">
                                                +৳{r.reward || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center text-gray-300">
                                    <FiUsers size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No referred shops yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'cashouts' && (
                        <div className="animate-in fade-in duration-300">
                            {cashouts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <tr>
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Amount</th>
                                                <th className="px-5 py-3">Method</th>
                                                <th className="px-5 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 font-medium">
                                            {cashouts.map((c, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors text-[11px]">
                                                    <td className="px-5 py-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-BD')}</td>
                                                    <td className="px-5 py-4 font-extrabold text-gray-800">৳{c.amount}</td>
                                                    <td className="px-5 py-4 text-gray-400 font-bold uppercase">{c.method}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${
                                                            c.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            c.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-20 text-center text-gray-300">
                                    <FiDollarSign size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No withdrawal history</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100">
                        <FiZap size={16} />
                    </div>
                    <span className="text-sm font-extrabold text-gray-800">How It Works</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { step: '1', title: 'Share Your Code', desc: 'Send your referral code or link to fellow shop owners via WhatsApp / Facebook.' },
                        { step: '2', title: 'They Sign Up & Subscribe', desc: `When they register using your code, they get ${rewardConfig.newUserDiscount}% off their first subscription — and you earn too.` },
                        { step: '3', title: 'You Earn Rewards', desc: `Get ৳${rewardConfig.rewardPerReferral} cashback per referral. After every ${rewardConfig.bonusMonthAfterReferrals} referrals, get 1 free month added to your plan.` },
                    ].map((s, i) => (
                        <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50/40">
                            <div className="w-8 h-8 rounded-lg bg-[#1e6bd6] text-white flex items-center justify-center font-extrabold text-sm mb-3">
                                {s.step}
                            </div>
                            <p className="text-sm font-extrabold text-gray-800 mb-1">{s.title}</p>
                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reward Info Banner */}
            <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                    <FiGift size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-extrabold text-amber-900 mb-1">Reward Structure</p>
                    <ul className="text-[11px] font-medium text-amber-800 space-y-1 leading-relaxed">
                        <li>• <strong>৳{rewardConfig.rewardPerReferral} cashback</strong> for every successful referral who subscribes</li>
                        <li>• <strong>{rewardConfig.newUserDiscount}% discount</strong> applied automatically to the referred user's first subscription</li>
                        <li>• <strong>+1 free month</strong> added to your current plan after every {rewardConfig.bonusMonthAfterReferrals} successful referrals</li>
                        <li>• Payments processed via bKash Personal within 24-48 hours of request</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
