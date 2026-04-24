"use client";
import { useState, useEffect } from 'react';
import { 
    FiUploadCloud, FiSearch, FiTrash2, FiEdit3, 
    FiCopy, FiImage, FiSettings, FiExternalLink, FiPlus,
    FiFilter, FiAlertCircle, FiDownload, FiArrowRight
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function ImageHubPage() {
    const api = useAxios();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [usage, setUsage] = useState({ monthlyCount: 0, planLimit: 0 });

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async (search = '', pageNum = 1, append = false) => {
        try {
            if (append) setIsLoadingMore(true); else setLoading(true);
            const res = await api.get(`/image-hub?search=${search}&page=${pageNum}&limit=20`);
            
            if (append) {
                setImages(prev => [...prev, ...res.data.data]);
            } else {
                setImages(res.data.data);
            }
            
            setHasMore(res.data.meta.hasMore);
            setUsage(res.data.meta.usage || { monthlyCount: 0, planLimit: 0 });
            setPage(pageNum);
            setLoading(false);
            setIsLoadingMore(false);
        } catch (error) {
            console.error("Failed to fetch images", error);
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        fetchImages(val, 1, false);
    };

    const handleLoadMore = () => {
        fetchImages(searchQuery, page + 1, true);
    };

    const handleUpload = async () => {
        const { value: file } = await Swal.fire({
            title: '<span class="font-nunito font-black text-xl text-[#1e6bd6]">UPLOAD TO SHOP R2</span>',
            input: 'file',
            inputAttributes: {
                'accept': 'image/*',
                'aria-label': 'Upload your shop image'
            },
            showCancelButton: true,
            confirmButtonText: 'Select & Name',
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true
        });

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return Swal.fire('Too Big!', 'Maximum file size is 5MB.', 'error');
            }

            const { value: imageName } = await Swal.fire({
                title: 'Name your image',
                input: 'text',
                inputValue: file.name.split('.')[0],
                showCancelButton: true,
                confirmButtonText: 'Start Upload',
                confirmButtonColor: '#1e6bd6',
                allowOutsideClick: false,
                showCloseButton: true,
                inputValidator: (value) => {
                    if (!value) return 'You must name the image!';
                }
            });

            if (imageName) {
                Swal.fire({
                    title: 'Optimizing & Uploading...',
                    didOpen: () => { Swal.showLoading(); },
                    allowOutsideClick: false
                });

                const formData = new FormData();
                formData.append('image', file);
                formData.append('name', imageName);

                try {
                    await api.post('/image-hub/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    fetchImages();
                    Swal.fire({ icon: 'success', title: 'Image Saved to Hub', showConfirmButton: false, timer: 1500 });
                } catch (error) {
                    Swal.fire('Upload Failed', error.response?.data?.message || 'Network error', 'error');
                }
            }
        }
    };

    const handleEditName = async (id, currentName) => {
        const { value: newName } = await Swal.fire({
            title: 'Rename Image',
            input: 'text',
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: 'Update Name',
            confirmButtonColor: '#1e6bd6',
            allowOutsideClick: false,
            showCloseButton: true
        });

        if (newName && newName !== currentName) {
            try {
                await api.patch(`/image-hub/${id}`, { name: newName });
                fetchImages(searchQuery);
                Swal.fire('Updated', 'Name has been changed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Update failed', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Image?',
            text: "This will permanently remove the image from Cloudflare R2.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Delete',
            allowOutsideClick: false,
            showCloseButton: true
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/image-hub/${id}`);
                fetchImages(searchQuery);
                Swal.fire('Deleted', 'Image removed from storage.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Delete failed', 'error');
            }
        }
    };

    const handleDownload = async (url, filename) => {
        try {
            Swal.fire({ title: 'Preparing Download', didOpen: () => Swal.showLoading(), toast: true, position: 'top-end', showConfirmButton: false });
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${filename.replace(/\s+/g, '_')}.webp`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            Swal.close();
        } catch (err) {
            Swal.fire('Error', 'Download failed. Your browser might be blocking the connection.', 'error');
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        Swal.fire({
            icon: 'success',
            title: 'Link Copied',
            text: 'Image URL is ready to share!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    };

    return (
        <div className="space-y-8 font-nunito pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Image Hub</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Cloudflare R2 Optimized Storage</p>
                </div>
                <button 
                    onClick={handleUpload}
                    className="bg-[#1e6bd6] text-white px-8 py-3.5 rounded-lg text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:opacity-95 transition-all flex items-center gap-3 active:scale-95"
                >
                    <FiUploadCloud size={20} /> Upload New Asset
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-[#1e6bd6]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Assets</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">{images.length} Images</h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-l-emerald-500">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max File Size</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">5.0 MB</h3>
                </div>
                <div className="bg-[#1e6bd6] p-6 rounded-lg text-white shadow-xl shadow-blue-50">
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Monthly Usage</p>
                    <h3 className="text-xl font-black mt-1">
                        {usage.planLimit === -1 ? `${usage.monthlyCount} / Unlimited` : `${usage.monthlyCount} / ${usage.planLimit}`}
                    </h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search assets by name..." 
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-gray-50 border-none rounded-lg py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-3 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-all font-bold text-sm uppercase flex items-center gap-2 justify-center">
                        <FiFilter /> Filter
                    </button>
                </div>
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-lg" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {images.map((img) => (
                        <div key={img._id} className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
                            <div className="aspect-square relative overflow-hidden bg-gray-50">
                                <img 
                                    src={img.url} 
                                    alt={img.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => copyToClipboard(img.url)}
                                        className="p-2 bg-white text-[#1e6bd6] rounded-lg hover:bg-blue-50 transition-all shadow-lg"
                                        title="Copy Link"
                                    >
                                        <FiCopy size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDownload(img.url, img.name)}
                                        className="p-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all shadow-lg"
                                        title="Download Asset"
                                    >
                                        <FiDownload size={18} />
                                    </button>
                                    <a 
                                        href={img.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-lg"
                                        title="View Original"
                                    >
                                        <FiExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-black text-gray-800 truncate mb-2 uppercase tracking-tight">{img.name}</p>
                                <div className="flex justify-between items-center bg-gray-50 p-1 rounded-lg">
                                    <button 
                                        onClick={() => handleEditName(img._id, img.name)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                        title="Rename"
                                    >
                                        <FiEdit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(img._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <FiImage size={48} className="text-gray-200 mb-4" />
                            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No images found in your hub</p>
                        </div>
                    )}
                </div>
            )}

            {/* Load More Section */}
            {hasMore && (
                <div className="flex justify-center mt-12 pb-10">
                    <button 
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className={`bg-white border-2 border-[#1e6bd6] text-[#1e6bd6] px-10 py-3 rounded-lg text-sm font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 shadow-md active:scale-95 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoadingMore ? 'Fetching More...' : (
                            <>Load Next 20 Images <FiArrowRight /></>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
