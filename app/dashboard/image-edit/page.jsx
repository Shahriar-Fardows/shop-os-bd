"use client";
import React, { useState } from 'react';
import removeBackground from '@imgly/background-removal';
import { FiUpload, FiDownload, FiTrash2, FiScissors, FiLoader, FiZap, FiImage, FiAlertCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function ImageEditPage() {
    const [sourceImage, setSourceImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                return Swal.fire('File too large', 'Please upload an image smaller than 10MB', 'error');
            }
            setSourceImage(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const handleRemoveBackground = async () => {
        if (!sourceImage) return;

        setIsRemoving(true);
        setProgress(0);

        try {
            const blob = await removeBackground(sourceImage, {
                progress: (p) => setProgress(Math.round(p * 100)),
                debug: false,
                model: 'medium'
            });

            const url = URL.createObjectURL(blob);
            setResultImage(url);
            setIsRemoving(false);
            
            Swal.fire({
                icon: 'success',
                title: 'Background Removed!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            console.error(error);
            setIsRemoving(false);
            Swal.fire('Error', 'Background removal failed. Please try a clearer image.', 'error');
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `shoposbd-bg-removed-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reset = () => {
        setSourceImage(null);
        setResultImage(null);
        setProgress(0);
    };

    return (
        <div className="space-y-8 font-nunito pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI BG Remover</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Native Browser-Based AI Edge Cutting</p>
                </div>
                {sourceImage && !isRemoving && (
                    <button 
                        onClick={reset}
                        className="text-red-400 hover:text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <FiTrash2 /> Reset Canvas
                    </button>
                )}
            </div>

            {!sourceImage ? (
                /* Upload Zone */
                <div className="bg-white rounded-2xl border-4 border-dashed border-blue-50 p-20 flex flex-col items-center justify-center text-center group hover:border-[#1e6bd6] transition-all cursor-pointer relative overflow-hidden">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileSelect}
                    />
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center text-[#1e6bd6] mb-6 group-hover:scale-110 transition-transform">
                        <FiUpload size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Upload Your Image</h3>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">Supports PNG, JPG (Max 10MB)</p>
                </div>
            ) : (
                /* Editor Workspace */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Source / Progress */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Original Image</span>
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                            <img src={sourceImage} alt="Source" className="w-full h-full object-contain" />
                            {isRemoving && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                                    <FiLoader className="text-[#1e6bd6] animate-spin mb-4" size={48} />
                                    <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">AI is Cutting...</h4>
                                    <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-[#1e6bd6] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs font-black text-[#1e6bd6] mt-2">{progress}% Processed</p>
                                </div>
                            )}
                        </div>
                        {!resultImage && !isRemoving && (
                            <button 
                                onClick={handleRemoveBackground}
                                className="mt-6 w-full bg-[#1e6bd6] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
                            >
                                <FiZap /> Start AI Removal
                            </button>
                        )}
                    </div>

                    {/* Result Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-h-[400px]">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Result Preview</span>
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-gray-100 border border-gray-100 flex items-center justify-center">
                            {resultImage ? (
                                <img src={resultImage} alt="Result" className="w-full h-full object-contain animate-fade-in" />
                            ) : (
                                <div className="text-center p-8">
                                    <FiScissors size={48} className="text-gray-200 mx-auto mb-2" />
                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Run AI to see result</p>
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <button 
                                onClick={handleDownload}
                                className="mt-6 w-full bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-emerald-50 flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
                            >
                                <FiDownload /> Download Transparent PNG
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Info Footer */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                <FiAlertCircle className="text-blue-400 mt-1 shrink-0" size={20} />
                <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Privacy Protected AI</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 leading-relaxed uppercase">
                        This AI tool runs entirely in your browser. Your images are never uploaded to any server. Background removal happens locally on your computer for maximum security and privacy.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
