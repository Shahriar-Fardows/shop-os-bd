"use client";
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUpload, FiPrinter, FiTrash2, FiRotateCw, FiImage, FiCreditCard } from 'react-icons/fi';
import Swal from 'sweetalert2';

// 85.60 mm x 53.98 mm => ~1.585 aspect ratio
const NID_ASPECT = 85.6 / 53.98;

export default function NIDPrinter() {
    const [frontImg, setFrontImg] = useState(null);
    const [backImg, setBackImg] = useState(null);
    const [croppedFront, setCroppedFront] = useState(null);
    const [croppedBack, setCroppedBack] = useState(null);
    
    const [activeCrop, setActiveCrop] = useState(null); // 'front' or 'back'
    const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: NID_ASPECT });
    const imgRef = useRef(null);

    const onSelectFile = (e, side) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                if (side === 'front') setFrontImg(reader.result);
                else setBackImg(reader.result);
                setActiveCrop(side);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const getCroppedImg = useCallback(() => {
        if (!imgRef.current || !crop.width) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );

        const base64Image = canvas.toDataURL('image/jpeg');
        if (activeCrop === 'front') setCroppedFront(base64Image);
        else setCroppedBack(base64Image);
        
        setActiveCrop(null);
    }, [crop, activeCrop]);

    const handlePrint = () => {
        if (!croppedFront || !croppedBack) {
            return Swal.fire('Wait!', 'Please upload and crop both sides first.', 'warning');
        }
        window.print();
    };

    return (
        <div className="font-nunito pb-20">
            {/* Everything except the print area is wrapped in no-print */}
            <div className="space-y-8 no-print">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">NID Printer</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Standard Size Identity Card Printing</p>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="bg-[#1e6bd6] text-white px-8 py-3.5 rounded-lg text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-50 flex items-center gap-3 hover:opacity-90 transition-all active:scale-95"
                    >
                        <FiPrinter size={20} /> Print NID Page
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Front Side */}
                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-100 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
                        {croppedFront ? (
                            <div className="w-full h-full flex flex-col items-center">
                                <img src={croppedFront} alt="Front" className="rounded-lg shadow-md max-w-full border border-gray-200" />
                                <button onClick={() => {setCroppedFront(null); setFrontImg(null);}} className="mt-4 text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-red-600">
                                    <FiTrash2 /> Remove & Retry
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center">
                                <FiUpload size={40} className="text-[#1e6bd6] mb-4" />
                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">Upload Front Part</p>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onSelectFile(e, 'front')} />
                            </label>
                        )}
                    </div>

                    {/* Back Side */}
                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-100 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
                        {croppedBack ? (
                            <div className="w-full h-full flex flex-col items-center">
                                <img src={croppedBack} alt="Back" className="rounded-lg shadow-md max-w-full border border-gray-200" />
                                <button onClick={() => {setCroppedBack(null); setBackImg(null);}} className="mt-4 text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-red-600">
                                    <FiTrash2 /> Remove & Retry
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center">
                                <FiUpload size={40} className="text-[#1e6bd6] mb-4" />
                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">Upload Back Part</p>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onSelectFile(e, 'back')} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Cropping Modal Overlay */}
            {activeCrop && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm no-print">
                    <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                <FiRotateCw className="animate-spin-slow" /> Crop {activeCrop} Part
                            </h3>
                            <button onClick={() => setActiveCrop(null)} className="text-gray-400 hover:text-gray-900 font-bold">CANCEL</button>
                        </div>
                        
                        <div className="flex-1 flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={NID_ASPECT}>
                                <img 
                                    ref={imgRef} 
                                    src={activeCrop === 'front' ? frontImg : backImg} 
                                    alt="To Crop" 
                                    onLoad={(e) => {
                                        const { width, height } = e.currentTarget;
                                        setCrop(centerCrop(
                                            makeAspectCrop({ unit: '%', width: 90 }, NID_ASPECT, width, height),
                                            width, height
                                        ));
                                    }}
                                />
                            </ReactCrop>
                        </div>

                        <button 
                            onClick={getCroppedImg}
                            className="mt-6 bg-[#1e6bd6] text-white w-full py-4 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-blue-50 active:scale-[0.98] transition-all"
                        >
                            Confirm Crop Area
                        </button>
                    </div>
                </div>
            )}

            {/* Print Friendly View (Managed by CSS) */}
            <style jsx global>{`
                @media print {
                    /* Hide everything else */
                    .no-print, aside, header {
                        display: none !important;
                    }
                    /* Reset everything for print */
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    /* Main container resets to prevent scrolling/hiding */
                    main, div {
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .print-area {
                        display: flex !important;
                        flex-direction: column;
                        align-items: center;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        background: white;
                        z-index: 99999;
                        padding: 20mm 0;
                    }
                    .nid-image {
                        width: 85.6mm;
                        height: 53.98mm;
                        margin-bottom: 10mm;
                        display: block;
                        object-fit: cover;
                        border: 1px solid #000;
                    }
                }
                @media screen {
                    .print-area { display: none; }
                }
            `}</style>
            
            <div className="print-area">
                {croppedFront && <img src={croppedFront} className="nid-image" />}
                {croppedBack && <img src={croppedBack} className="nid-image" />}
            </div>
        </div>
    );
}
