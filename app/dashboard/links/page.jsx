"use client";
import { useState, useEffect } from 'react';
import { FiExternalLink, FiPlus, FiLink, FiShield, FiUser, FiSearch } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function AllLinksPage() {
    const api = useAxios();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const res = await api.get('/links');
            setLinks(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching links:', error);
            setLoading(false);
        }
    };

    const handleAddPersonalLink = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Resource Link',
            html: `
                <div class="flex flex-col gap-3 text-left font-nunito">
                    <label class="text-xs font-bold text-gray-400">Link Title</label>
                    <input id="swal-title" class="swal2-input !m-0 !w-full" style="border-radius: 8px" placeholder="e.g. My Supplier Site">
                    <label class="text-xs font-bold text-gray-400">URL</label>
                    <input id="swal-url" class="swal2-input !m-0 !w-full" style="border-radius: 8px" placeholder="https://example.com">
                    <label class="text-xs font-bold text-gray-400">Description</label>
                    <textarea id="swal-desc" class="swal2-textarea !m-0 !w-full" style="border-radius: 8px" placeholder="Short description..."></textarea>
                </div>
            `,
            confirmButtonText: 'Save Link',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            preConfirm: () => {
                const title = document.getElementById('swal-title').value;
                const url = document.getElementById('swal-url').value;
                const description = document.getElementById('swal-desc').value;
                if (!title || !url || !description) {
                    Swal.showValidationMessage('Please fill all fields');
                }
                return { title, url, description };
            }
        });

        if (formValues) {
            try {
                await api.post('/links', { ...formValues, type: 'free' });
                fetchLinks();
                Swal.fire({
                    title: 'Saved!',
                    text: 'Link added to the hub',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to save link', 'error');
            }
        }
    };

    const filteredLinks = links.filter(link => 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 font-nunito pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Resource Hub</h2>
                    <p className="text-sm text-gray-400 mt-2 font-medium italic">Discover tools or contribute your own links to the system.</p>
                </div>
                <button 
                    onClick={handleAddPersonalLink}
                    className="bg-brand text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-xl shadow-blue-50 hover:bg-brand-hover transition-all active:scale-95"
                >
                    <FiPlus size={20} /> Contribute Link
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-xl">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand transition-colors" size={20} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources by name or description..."
                    className="w-full bg-white border border-gray-100 rounded-lg py-4 pl-12 pr-4 text-sm focus:border-brand focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium shadow-sm"
                />
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {loading ? (
                    [1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-white border border-gray-50 animate-pulse rounded-3xl" />)
                ) : filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                        <div key={link._id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative">
                            <div className="absolute top-6 right-6">
                                {link.clientId ? (
                                    <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-purple-100">User Contribution</span>
                                ) : (
                                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${
                                        link.type === 'premium' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                    }`}>
                                        Official {link.type}
                                    </span>
                                )}
                            </div>
                            
                            <div className="w-14 h-14 bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-brand rounded-2xl flex items-center justify-center mb-6 transition-all shadow-sm">
                                <FiLink size={28} />
                            </div>
                            
                            <h4 className="text-xl font-bold text-gray-800 mb-3 truncate pr-20">{link.title}</h4>
                            <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2 leading-relaxed">{link.description}</p>
                            
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-extrabold text-brand hover:underline"
                                >
                                    Access Resource <FiExternalLink size={14} />
                                </a>
                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">Safe Link</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                            <FiSearch size={32} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No matching resources found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
