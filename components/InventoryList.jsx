"use client";
import { FiSearch, FiChevronDown, FiPlus, FiBox, FiShield, FiDollarSign, FiPieChart } from 'react-icons/fi';
import Swal from 'sweetalert2';

const InventoryList = () => {
    const tools = [
        { id: 1, name: 'bKash Business', type: 'Digital Payment', category: 'FINANCE', status: 'Verified', icon: <FiDollarSign size={20} />, url: 'https://www.bkash.com/business' },
        { id: 2, name: 'Nagad Business', type: 'Digital Payment', category: 'FINANCE', status: 'Verified', icon: <FiDollarSign size={20} />, url: 'https://nagad.com.bd/business' },
        { id: 3, name: 'RedX Courier', type: 'Logistics', category: 'DELIVERY', status: 'Partner', icon: <FiBox size={20} />, url: 'https://redx.com.bd' },
        { id: 4, name: 'Steadfast Courier', type: 'Logistics', category: 'DELIVERY', status: 'Partner', icon: <FiBox size={20} />, url: 'https://steadfast.com.bd' },
        { id: 5, name: 'Pathao Courier', type: 'Logistics', category: 'DELIVERY', status: 'Partner', icon: <FiBox size={20} />, url: 'https://pathao.com/courier' },
        { id: 6, name: 'Daraz Seller Center', type: 'Marketplace', category: 'SALES', status: 'Verified', icon: <FiPieChart size={20} />, url: 'https://sellercenter.daraz.com.bd' },
    ];

    const handleOpenLink = (url, name) => {
        Swal.fire({
            title: `<span class="font-nunito font-black text-[#1e6bd6]">Open ${name}?</span>`,
            text: "You are about to visit an external website for your shop operations.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Open Site',
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(url, '_blank');
            }
        });
    };

    return (
        <div className="p-8 container mx-auto w-full font-nunito">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shopkeeper Hub</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Digital Tools & Helpful Links</p>
                </div>
            </div>

            {/* Hub Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-[#1e6bd6]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Digital Payments</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">Available</h3>
                    <p className="text-[10px] text-blue-500 font-bold mt-2 uppercase">bKash / Nagad / Rocket</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery Partners</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">Logistics</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase">RedX / Pathao / SteadFast</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-orange-400">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shop Accounts</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">Live</h3>
                    <p className="text-[10px] text-orange-500 font-bold mt-2 uppercase">Ready for Hishab</p>
                </div>
                <div className="bg-[#1e6bd6] p-6 rounded-lg shadow-xl shadow-blue-50 text-white">
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">System Health</p>
                    <h3 className="text-2xl font-black mt-1">Online</h3>
                    <p className="text-[10px] text-white/50 font-bold mt-2 uppercase">ShopOS Core Active</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="relative max-w-md w-full">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search helpul websites..." 
                            className="w-full bg-white border-none rounded-lg py-3 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Services: {tools.length}</div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-white">
                            <th className="px-8 py-5">Service Identity</th>
                            <th className="px-8 py-5 text-center">Category</th>
                            <th className="px-8 py-5 text-center">Partnership</th>
                            <th className="px-8 py-5 text-center">Direct Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tools.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center transition-all group-hover:scale-110">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-800 leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">{item.type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="text-xs font-black px-4 py-1.5 rounded-lg border text-[#1e6bd6] border-blue-100 bg-blue-50/50 uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ring-4 ${
                                            item.status === 'Verified' ? 'bg-emerald-500 ring-emerald-50' : 'bg-blue-400 ring-blue-50'
                                        }`}></span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${
                                            item.status === 'Verified' ? 'text-emerald-600' : 'text-blue-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <button 
                                        onClick={() => handleOpenLink(item.url, item.name)}
                                        className="text-sm font-black text-white px-6 py-2.5 rounded-lg bg-[#1e6bd6] shadow-md shadow-blue-50 hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                        Visit Website
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryList;
