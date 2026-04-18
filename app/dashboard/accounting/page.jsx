"use client";
import { useState, useEffect } from 'react';
import { 
    FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign, 
    FiUsers, FiTrash2, FiCalendar, FiPhone, FiBox, 
    FiArrowRight, FiPieChart, FiAlertCircle, FiSearch,
    FiCheckCircle, FiMinusCircle, FiList, FiLayers, FiActivity,
    FiSettings, FiShield
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function UnifiedBlueAccountsHub() {
    const api = useAxios();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily'); 
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const transRes = await api.get('/accounting');
            setTransactions(transRes.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleAddDue = async (preCustomer = '', preMobile = '') => {
        const { value: formValues } = await Swal.fire({
            title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">ADD NEW DUE (SALE)</span>',
            html: `
                <div class="flex flex-col gap-4 text-left font-nunito p-2">
                    <div class="space-y-1.5 mb-2">
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Customer Info</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input id="swal-customer" class="swal2-input !m-0 !w-full !rounded-lg text-sm" placeholder="Customer Name" value="${preCustomer}">
                            <input id="swal-mobile" class="swal2-input !m-0 !w-full !rounded-lg text-sm" placeholder="Mobile Number" value="${preMobile}">
                        </div>
                    </div>
                    <div id="items-container" class="space-y-2">
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Items & Prices</label>
                        <div class="flex gap-2 item-row">
                            <input class="item-name swal2-input !m-0 !w-3/4 !rounded-lg text-sm" placeholder="e.g. Printing">
                            <input type="number" class="item-price swal2-input !m-0 !w-1/4 !rounded-lg text-sm font-bold" placeholder="Price">
                        </div>
                    </div>
                    <button type="button" onclick="document.getElementById('items-container').insertAdjacentHTML('beforeend', '<div class=\\'flex gap-2 mt-2 item-row\\'><input class=\\'item-name swal2-input !m-0 !w-3/4 !rounded-lg text-sm\\' placeholder=\\'Add Item\\' /><input type=\\'number\\' class=\\'item-price swal2-input !m-0 !w-1/4 !rounded-lg text-sm font-bold\\' placeholder=\\'Price\\' /></div>')" class="text-sm font-black text-brand uppercase mt-2 self-start hover:underline">+ Add More Line Item</button>

                    <div class="space-y-1.5 mt-4 border-t pt-4">
                        <label class="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Initial Payment (৳)</label>
                        <input id="swal-paid" type="number" class="swal2-input !m-0 !w-full !rounded-lg text-base bg-gray-50 font-bold" placeholder="Paid now?">
                    </div>
                </div>
            `,
            confirmButtonText: 'Save Records',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            allowOutsideClick: false,
            showCloseButton: true,
            preConfirm: () => {
                const customerName = document.getElementById('swal-customer').value;
                const customerMobile = document.getElementById('swal-mobile').value;
                const paidAmount = document.getElementById('swal-paid').value;
                const itemRows = document.querySelectorAll('.item-row');
                const items = [];
                itemRows.forEach(row => {
                    const name = row.querySelector('.item-name').value;
                    const price = row.querySelector('.item-price').value;
                    if (name && price) items.push({ name, price: Number(price) });
                });
                if (items.length === 0) return Swal.showValidationMessage('Please add at least one item');
                return { title: `Sale to ${customerName || 'Customer'}`, customerName, customerMobile, items, paidAmount: Number(paidAmount || 0), type: 'Service' };
            }
        });

        if (formValues) {
            try {
                await api.post('/accounting/add', formValues);
                fetchData();
                Swal.fire({ icon: 'success', title: 'Due Recorded', showConfirmButton: false, timer: 1500 });
            } catch (error) {
                Swal.fire('Error', 'Record failed', 'error');
            }
        }
    };

    const handleCutDue = async (id, currentDue) => {
        const { value: amount } = await Swal.fire({
            title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">CUT DUE (PAYMENT)</span>',
            input: 'number',
            inputLabel: `Remaining Owed: ৳${currentDue}`,
            confirmButtonText: 'Reduce Due',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            allowOutsideClick: false,
            showCloseButton: true
        });
        if (amount) {
            try {
                await api.patch(`/accounting/update-payment/${id}`, { addAmount: amount });
                fetchData();
                Swal.fire('Updated', 'Balance adjusted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Update failed', 'error');
            }
        }
    };

    const handleQuickAdd = async (type) => {
        const { value: val } = await Swal.fire({
            title: `Record ${type}`,
            html: `<input id="q-t" class="swal2-input" placeholder="Title"><input id="q-a" type="number" class="swal2-input" placeholder="Amount">`,
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true,
            preConfirm: () => ({ title: document.getElementById('q-t').value, amount: Number(document.getElementById('q-a').value), type })
        });
        if (val) { await api.post('/accounting/add', val); fetchData(); }
    };

    const handleYearlyCleanup = async () => {
        const confirm = await Swal.fire({
            title: 'YEARLY DATA CLEANUP',
            text: "Delete history before current year? (Dues are kept safe)",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'Yes, Cleanup',
            allowOutsideClick: false,
            showCloseButton: true
        });
        if (confirm.isConfirmed) {
            try {
                await api.post('/accounting/yearly-cleanup');
                fetchData();
                Swal.fire('Cleaned', 'History removed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Cleanup failed', 'error');
            }
        }
    };

    const handleViewItems = (items = []) => {
        Swal.fire({
            title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">PURCHASE DETAILS</span>',
            html: `
                <div class="text-left font-nunito p-2">
                    <table class="w-full text-sm">
                        <thead class="text-sm text-gray-400 uppercase border-b">
                            <tr><th class="py-2 text-left">Item Name</th><th class="py-2 text-right">Price</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            ${items.map(i => `<tr><td class="py-3 font-bold text-gray-700">${i.name}</td><td class="py-3 text-right font-black text-[#1e6bd6]">৳${i.price}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            confirmButtonText: 'Great, Close',
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true
        });
    };

    const handleDelete = (id) => {
        Swal.fire({ 
            title: 'Delete Transaction?', 
            text: 'This action cannot be undone.',
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true
        }).then(r => {
            if (r.isConfirmed) api.delete(`/accounting/${id}`).then(fetchData);
        });
    };

    const inc = transactions.filter(t => t.type !== 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const exp = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const baki = transactions.reduce((s, t) => s + (t.dueAmount || 0), 0);

    const monthly = {};
    transactions.forEach(t => {
        const k = `${new Date(t.date).toLocaleString('en-US', { month: 'long' })} ${new Date(t.date).getFullYear()}`;
        if (!monthly[k]) monthly[k] = { inc: 0, exp: 0, bak: 0 };
        if (t.type !== 'Expense') monthly[k].inc += t.amount; else monthly[k].exp += t.amount;
        monthly[k].bak += (t.dueAmount || 0);
    });

    return (
        <div className="space-y-8 font-nunito pb-20">
            {/* Action Bar - ALL BLUE */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shop Accounts</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Unified Daily Ledger</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleQuickAdd('Income')} className="bg-[#1e6bd6] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 active:scale-95">
                        <FiPlus /> Income
                    </button>
                    <button onClick={() => handleQuickAdd('Expense')} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-black transition-all flex items-center gap-2 active:scale-95">
                        <FiPlus /> Expense
                    </button>
                    <button onClick={() => handleAddDue()} className="bg-[#1e6bd6] text-white px-6 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-blue-50 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95">
                        <FiLayers /> ADD NEW DUE (SALE)
                    </button>
                </div>
            </div>

            <div className="flex bg-white p-1 rounded-lg w-fit gap-1 shadow-sm">
                {['daily', 'summary', 'bakī', 'settings'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#1e6bd6] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                        {t === 'daily' ? 'Daily Ledger' : t === 'bakī' ? 'Customer Bakī' : t}
                    </button>
                ))}
            </div>

            {loading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl" />)}</div> : (
                <>
                    {/* Daily Ledger Tab */}
                    {activeTab === 'daily' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-[#1e6bd6]"><p className="text-sm font-bold text-gray-400 uppercase">Total Income</p><h3 className="text-xl font-black text-[#1e6bd6]">৳{inc.toLocaleString()}</h3></div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-gray-400"><p className="text-sm font-bold text-gray-400 uppercase">Total Expense</p><h3 className="text-xl font-black text-gray-700">৳{exp.toLocaleString()}</h3></div>
                                <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-emerald-500"><p className="text-sm font-bold text-gray-400 uppercase">Shop Profit</p><h3 className="text-xl font-black text-emerald-600">৳{(inc-exp).toLocaleString()}</h3></div>
                                <div className="bg-[#1e6bd6] p-5 rounded-lg text-white shadow-xl shadow-blue-50"><p className="text-sm font-bold text-white/70 uppercase">Outstanding Bakī</p><h3 className="text-2xl font-black">৳{baki.toLocaleString()}</h3></div>
                            </div>
                            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm text-gray-700">
                                    <thead className="bg-gray-50/50 text-sm uppercase font-bold text-gray-400">
                                        <tr><th className="px-6 py-4">Transaction Details</th><th className="px-6 py-4 text-center">Type</th><th className="px-6 py-4 text-right">Amount (৳)</th><th className="px-6 py-4 text-center">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 font-medium">
                                        {transactions.map(t => (
                                            <tr key={t._id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4"><p className="font-bold text-gray-800 text-base">{t.title}</p><p className="text-sm text-gray-400 font-bold uppercase">{t.items?.length ? t.items.map(i => `${i.name}(৳${i.price})`).join(', ') : ''}</p></td>
                                                <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${t.type === 'Expense' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-[#1e6bd6] border-blue-100'}`}>{t.type}</span></td>
                                                <td className={`px-6 py-4 text-right font-black text-base ${t.type === 'Expense' ? 'text-gray-700' : 'text-[#1e6bd6]'}`}>৳{t.amount?.toLocaleString()}</td>
                                                <td className="px-6 py-4 flex justify-center"><button onClick={() => handleDelete(t._id)} className="text-gray-300 hover:text-red-500 transition-all text-lg"><FiTrash2 /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Customer Bakī Tab (DUAL BUTTONS) */}
                    {activeTab === 'bakī' && (
                        <div className="bg-white rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30"><h4 className="font-black text-sm uppercase text-gray-800">Current Market Balances</h4></div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white text-sm font-bold text-gray-400 uppercase border-b border-gray-50">
                                    <tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4 text-right">Owed</th><th className="px-6 py-4 text-right">Remaining Bakī</th><th className="px-6 py-4 text-center">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {transactions.filter(t => t.dueAmount > 0).map(t => (
                                        <tr key={t._id} className="hover:bg-blue-50/10">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800 text-base">{t.customerName || 'Standard Client'}</p>
                                                <p className="text-sm text-gray-400 font-bold">{t.customerMobile}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-500">৳{t.totalBill}</td>
                                            <td className="px-6 py-4 text-right text-[#1e6bd6] font-black underline decoration-blue-100 text-base">৳{t.dueAmount}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleViewItems(t.items)} className="bg-blue-50 text-[#1e6bd6] px-4 py-2 rounded-lg hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 text-sm font-black uppercase" title="View Details">
                                                        <FiList size={16} /> Info
                                                    </button>
                                                    <button onClick={() => handleAddDue(t.customerName, t.customerMobile)} className="bg-[#1e6bd6] text-white px-3 py-2 rounded-lg text-sm font-black uppercase flex items-center gap-1.5 hover:opacity-90 shadow-sm">
                                                        <FiPlus /> Add Due
                                                    </button>
                                                    <button onClick={() => handleCutDue(t._id, t.dueAmount)} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-black uppercase flex items-center gap-1.5 hover:bg-black shadow-sm">
                                                        <FiMinusCircle /> Cut Due
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.filter(t => t.dueAmount > 0).length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-300 italic font-bold uppercase tracking-widest text-sm">No active dues at the moment</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-50">
                                    <tr><th className="px-6 py-4">Month</th><th className="px-6 py-4 text-right text-[#1e6bd6]">Income</th><th className="px-6 py-4 text-right">Expense</th><th className="px-6 py-4 text-right">Bakī</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                                    {Object.keys(monthly).map(m => (
                                        <tr key={m} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-[#1e6bd6] font-black text-base">{m}</td>
                                            <td className="px-6 py-4 text-right text-[#1e6bd6] text-base">৳{monthly[m].inc.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-gray-500">৳{monthly[m].exp.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-base">৳{monthly[m].bak.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-t-[#1e6bd6]">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-50 text-[#1e6bd6] rounded-lg flex items-center justify-center border border-blue-100"><FiShield size={24} /></div>
                                    <div><h4 className="text-xl font-black text-gray-800">Automatic Yearly Cleanup</h4><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maintenance Tool</p></div>
                                </div>
                                <p className="text-base text-gray-500 font-medium mb-8">Delete history before current year to maintain performance। <br/><span className="text-[#1e6bd6] font-black underline decoration-blue-100 italic">Dues will NOT be deleted.</span></p>
                                <button onClick={handleYearlyCleanup} className="bg-[#1e6bd6] text-white px-8 py-3 rounded-lg font-black text-sm uppercase tracking-widest hover:opacity-95 transition-all shadow-lg shadow-blue-50 active:scale-95">Run System Cleanup</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
