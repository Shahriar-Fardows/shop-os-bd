"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    FiUpload, FiDownload, FiRefreshCw, FiX, FiMove,
    FiCrop, FiCheckCircle, FiTrash2, FiZap, FiImage,
    FiGrid, FiLayers, FiSliders, FiMinimize2, FiMaximize2,
    FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight,
    FiInfo
} from 'react-icons/fi';

const CANVAS_W = 820;
const CANVAS_H = 560;
const HANDLE_SIZE = 12;

const BG_PRESETS = [
    { label: 'সাদা',    value: '#ffffff' },
    { label: 'নীল',     value: '#1e6bd6' },
    { label: 'আসমানি', value: '#87CEEB' },
    { label: 'নেভি',   value: '#1e3a8a' },
    { label: 'ধূসর',   value: '#f3f4f6' },
    { label: 'লাল',    value: '#dc2626' },
];

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const readFile = (file) =>
    new Promise((res) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.readAsDataURL(file); });

const blobToDataURL = (blob) =>
    new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });

const dataUrlToBlob = (dataUrl) => {
    const [header, b64] = dataUrl.split(',');
    const mime  = header.match(/:(.*?);/)[1];
    const bytes = atob(b64);
    const arr   = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
};

const getImglyPublicPath = () => `${window.location.origin}/imgly/`;

const cleanEdges = (blob) => new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, w, h);
        const px = id.data;
        for (let i = 0; i < px.length; i += 4) {
            if (px[i + 3] < 30) px[i + 3] = 0;
        }
        ctx.putImageData(id, 0, 0);
        cv.toBlob((b) => { URL.revokeObjectURL(url); resolve(b); }, 'image/png');
    };
    img.src = url;
});


// ─── UploadCard ───────────────────────────────────────────────────────────────
function UploadCard({ index, raw, processing, progress, onFile, onCrop, onDelete }) {
    const fileRef = useRef(null);
    const label = index === 0 ? 'বাম ছবি (Left)' : 'ডান ছবি (Right)';

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded bg-[#1e6bd6] text-white text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                </span>
                <span className="text-xs font-bold text-gray-700">{label}</span>
            </div>

            {!raw ? (
                <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
                    className="w-full h-36 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#1e6bd6]/10 flex items-center justify-center transition-colors shadow-sm">
                        <FiUpload size={18} className="text-blue-400 group-hover:text-[#1e6bd6]" />
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] font-bold text-[#1e6bd6]">ছবি নির্বাচন করুন</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">Drag & Drop</p>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    {processing && (
                        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-blue-100 border-t-[#1e6bd6] rounded-full animate-spin" />
                            <p className="text-[#1e6bd6] text-[10px] font-bold">প্রসেসিং {progress}%</p>
                            <div className="w-2/3 h-1 bg-blue-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#1e6bd6] transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    <img src={raw.src} alt={`photo-${index + 1}`} className="w-full h-full object-contain p-2" draggable={false} />

                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={e => { e.stopPropagation(); onCrop(); }} className="px-3 py-1.5 bg-white text-gray-700 hover:text-[#1e6bd6] text-[10px] font-bold rounded shadow-sm flex items-center gap-1 transition-colors">
                            <FiCrop size={12} /> ক্রপ
                        </button>
                        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 text-[10px] font-bold rounded shadow-sm flex items-center gap-1 transition-colors">
                            <FiTrash2 size={12} /> মুছুন
                        </button>
                    </div>

                    <button onClick={() => fileRef.current?.click()} className="absolute top-2 right-2 w-7 h-7 bg-white text-gray-500 rounded-md flex items-center justify-center shadow-sm hover:text-[#1e6bd6] transition-colors opacity-0 group-hover:opacity-100">
                        <FiRefreshCw size={12} />
                    </button>
                </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JointPhotoPage() {
    const [rawImages, setRawImages]   = useState([null, null]);
    const [images, setImages]         = useState([null, null]);
    const [bgColor, setBgColor]       = useState('#1e6bd6');
    const [customBg, setCustomBg]     = useState('#1e6bd6');
    const [downloading, setDownloading] = useState(false);
    const [selected, setSelected]     = useState(null);
    const [processing, setProcessing] = useState([false, false]);
    const [progress, setProgress]     = useState([0, 0]);

    const [showGrid, setShowGrid]     = useState(true);
    const [frontImageIndex, setFrontImageIndex] = useState(1);

    const [displayScale, setDisplayScale] = useState(1);
    const outerRef      = useRef(null);
    const containerRef  = useRef(null);
    const interaction   = useRef(null);

    const [cropModal, setCropModal]         = useState(null);
    const [crop, setCrop]                   = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const cropImgRef = useRef(null);

    useEffect(() => {
        const update = () => {
            if (outerRef.current) setDisplayScale(Math.min(1, outerRef.current.offsetWidth / CANVAS_W));
        };
        update();
        const ro = new ResizeObserver(update);
        if (outerRef.current) ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, []);

    const handleFile = async (file, index) => {
        if (!file || !file.type.startsWith('image/')) return;
        const src = await readFile(file);
        const img = new Image();
        img.onload = () => {
            setRawImages(prev => {
                const n = [...prev];
                n[index] = { src, naturalW: img.naturalWidth, naturalH: img.naturalHeight };
                return n;
            });
        };
        img.src = src;
    };

    const placeImage = (src, index, naturalW, naturalH) => {
        const targetW   = Math.round(CANVAS_W * 0.44);
        const scale     = targetW / naturalW;
        const w         = targetW;
        const h         = Math.round(naturalH * scale);
        const clampedH  = Math.min(h, CANVAS_H - 20);
        const clampedW  = clampedH < h ? Math.round(w * clampedH / h) : w;
        const x = index === 0
            ? Math.round(CANVAS_W * 0.03)
            : Math.round(CANVAS_W * 0.97 - clampedW);
        const y = Math.round((CANVAS_H - clampedH) / 2);

        setImages(prev => {
            const n = [...prev];
            n[index] = { src, x, y, w: clampedW, h: clampedH, naturalW, naturalH };
            return n;
        });
        setSelected(index);
    };

    const removeBgSingle = async (src, index, naturalW, naturalH) => {
        setProcessing(prev => { const n = [...prev]; n[index] = true; return n; });
        setProgress(prev => { const n = [...prev]; n[index] = 0; return n; });
        try {
            const inputBlob = dataUrlToBlob(src);
            const rawBlob = await removeBackground(inputBlob, {
                publicPath: getImglyPublicPath(),
                progress: (...args) => {
                    let pct = 0;
                    if (args.length >= 3 && typeof args[2] === 'number' && args[2] > 0)
                        pct = Math.round((args[1] / args[2]) * 100);
                    else if (typeof args[0] === 'number')
                        pct = Math.round(args[0] * 100);
                    setProgress(prev => { const n = [...prev]; n[index] = pct; return n; });
                },
                debug: false,
                model: 'medium',
            });
            const blob = await cleanEdges(rawBlob);
            const dataUrl = await blobToDataURL(blob);
            placeImage(dataUrl, index, naturalW, naturalH);
        } catch (err) {
            console.error('BG removal failed for image', index, err);
        } finally {
            setProcessing(prev => { const n = [...prev]; n[index] = false; return n; });
            setProgress(prev => { const n = [...prev]; n[index] = 0; return n; });
        }
    };

    const handleUploadPhotos = async () => {
        if (!rawImages.some(Boolean)) return;
        await Promise.all(rawImages.map((raw, i) => raw ? removeBgSingle(raw.src, i, raw.naturalW, raw.naturalH) : Promise.resolve()));
    };

    const getLogical = (clientX, clientY) => {
        const rect = containerRef.current.getBoundingClientRect();
        return { lx: (clientX - rect.left) / displayScale, ly: (clientY - rect.top) / displayScale };
    };
    const getClient = (e) => { const t = e.touches ? e.touches[0] : e; return { clientX: t.clientX, clientY: t.clientY }; };

    const hitHandle = (lx, ly, img) => {
        const pts = { tl: { x: img.x, y: img.y }, tr: { x: img.x + img.w, y: img.y }, bl: { x: img.x, y: img.y + img.h }, br: { x: img.x + img.w, y: img.y + img.h } };
        const hit = HANDLE_SIZE / displayScale;
        for (const [corner, pt] of Object.entries(pts))
            if (Math.abs(lx - pt.x) <= hit && Math.abs(ly - pt.y) <= hit) return corner;
        return null;
    };

    const onPointerDown = useCallback((e, index) => {
        e.preventDefault(); e.stopPropagation();
        setSelected(index);
        const { clientX, clientY } = getClient(e);
        const { lx, ly } = getLogical(clientX, clientY);
        const img = images[index];
        if (!img) return;
        const corner = hitHandle(lx, ly, img);
        if (corner) {
            interaction.current = { type: 'resize', index, corner, startX: lx, startY: ly, origX: img.x, origY: img.y, origW: img.w, origH: img.h };
        } else {
            interaction.current = { type: 'move', index, startX: lx - img.x, startY: ly - img.y };
        }
    }, [images, displayScale]);

    const onPointerMove = useCallback((e) => {
        if (!interaction.current) return;
        const { clientX, clientY } = getClient(e);
        const { lx, ly } = getLogical(clientX, clientY);
        const it = interaction.current;
        if (it.type === 'move') {
            setImages(prev => {
                const n = [...prev];
                if (!n[it.index]) return prev;
                n[it.index] = { ...n[it.index], x: lx - it.startX, y: ly - it.startY };
                return n;
            });
        } else {
            const { corner, origX, origY, origW, origH } = it;
            const dx = lx - it.startX; const dy = ly - it.startY;
            const aspect = origW / origH;
            let newW = origW, newH = origH, newX = origX, newY = origY;
            if      (corner === 'br') { newW = Math.max(40, origW + dx); newH = Math.round(newW / aspect); }
            else if (corner === 'tr') { newW = Math.max(40, origW + dx); newH = Math.round(newW / aspect); newY = origY + origH - newH; }
            else if (corner === 'bl') { newW = Math.max(40, origW - dx); newH = Math.round(newW / aspect); newX = origX + origW - newW; }
            else if (corner === 'tl') { newW = Math.max(40, origW - dx); newH = Math.round(newW / aspect); newX = origX + origW - newW; newY = origY + origH - newH; }
            setImages(prev => {
                const n = [...prev];
                if (!n[it.index]) return prev;
                n[it.index] = { ...n[it.index], x: newX, y: newY, w: newW, h: newH };
                return n;
            });
        }
    }, [displayScale]);

    const onPointerUp = useCallback(() => { interaction.current = null; }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
        return () => {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    const handleDownload = async () => {
        if (!images.some(Boolean)) return;
        setDownloading(true);
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_W * scale; canvas.height = CANVAS_H * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
        
        const drawOrder = frontImageIndex === 0 ? [1, 0] : [0, 1];
        for (const i of drawOrder) {
            const img = images[i];
            if (!img) continue;
            const el = await loadImg(img.src);
            ctx.drawImage(el, Math.round(img.x), Math.round(img.y), Math.round(img.w), Math.round(img.h));
        }
        
        const link = document.createElement('a');
        link.download = `joint-passport-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        setDownloading(false);
    };

    const openCrop = (index) => {
        const src = rawImages[index]?.src;
        if (!src) return;
        setCrop(undefined); setCompletedCrop(undefined);
        setCropModal({ index, src });
    };
    const openCropCanvas = (index) => {
        const src = images[index]?.src;
        if (!src) return;
        setCrop(undefined); setCompletedCrop(undefined);
        setCropModal({ index, src, fromCanvas: true });
    };
    const onCropLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 85 }, 35 / 45, width, height), width, height));
    };
    const applyCrop = async () => {
        if (!completedCrop || !cropImgRef.current) return;
        const img = cropImgRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        const canvas = document.createElement('canvas');
        canvas.width  = completedCrop.width  * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,
            completedCrop.x * scaleX, completedCrop.y * scaleY,
            completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, canvas.width, canvas.height);
        const croppedSrc = canvas.toDataURL('image/png');
        const { index, fromCanvas } = cropModal;
        if (fromCanvas) {
            placeImage(croppedSrc, index, canvas.width, canvas.height);
        } else {
            setRawImages(prev => {
                const n = [...prev];
                n[index] = { src: croppedSrc, naturalW: canvas.width, naturalH: canvas.height };
                return n;
            });
        }
        setCropModal(null);
    };

    const deleteRaw = (index) => {
        setRawImages(prev => { const n = [...prev]; n[index] = null; return n; });
        setImages(prev => { const n = [...prev]; n[index] = null; return n; });
        if (selected === index) setSelected(null);
    };
    const deleteCanvasImage = (index) => {
        setImages(prev => { const n = [...prev]; n[index] = null; return n; });
        if (selected === index) setSelected(null);
    };

    const reset = () => {
        setImages([null, null]); setRawImages([null, null]);
        setBgColor('#1e6bd6'); setCustomBg('#1e6bd6'); setSelected(null);
        setFrontImageIndex(1); setShowGrid(true);
    };

    const adjustScale = (index, factor) => {
        setImages(prev => {
            const n = [...prev];
            const img = n[index];
            if (!img) return prev;
            const newW = Math.max(30, Math.round(img.w * factor));
            const aspect = img.w / img.h;
            const newH = Math.round(newW / aspect);
            const dx = Math.round((img.w - newW) / 2);
            const dy = Math.round((img.h - newH) / 2);
            n[index] = { ...img, w: newW, h: newH, x: img.x + dx, y: img.y + dy };
            return n;
        });
    };
    const nudge = (index, dx, dy) => {
        setImages(prev => {
            const n = [...prev];
            const img = n[index];
            if (!img) return prev;
            n[index] = { ...img, x: img.x + dx, y: img.y + dy };
            return n;
        });
    };

    const hasRaw        = rawImages.some(Boolean);
    const hasCanvas     = images.some(Boolean);
    const isProcessing  = processing.some(Boolean);
    const renderOrder   = frontImageIndex === 0 ? [1, 0] : [0, 1];

    return (
        <div className="font-nunito pb-20">
            {/* Header matches the clean app theme */}
            <div className="flex justify-between items-center mb-6 px-6 pt-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">জয়েন্ট পাসপোর্ট ফটো</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                        AI Powered · Background Removal · Smart Alignment
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={reset}
                        className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <FiTrash2 /> সব মুছুন
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!hasCanvas || downloading}
                        className="px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-sm shadow-blue-100"
                    >
                        <FiDownload /> {downloading ? 'Processing...' : 'Download PNG'}
                    </button>
                </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start px-6">
                
                {/* Left Panel: Controls */}
                <div className="space-y-4 xl:sticky xl:top-6">
                    
                    {/* Step 1: Upload */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shadow-sm">
                                <FiUpload size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">ছবি আপলোড</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">বাম ও ডান পাশের ছবি</p>
                            </div>
                        </div>

                        {/* Grid-cols-1 for vertical stacking */}
                        <div className="grid grid-cols-1 gap-4">
                            {[0, 1].map(i => (
                                <UploadCard
                                    key={i} index={i} raw={rawImages[i]} processing={processing[i]} progress={progress[i]}
                                    onFile={file => handleFile(file, i)} onCrop={() => openCrop(i)} onDelete={() => deleteRaw(i)}
                                />
                            ))}
                        </div>

                        <div className="mt-5">
                            <button
                                onClick={handleUploadPhotos}
                                disabled={!hasRaw || isProcessing}
                                className="w-full py-3.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 text-white text-xs font-extrabold tracking-wide shadow-sm shadow-blue-100 flex items-center justify-center gap-2 transition-all"
                            >
                                {isProcessing ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> প্রসেসিং হচ্ছে...</>
                                ) : (
                                    <><FiZap /> AI দিয়ে ব্যাকগ্রাউন্ড সরান</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Settings */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-extrabold text-gray-800">ক্যানভাস সেটিংস</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ব্যাকগ্রাউন্ড কালার</span>
                                <div className="flex gap-2 flex-wrap">
                                    {BG_PRESETS.map(p => (
                                        <button
                                            key={p.value} onClick={() => { setBgColor(p.value); setCustomBg(p.value); }} title={p.label}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${bgColor === p.value ? 'border-[#1e6bd6] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                            style={{ background: p.value }}
                                        />
                                    ))}
                                    <input
                                        type="color" value={customBg} onChange={e => { setCustomBg(e.target.value); setBgColor(e.target.value); }}
                                        className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5 hover:border-gray-300"
                                        title="Custom কালার"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowGrid(!showGrid)}
                                    className={`py-2 px-3 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                        showGrid ? 'bg-blue-50 border-blue-100 text-[#1e6bd6]' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    <FiGrid size={12} /> {showGrid ? 'গাইডলাইন: চালু' : 'গাইডলাইন: বন্ধ'}
                                </button>
                                <button
                                    onClick={() => setFrontImageIndex(frontImageIndex === 1 ? 0 : 1)}
                                    disabled={!hasCanvas}
                                    className="py-2 px-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    <FiLayers size={12} /> {frontImageIndex === 1 ? 'ডান ছবি উপরে' : 'বাম ছবি উপরে'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Selected Image Controls */}
                    {selected !== null && images[selected] && (
                        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm p-5 animate-fade-in relative">
                            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                <FiX size={14} />
                            </button>
                            <div className="flex items-center gap-2 mb-4">
                                <FiSliders className="text-[#1e6bd6]" size={14} />
                                <span className="text-xs font-extrabold text-[#1e6bd6] uppercase tracking-wider">
                                    {selected === 0 ? 'বাম ছবি' : 'ডান ছবি'} সিলেক্টেড
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 items-center">
                                {/* Size & Crop */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => adjustScale(selected, 0.95)} className="flex-1 py-1.5 bg-white border border-blue-100 text-[#1e6bd6] rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-1">
                                            <FiMinimize2 /> ছোট
                                        </button>
                                        <button onClick={() => adjustScale(selected, 1.05)} className="flex-1 py-1.5 bg-white border border-blue-100 text-[#1e6bd6] rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors flex justify-center items-center gap-1">
                                            <FiMaximize2 /> বড়
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openCropCanvas(selected)} className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold hover:bg-gray-50 flex justify-center items-center gap-1">
                                            <FiCrop /> ক্রপ
                                        </button>
                                        <button onClick={() => deleteCanvasImage(selected)} className="flex-1 py-1.5 bg-white border border-red-100 text-red-500 rounded-md text-[10px] font-bold hover:bg-red-50 flex justify-center items-center gap-1">
                                            <FiTrash2 /> মুছুন
                                        </button>
                                    </div>
                                </div>

                                {/* D-pad */}
                                <div className="flex justify-center">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-sm bg-blue-100/50" />
                                        <button onClick={() => nudge(selected, 0, -2)} className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-blue-100 text-[#1e6bd6] rounded shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95"><FiArrowUp size={10} /></button>
                                        <button onClick={() => nudge(selected, 0, 2)} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-blue-100 text-[#1e6bd6] rounded shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95"><FiArrowDown size={10} /></button>
                                        <button onClick={() => nudge(selected, -2, 0)} className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-blue-100 text-[#1e6bd6] rounded shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95"><FiArrowLeft size={10} /></button>
                                        <button onClick={() => nudge(selected, 2, 0)} className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-blue-100 text-[#1e6bd6] rounded shadow-sm flex items-center justify-center hover:bg-blue-50 active:scale-95"><FiArrowRight size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Canvas */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex items-center justify-center relative overflow-hidden min-h-[500px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                        
                        <div ref={outerRef} className="w-full flex justify-center z-10" onClick={() => setSelected(null)}>
                            <div style={{ width: CANVAS_W * displayScale, height: CANVAS_H * displayScale, position: 'relative', flexShrink: 0 }}>
                                <div
                                    ref={containerRef}
                                    style={{
                                        width: CANVAS_W, height: CANVAS_H,
                                        background: bgColor,
                                        position: 'absolute', top: 0, left: 0,
                                        transform: `scale(${displayScale})`,
                                        transformOrigin: 'top left',
                                        overflow: 'hidden',
                                        touchAction: 'none',
                                        userSelect: 'none',
                                        borderRadius: 8,
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {!hasCanvas && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                                <FiImage size={24} className="text-blue-300" />
                                            </div>
                                            <p className="text-gray-400 text-xs font-bold">ক্যানভাস খালি রয়েছে</p>
                                        </div>
                                    )}

                                    {/* Alignment Guides */}
                                    {showGrid && hasCanvas && (
                                        <>
                                            <div className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-red-500/50" style={{ left: CANVAS_W / 2, zIndex: 30 }} />
                                            <div className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-blue-400/50" style={{ left: CANVAS_W * 0.25, zIndex: 30 }} />
                                            <div className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-blue-400/50" style={{ left: CANVAS_W * 0.75, zIndex: 30 }} />
                                            <div className="absolute left-0 right-0 pointer-events-none border-t border-dashed border-green-500/50" style={{ top: CANVAS_H * 0.32, zIndex: 30 }} />
                                            <div className="absolute left-0 right-0 pointer-events-none border-t border-dashed border-green-500/50" style={{ top: CANVAS_H * 0.72, zIndex: 30 }} />
                                        </>
                                    )}

                                    {renderOrder.map(i => {
                                        const img = images[i];
                                        if (!img) return null;
                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    left: Math.round(img.x), top: Math.round(img.y),
                                                    width: Math.round(img.w), height: Math.round(img.h),
                                                    zIndex: selected === i ? 20 : 10,
                                                }}
                                                onMouseDown={e => onPointerDown(e, i)}
                                                onTouchStart={e => onPointerDown(e, i)}
                                                onClick={e => { e.stopPropagation(); setSelected(i); }}
                                            >
                                                <img
                                                    src={img.src}
                                                    alt={`canvas-${i}`}
                                                    draggable={false}
                                                    style={{
                                                        width: '100%', height: '100%', display: 'block', cursor: 'grab',
                                                        filter: selected === i ? 'drop-shadow(0 0 0 1.5px #1e6bd6)' : 'none',
                                                        outline: selected === i ? '1.5px solid #1e6bd6' : 'none',
                                                        outlineOffset: 1,
                                                    }}
                                                />
                                                
                                                {selected === i && ['tl', 'tr', 'bl', 'br'].map(corner => {
                                                    const s = HANDLE_SIZE;
                                                    const pos = {
                                                        tl: { left: -s/2, top: -s/2 }, tr: { right: -s/2, top: -s/2 },
                                                        bl: { left: -s/2, bottom: -s/2 }, br: { right: -s/2, bottom: -s/2 },
                                                    }[corner];
                                                    const cur = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' }[corner];
                                                    return (
                                                        <div
                                                            key={corner}
                                                            style={{
                                                                position: 'absolute', width: s, height: s,
                                                                background: '#ffffff', border: '2px solid #1e6bd6',
                                                                borderRadius: '50%', cursor: cur, zIndex: 30, ...pos,
                                                            }}
                                                            onMouseDown={e => { e.stopPropagation(); onPointerDown(e, i); }}
                                                            onTouchStart={e => { e.stopPropagation(); onPointerDown(e, i); }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <FiInfo className="text-[#1e6bd6] shrink-0 mt-0.5" size={16} />
                        <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                            টিপস: গ্রিড লাইনের সাহায্যে দুইজনের মাথা এবং চোখের লেভেল নিখুঁতভাবে মেলান। সিলেক্ট করা ছবির সাইজ এবং পজিশন কন্ট্রোল প্যানেল থেকে আরও সূক্ষ্মভাবে পরিবর্তন করতে পারবেন।
                        </p>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-extrabold text-gray-800">
                                ছবি ক্রপ করুন — {cropModal.index === 0 ? 'বাম ছবি' : 'ডান ছবি'}
                            </h3>
                            <button onClick={() => setCropModal(null)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="p-5 flex justify-center bg-gray-50 max-h-[50vh] overflow-auto">
                            <ReactCrop crop={crop} onChange={(_, pct) => setCrop(pct)} onComplete={c => setCompletedCrop(c)}>
                                <img ref={cropImgRef} src={cropModal.src} alt="Crop" onLoad={onCropLoad} style={{ maxHeight: '40vh', maxWidth: '100%', borderRadius: 4 }} />
                            </ReactCrop>
                        </div>
                        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
                            <button onClick={() => setCropModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50">বাতিল</button>
                            <button onClick={applyCrop} disabled={!completedCrop} className="flex-1 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] disabled:bg-gray-200 text-white text-xs font-bold flex items-center justify-center gap-2">
                                <FiCheckCircle size={14} /> ক্রপ নিশ্চিত করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
