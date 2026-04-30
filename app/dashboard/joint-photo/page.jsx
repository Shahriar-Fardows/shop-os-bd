"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUpload, FiDownload, FiRefreshCw, FiX, FiMove, FiCrop, FiCheckCircle } from 'react-icons/fi';

const CANVAS_W = 820;
const CANVAS_H = 560;
const HANDLE_SIZE = 10; // resize handle size in logical px

const BG_PRESETS = [
    { label: 'সাদা',    value: '#ffffff' },
    { label: 'নীল',     value: '#4f86c6' },
    { label: 'আসমানি', value: '#87CEEB' },
    { label: 'নেভি',   value: '#1e3a8a' },
    { label: 'কালো',   value: '#111111' },
];

export default function JointPhotoPage() {
    const [images, setImages]     = useState([null, null]);
    const [bgColor, setBgColor]   = useState('#4f86c6');
    const [customBg, setCustomBg] = useState('#4f86c6');
    const [downloading, setDownloading] = useState(false);
    const [selected, setSelected] = useState(null); // index of selected image

    const [displayScale, setDisplayScale] = useState(1);
    const outerRef     = useRef(null);
    const containerRef = useRef(null);
    // interaction ref: { type: 'move'|'resize', index, corner, startX, startY, origX, origY, origW, origH }
    const interaction  = useRef(null);
    const fileRefs     = [useRef(null), useRef(null)];

    // Crop modal
    const [cropModal, setCropModal]         = useState(null);
    const [crop, setCrop]                   = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const cropImgRef = useRef(null);

    // ── displayScale ──────────────────────────────────────────────────────
    useEffect(() => {
        const update = () => {
            if (outerRef.current) {
                setDisplayScale(Math.min(1, outerRef.current.offsetWidth / CANVAS_W));
            }
        };
        update();
        const ro = new ResizeObserver(update);
        if (outerRef.current) ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, []);

    // ── File handling ─────────────────────────────────────────────────────
    const readFile = (file) =>
        new Promise((resolve) => {
            const r = new FileReader();
            r.onload = (e) => resolve(e.target.result);
            r.readAsDataURL(file);
        });

    const placeImage = (src, index, naturalW, naturalH) => {
        // Scale to fill ~45% width of canvas maintaining aspect ratio
        const targetW = Math.round(CANVAS_W * 0.44);
        const scale   = targetW / naturalW;
        const w = targetW;
        const h = Math.round(naturalH * scale);
        const clampedH = Math.min(h, CANVAS_H - 20);
        const clampedW = clampedH < h ? Math.round(w * clampedH / h) : w;

        const x = index === 0
            ? Math.round(CANVAS_W * 0.03)
            : Math.round(CANVAS_W * 0.97 - clampedW);
        const y = Math.round((CANVAS_H - clampedH) / 2);

        setImages(prev => {
            const next = [...prev];
            next[index] = { src, x, y, w: clampedW, h: clampedH, naturalW, naturalH };
            return next;
        });
        setSelected(index);
    };

    const handleFile = async (file, index) => {
        if (!file || !file.type.startsWith('image/')) return;
        const src = await readFile(file);
        const img = new Image();
        img.onload = () => placeImage(src, index, img.naturalWidth, img.naturalHeight);
        img.src = src;
    };

    // ── Pointer helpers ───────────────────────────────────────────────────
    const getLogical = (clientX, clientY) => {
        const rect = containerRef.current.getBoundingClientRect();
        return {
            lx: (clientX - rect.left)  / displayScale,
            ly: (clientY - rect.top)   / displayScale,
        };
    };

    const getClient = (e) => {
        const t = e.touches ? e.touches[0] : e;
        return { clientX: t.clientX, clientY: t.clientY };
    };

    // Determine which handle a pointer hits (in logical coords relative to image top-left)
    const hitHandle = (lx, ly, img) => {
        const corners = {
            'tl': { x: img.x,           y: img.y },
            'tr': { x: img.x + img.w,   y: img.y },
            'bl': { x: img.x,           y: img.y + img.h },
            'br': { x: img.x + img.w,   y: img.y + img.h },
        };
        const hit = HANDLE_SIZE / displayScale; // hit area in logical px
        for (const [corner, pt] of Object.entries(corners)) {
            if (Math.abs(lx - pt.x) <= hit && Math.abs(ly - pt.y) <= hit) return corner;
        }
        return null;
    };

    const onPointerDown = useCallback((e, index) => {
        e.preventDefault();
        e.stopPropagation();
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
            const newX = lx - it.startX;
            const newY = ly - it.startY;
            setImages(prev => {
                const next = [...prev];
                if (!next[it.index]) return prev;
                next[it.index] = { ...next[it.index], x: newX, y: newY };
                return next;
            });
        } else {
            // Resize: maintain aspect ratio while dragging corner
            const { corner, origX, origY, origW, origH } = it;
            const dx = lx - it.startX;
            const dy = ly - it.startY;
            const aspect = origW / origH;
            let newW = origW, newH = origH, newX = origX, newY = origY;

            if (corner === 'br') {
                newW = Math.max(60, origW + dx);
                newH = Math.round(newW / aspect);
            } else if (corner === 'tr') {
                newW = Math.max(60, origW + dx);
                newH = Math.round(newW / aspect);
                newY = origY + origH - newH;
            } else if (corner === 'bl') {
                newW = Math.max(60, origW - dx);
                newH = Math.round(newW / aspect);
                newX = origX + origW - newW;
            } else if (corner === 'tl') {
                newW = Math.max(60, origW - dx);
                newH = Math.round(newW / aspect);
                newX = origX + origW - newW;
                newY = origY + origH - newH;
            }

            setImages(prev => {
                const next = [...prev];
                if (!next[it.index]) return prev;
                next[it.index] = { ...next[it.index], x: newX, y: newY, w: newW, h: newH };
                return next;
            });
        }
    }, [displayScale]);

    const onPointerUp = useCallback(() => { interaction.current = null; }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup',   onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend',  onPointerUp);
        return () => {
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup',   onPointerUp);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend',  onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    // ── Download ─────────────────────────────────────────────────────────
    const handleDownload = async () => {
        if (!images.some(Boolean)) return;
        setDownloading(true);
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width  = CANVAS_W * scale;
        canvas.height = CANVAS_H * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        const loadImg = (src) => new Promise((res, rej) => {
            const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
        });

        for (const img of images) {
            if (!img) continue;
            const el = await loadImg(img.src);
            ctx.drawImage(el, Math.round(img.x), Math.round(img.y), Math.round(img.w), Math.round(img.h));
        }

        const link = document.createElement('a');
        link.download = `joint-photo-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        setDownloading(false);
    };

    // ── Crop ─────────────────────────────────────────────────────────────
    const openCrop = (index) => {
        if (!images[index]) return;
        setCrop(undefined); setCompletedCrop(undefined);
        setCropModal({ index, src: images[index].src });
    };

    const onCropLoad = (e) => {
        const { width, height } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 85 }, 35 / 45, width, height), width, height));
    };

    const applyCrop = async () => {
        if (!completedCrop || !cropImgRef.current) return;
        const img = cropImgRef.current;
        const scaleX = img.naturalWidth  / img.width;
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
        const { index } = cropModal;
        placeImage(croppedSrc, index, canvas.width, canvas.height);
        setCropModal(null);
    };

    const reset = () => { setImages([null, null]); setBgColor('#4f86c6'); setCustomBg('#4f86c6'); setSelected(null); };
    const hasImages = images.some(Boolean);

    return (
        <div className="p-4 lg:p-8 container mx-auto font-nunito">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">জয়েন্ট পাসপোর্ট ফটো</h2>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">ছবি আপলোড → drag করে সাজান → corner টেনে resize করুন → download করুন।</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-400 text-xs font-bold hover:border-red-200 hover:text-red-400 hover:bg-red-50 transition-all">
                        <FiRefreshCw size={14} /> Reset
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!hasImages || downloading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all
                            ${hasImages && !downloading ? 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        <FiDownload size={16} />
                        {downloading ? 'তৈরি হচ্ছে...' : 'Download PNG'}
                    </button>
                </div>
            </div>

            {/* Controls bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="flex flex-wrap gap-6 items-start">
                    {/* Upload zones */}
                    <div className="flex gap-3 flex-wrap">
                        {[0, 1].map(i => (
                            <div key={i} className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ছবি {i + 1}</span>
                                {images[i] ? (
                                    <div
                                        className={`relative group w-28 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selected === i ? 'border-brand' : 'border-gray-100'}`}
                                        onClick={() => setSelected(i)}
                                    >
                                        <img src={images[i].src} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                            <button onClick={e => { e.stopPropagation(); openCrop(i); }} className="w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center hover:bg-brand-hover shadow-md" title="Crop">
                                                <FiCrop size={12} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setImages(p => { const n=[...p]; n[i]=null; return n; }); setSelected(null); }} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[9px] font-black rounded">IMG {i+1}</div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileRefs[i].current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0], i); }}
                                        className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand/50 bg-gray-50 hover:bg-brand/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                                    >
                                        <FiUpload size={16} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-400 font-medium">Upload</span>
                                    </div>
                                )}
                                <input ref={fileRefs[i]} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0], i)} />
                            </div>
                        ))}
                    </div>

                    <div className="w-px bg-gray-100 self-stretch hidden sm:block" />

                    {/* BG Color */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Background</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {BG_PRESETS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => { setBgColor(p.value); setCustomBg(p.value); }}
                                    title={p.label}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${bgColor === p.value ? 'border-brand scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`}
                                    style={{ background: p.value }}
                                />
                            ))}
                            <input type="color" value={customBg} onChange={e => { setCustomBg(e.target.value); setBgColor(e.target.value); }}
                                className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5 hover:scale-105 transition-all" title="Custom রঙ" />
                        </div>
                    </div>

                    {selected !== null && images[selected] && (
                        <>
                            <div className="w-px bg-gray-100 self-stretch hidden sm:block" />
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected: IMG {selected + 1}</span>
                                <div className="flex gap-2 items-center text-xs text-gray-500">
                                    <span className="font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                        {Math.round(images[selected].w)} × {Math.round(images[selected].h)} px
                                    </span>
                                    <button onClick={() => openCrop(selected)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition-all">
                                        <FiCrop size={12} /> Crop
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                    <FiMove size={14} className="text-gray-400" />
                    <span className="text-[11px] text-gray-500 font-medium">Drag করুন সরাতে • Corner টানুন resize করতে</span>
                    <span className="ml-auto text-[10px] text-gray-300 font-mono">{CANVAS_W}×{CANVAS_H}</span>
                </div>

                <div ref={outerRef} className="p-4 flex justify-center" onClick={() => setSelected(null)}>
                    {/* Outer scaled wrapper */}
                    <div style={{ width: CANVAS_W * displayScale, height: CANVAS_H * displayScale, position: 'relative', flexShrink: 0 }}>
                        {/* Inner logical canvas */}
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
                            }}
                        >
                            {!hasImages && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <FiUpload size={28} className="text-white/60" />
                                    </div>
                                    <p className="text-white/70 font-bold text-base">উপরে ছবি আপলোড করুন</p>
                                </div>
                            )}

                            {images.map((img, i) => img && (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: Math.round(img.x),
                                        top:  Math.round(img.y),
                                        width:  Math.round(img.w),
                                        height: Math.round(img.h),
                                    }}
                                    onMouseDown={e => onPointerDown(e, i)}
                                    onTouchStart={e => onPointerDown(e, i)}
                                    onClick={e => { e.stopPropagation(); setSelected(i); }}
                                >
                                    <img
                                        src={img.src}
                                        alt={`photo-${i}`}
                                        draggable={false}
                                        style={{
                                            width: '100%', height: '100%',
                                            display: 'block',
                                            cursor: 'grab',
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            boxShadow: selected === i ? '0 0 0 2px #1e6bd6' : '0 4px 20px rgba(0,0,0,0.2)',
                                        }}
                                    />

                                    {/* Resize handles — show only when selected */}
                                    {selected === i && ['tl','tr','bl','br'].map(corner => {
                                        const s = HANDLE_SIZE;
                                        const posStyle = {
                                            tl: { left: -s/2, top: -s/2 },
                                            tr: { right: -s/2, top: -s/2 },
                                            bl: { left: -s/2, bottom: -s/2 },
                                            br: { right: -s/2, bottom: -s/2 },
                                        }[corner];
                                        const cursor = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize' }[corner];
                                        return (
                                            <div
                                                key={corner}
                                                style={{
                                                    position: 'absolute',
                                                    width: s, height: s,
                                                    background: '#1e6bd6',
                                                    border: '2px solid white',
                                                    borderRadius: 3,
                                                    cursor,
                                                    zIndex: 10,
                                                    ...posStyle,
                                                }}
                                                onMouseDown={e => { e.stopPropagation(); onPointerDown(e, i); }}
                                                onTouchStart={e => { e.stopPropagation(); onPointerDown(e, i); }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                                    <FiCrop size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">Crop — ছবি {cropModal.index + 1}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">crop area টেনে নির্বাচন করুন</p>
                                </div>
                            </div>
                            <button onClick={() => setCropModal(null)} className="w-9 h-9 rounded-xl text-gray-400 hover:bg-gray-100 flex items-center justify-center">
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="p-6 flex justify-center bg-gray-50 max-h-[65vh] overflow-auto">
                            <ReactCrop crop={crop} onChange={(_, pct) => setCrop(pct)} onComplete={c => setCompletedCrop(c)}>
                                <img ref={cropImgRef} src={cropModal.src} alt="Crop" onLoad={onCropLoad}
                                    style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }} />
                            </ReactCrop>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                            <button onClick={() => setCropModal(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all">
                                বাতিল
                            </button>
                            <button onClick={applyCrop} disabled={!completedCrop}
                                className={`flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all
                                    ${completedCrop ? 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                <FiCheckCircle size={16} /> Crop প্রয়োগ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
