"use client";
import { useState } from 'react';
import { FiSettings, FiGlobe, FiShield, FiInfo, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function AdminSettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        Swal.fire({ icon: 'success', title: 'Settings saved', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">System configuration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[
                    {
                        icon: FiGlobe,
                        title: 'Platform Settings',
                        fields: [
                            { label: 'Platform Name', def: 'ShopOS BD' },
                            { label: 'API Base URL', def: process.env.NEXT_PUBLIC_API_URL || '' },
                            { label: 'Support Email', def: 'support@shoposbd.com' },
                        ]
                    },
                    {
                        icon: FiShield,
                        title: 'Security',
                        fields: [
                            { label: 'JWT Expiry (hours)', def: '24' },
                            { label: 'Max Login Attempts', def: '5' },
                            { label: 'Session Timeout (min)', def: '60' },
                        ]
                    },
                ].map((section, si) => {
                    const Icon = section.icon;
                    return (
                        <div key={si} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100">
                                    <Icon size={16} />
                                </div>
                                <span className="text-sm font-extrabold text-gray-800">{section.title}</span>
                            </div>
                            {section.fields.map((f, fi) => (
                                <div key={fi}>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                                    <input
                                        defaultValue={f.def}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <FiInfo className="text-[#1e6bd6] shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                    Settings displayed are read from environment variables and API configuration. Changes made here require a server restart to take full effect.
                </p>
            </div>

            <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold uppercase tracking-widest text-sm shadow-sm shadow-blue-100 flex items-center gap-2 transition-all"
            >
                {saved ? <><FiCheck /> Saved!</> : <><FiSettings size={16} /> Save Settings</>}
            </button>
        </div>
    );
}
