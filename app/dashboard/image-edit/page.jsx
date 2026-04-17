"use client";
import React, { useState, useRef, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    FiUpload, FiDownload, FiTrash2, FiScissors, FiLoader, FiZap,
    FiAlertCircle, FiCrop, FiDroplet, FiCheck, FiX, FiRotateCcw,
    FiEdit3, FiRotateCw, FiMaximize2, FiSliders, FiImage, FiRefreshCw
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// ---------------- helpers ----------------
const blobToDataURL = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const PRESET_COLORS = ['#ffffff', '#1e6bd6', '#000000', '#f3f4f6', '#fef3c7', '#dcfce7', '#fee2e2', '#e0e7ff'];

export default function ImageEditPage() {
    const [currentImage, setCurrentImage] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTool, setActiveTool] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Crop
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const cropImgRef = useRef(null);

    // Eraser
    const eraserCanvasRef = useRef(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef(null);
    const [brushSize, setBrushSize] = useState(40);

    // BG Change
    const [bgColor, setBgColor] = useState('#ffffff');
    const [bgImage, setBgImage] = useState(null);
    const [bgMode, setBgMode] = useState('color'); // 'color' | 'image'

    // Adjust
    const [adjust, setAdjust] = useState({ brightness: 100, contrast: 100, saturate: 100 });

    // Resize
    const [size, setSize] = useState({ w: 0, h: 0, lock: true });
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

    // ---------------- state helpers ----------------
    const pushImage = (next) => {
        setHistory((h) => [...h, currentImage]);
        setCurrentImage(next);
    };

    const undo = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setCurrentImage(prev);
        setHistory((h) => h.slice(0, -1));
    };

    const reset = () => {
        setCurrentImage(null);
        setHistory([]);
        setActiveTool(null);
        setProgress(0);
        setBgImage(null);
    };

    // Keep natural size synced with current image
    useEffect(() => {
        if (!currentImage) return;
        loadImage(currentImage).then((img) => {
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            setSize((s) => ({ ...s, w: img.naturalWidth, h: img.naturalHeight }));
        });
    }, [currentImage]);

    const handleFileSelect = async (e) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        if (file.size > 10 * 1024 * 1024) {
            return Swal.fire('File too large', 'Please upload an image smaller than 10MB', 'error');
        }
        const dataUrl = await blobToDataURL(file);
        setCurrentImage(dataUrl);
        setHistory([]);
        setActiveTool(null);
        setAdjust({ brightness: 100, contrast: 100, saturate: 100 });
    };

    // ---------------- BG Remove ----------------
    const runBgRemove = async () => {
        if (!currentImage) return;
        setIsProcessing(true);
        setProgress(0);
        try {
            const blob = await removeBackground(currentImage, {
                progress: (...args) => {
                    if (args.length >= 3 && typeof args[2] === 'number' && args[2] > 0) {
                        setProgress(Math.round((args[1] / args[2]) * 100));
                    } else if (typeof args[0] === 'number') {
                        setProgress(Math.round(args[0] * 100));
                    }
                },
                debug: false,
                model: 'medium'
            });
            const dataUrl = await blobToDataURL(blob);
            pushImage(dataUrl);
            setActiveTool(null);
            Swal.fire({
                icon: 'success', title: 'Background Removed!', toast: true,
                position: 'top-end', showConfirmButton: false, timer: 2500
            });
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Background removal failed. Please try a clearer image.', 'error');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    // ---------------- Crop ----------------
    const onCropImageLoad = (e) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 80 }, w / h, w, h), w, h));
    };

    const applyCrop = async () => {
        if (!completedCrop || !cropImgRef.current) return;
        const img = cropImgRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(completedCrop.width * scaleX);
        canvas.height = Math.round(completedCrop.height * scaleY);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0, 0, canvas.width, canvas.height
        );
        pushImage(canvas.toDataURL('image/png'));
        setActiveTool(null);
    };

    // ---------------- Eraser ----------------
    useEffect(() => {
        if (activeTool !== 'erase' || !currentImage) return;
        const canvas = eraserCanvasRef.current;
        if (!canvas) return;
        let cancelled = false;
        loadImage(currentImage).then((img) => {
            if (cancelled) return;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        });
        return () => { cancelled = true; };
    }, [activeTool, currentImage]);

    const getCanvasPoint = (e) => {
        const canvas = eraserCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startErase = (e) => {
        e.preventDefault();
        eraserCanvasRef.current.setPointerCapture?.(e.pointerId);
        drawingRef.current = true;
        const p = getCanvasPoint(e);
        lastPointRef.current = p;
        const ctx = eraserCanvasRef.current.getContext('2d');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(p.x, p.y, brushSize, 0, Math.PI * 2);
        ctx.fill();
    };

    const moveErase = (e) => {
        if (!drawingRef.current) return;
        const p = getCanvasPoint(e);
        const ctx = eraserCanvasRef.current.getContext('2d');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize * 2;
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        lastPointRef.current = p;
    };

    const endErase = () => { drawingRef.current = false; };

    const applyErase = () => {
        const canvas = eraserCanvasRef.current;
        if (!canvas) return;
        pushImage(canvas.toDataURL('image/png'));
        setActiveTool(null);
    };

    // ---------------- BG Change ----------------
    const handleBgImageUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        const dataUrl = await blobToDataURL(e.target.files[0]);
        setBgImage(dataUrl);
        setBgMode('image');
    };

    const applyBackground = async () => {
        if (!currentImage) return;
        const img = await loadImage(currentImage);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (bgMode === 'image' && bgImage) {
            const bg = await loadImage(bgImage);
            // cover-fit
            const ratio = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
            const bw = bg.naturalWidth * ratio;
            const bh = bg.naturalHeight * ratio;
            ctx.drawImage(bg, (canvas.width - bw) / 2, (canvas.height - bh) / 2, bw, bh);
        } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        pushImage(canvas.toDataURL('image/png'));
        setActiveTool(null);
    };

    // ---------------- Rotate / Flip ----------------
    const rotate = async (deg) => {
        if (!currentImage) return;
        const img = await loadImage(currentImage);
        const canvas = document.createElement('canvas');
        const rad = (deg * Math.PI) / 180;
        if (Math.abs(deg) === 90 || Math.abs(deg) === 270) {
            canvas.width = img.naturalHeight;
            canvas.height = img.naturalWidth;
        } else {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
        }
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        pushImage(canvas.toDataURL('image/png'));
    };

    const flip = async (axis) => {
        if (!currentImage) return;
        const img = await loadImage(currentImage);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (axis === 'h') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
        else { ctx.translate(0, canvas.height); ctx.scale(1, -1); }
        ctx.drawImage(img, 0, 0);
        pushImage(canvas.toDataURL('image/png'));
    };

    // ---------------- Adjust ----------------
    const applyAdjust = async () => {
        if (!currentImage) return;
        const img = await loadImage(currentImage);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturate}%)`;
        ctx.drawImage(img, 0, 0);
        pushImage(canvas.toDataURL('image/png'));
        setAdjust({ brightness: 100, contrast: 100, saturate: 100 });
        setActiveTool(null);
    };

    const resetAdjust = () => setAdjust({ brightness: 100, contrast: 100, saturate: 100 });

    // ---------------- Resize ----------------
    const updateSize = (key, val) => {
        val = Math.max(1, parseInt(val || 0));
        setSize((s) => {
            if (!s.lock || !naturalSize.w || !naturalSize.h) return { ...s, [key]: val };
            const ratio = naturalSize.w / naturalSize.h;
            return key === 'w'
                ? { ...s, w: val, h: Math.round(val / ratio) }
                : { ...s, h: val, w: Math.round(val * ratio) };
        });
    };

    const applyResize = async () => {
        if (!currentImage) return;
        const img = await loadImage(currentImage);
        const canvas = document.createElement('canvas');
        canvas.width = size.w;
        canvas.height = size.h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size.w, size.h);
        pushImage(canvas.toDataURL('image/png'));
        setActiveTool(null);
    };

    // ---------------- Download ----------------
    const handleDownload = () => {
        if (!currentImage) return;
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `shoposbd-edited-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ---------------- Tools list ----------------
    const tools = [
        { id: 'crop', label: 'Crop', icon: FiCrop },
        { id: 'bg-remove', label: 'BG Remove', icon: FiScissors },
        { id: 'bg-change', label: 'BG Change', icon: FiDroplet },
        { id: 'erase', label: 'Eraser', icon: FiEdit3 },
        { id: 'rotate', label: 'Rotate & Flip', icon: FiRotateCw },
        { id: 'adjust', label: 'Adjust', icon: FiSliders },
        { id: 'resize', label: 'Resize', icon: FiMaximize2 },
    ];

    const previewStyle = activeTool === 'adjust'
        ? { filter: `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturate}%)` }
        : {};

    const activeLabel = {
        'crop': 'Select Crop Area',
        'erase': 'Paint To Erase',
        'bg-change': 'Preview With New Background',
        'bg-remove': 'AI Background Removal',
        'rotate': 'Rotate & Flip Image',
        'adjust': 'Adjust Colors',
        'resize': 'Resize Canvas',
    }[activeTool] || 'Canvas Preview';

    return (
        <div className="space-y-8 font-nunito pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">AI Image Editor</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Crop · Cut · Erase · Adjust · Transform</p>
                </div>
                <div className="flex items-center gap-4">
                    {currentImage && history.length > 0 && !activeTool && (
                        <button
                            onClick={undo}
                            className="text-gray-500 hover:text-[#1e6bd6] font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            <FiRotateCcw /> Undo
                        </button>
                    )}
                    {currentImage && !isProcessing && (
                        <button
                            onClick={reset}
                            className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            <FiTrash2 /> Reset Canvas
                        </button>
                    )}
                </div>
            </div>

            {!currentImage ? (
                /* Upload Zone */
                <div className="bg-white rounded-2xl border-2 border-dashed border-blue-100 p-20 flex flex-col items-center justify-center text-center group hover:border-[#1e6bd6] hover:bg-blue-50/30 transition-all cursor-pointer relative overflow-hidden shadow-sm">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleFileSelect}
                    />
                    <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center text-[#1e6bd6] mb-6 group-hover:scale-110 transition-transform shadow-sm border border-blue-100">
                        <FiUpload size={28} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Upload Your Image</h3>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Supports PNG, JPG (Max 10MB)</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                    {/* Canvas Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{activeLabel}</span>
                            {naturalSize.w > 0 && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{naturalSize.w} × {naturalSize.h}</span>
                            )}
                        </div>

                        <div className="w-full rounded-xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-gray-50 border border-gray-100 relative flex items-center justify-center min-h-[440px]">
                            {/* Crop mode */}
                            {activeTool === 'crop' && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, pct) => setCrop(pct)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                >
                                    <img
                                        ref={cropImgRef}
                                        src={currentImage}
                                        alt="Crop"
                                        onLoad={onCropImageLoad}
                                        className="max-h-[540px] w-auto object-contain"
                                    />
                                </ReactCrop>
                            )}

                            {/* Erase mode */}
                            {activeTool === 'erase' && (
                                <canvas
                                    ref={eraserCanvasRef}
                                    onPointerDown={startErase}
                                    onPointerMove={moveErase}
                                    onPointerUp={endErase}
                                    onPointerLeave={endErase}
                                    className="max-h-[540px] max-w-full object-contain touch-none cursor-crosshair"
                                />
                            )}

                            {/* BG Change preview */}
                            {activeTool === 'bg-change' && (
                                <div
                                    className="w-full h-full min-h-[440px] flex items-center justify-center p-4 relative overflow-hidden"
                                    style={bgMode === 'image' && bgImage
                                        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : { backgroundColor: bgColor }}
                                >
                                    <img src={currentImage} alt="Preview" className="max-h-[500px] object-contain relative z-10" />
                                </div>
                            )}

                            {/* Default / BG Remove / Rotate / Adjust / Resize */}
                            {(!activeTool || activeTool === 'bg-remove' || activeTool === 'rotate' || activeTool === 'adjust' || activeTool === 'resize') && (
                                <>
                                    <img
                                        src={currentImage}
                                        alt="Current"
                                        style={previewStyle}
                                        className="max-h-[540px] object-contain"
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                                            <FiLoader className="text-[#1e6bd6] animate-spin mb-4" size={44} />
                                            <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest">AI Is Cutting</h4>
                                            <div className="w-64 bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                                                <div className="bg-[#1e6bd6] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-[#1e6bd6] mt-3 uppercase tracking-widest">{progress}% Processed</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Tool-specific controls */}
                        {activeTool && (
                            <div className="mt-6 w-full space-y-4">
                                {/* Erase controls */}
                                {activeTool === 'erase' && (
                                    <div className="flex items-center gap-4 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-100">
                                        <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Brush Size</span>
                                        <input
                                            type="range" min="5" max="150"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(Number(e.target.value))}
                                            className="flex-1 accent-[#1e6bd6]"
                                        />
                                        <span className="text-xs font-extrabold text-[#1e6bd6] w-10 text-right">{brushSize}px</span>
                                    </div>
                                )}

                                {/* BG Change controls */}
                                {activeTool === 'bg-change' && (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setBgMode('color')}
                                                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all ${bgMode === 'color' ? 'bg-[#1e6bd6] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <FiDroplet className="inline mr-2" /> Color
                                            </button>
                                            <button
                                                onClick={() => setBgMode('image')}
                                                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all ${bgMode === 'image' ? 'bg-[#1e6bd6] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <FiImage className="inline mr-2" /> Image
                                            </button>
                                        </div>

                                        {bgMode === 'color' ? (
                                            <div className="flex items-center gap-4 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-100">
                                                <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Pick</span>
                                                <input
                                                    type="color"
                                                    value={bgColor}
                                                    onChange={(e) => setBgColor(e.target.value)}
                                                    className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
                                                />
                                                <div className="flex gap-1.5">
                                                    {PRESET_COLORS.map((c) => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setBgColor(c)}
                                                            className={`w-7 h-7 rounded border-2 transition-all ${bgColor === c ? 'border-[#1e6bd6] scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 uppercase ml-auto">{bgColor}</span>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-3 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50">
                                                <FiUpload className="text-[#1e6bd6]" />
                                                <span className="text-[11px] font-extrabold text-[#1e6bd6] uppercase tracking-widest">{bgImage ? 'Replace Background Image' : 'Upload Background Image'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                )}

                                {/* Rotate & Flip controls */}
                                {activeTool === 'rotate' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button onClick={() => rotate(-90)} className="px-3 py-3 rounded-lg text-[11px] font-extrabold uppercase tracking-widest bg-blue-50 text-[#1e6bd6] hover:bg-[#1e6bd6] hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-100">
                                            <FiRotateCcw /> 90° Left
                                        </button>
                                        <button onClick={() => rotate(90)} className="px-3 py-3 rounded-lg text-[11px] font-extrabold uppercase tracking-widest bg-blue-50 text-[#1e6bd6] hover:bg-[#1e6bd6] hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-100">
                                            <FiRotateCw /> 90° Right
                                        </button>
                                        <button onClick={() => flip('h')} className="px-3 py-3 rounded-lg text-[11px] font-extrabold uppercase tracking-widest bg-blue-50 text-[#1e6bd6] hover:bg-[#1e6bd6] hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-100">
                                            Flip H ↔
                                        </button>
                                        <button onClick={() => flip('v')} className="px-3 py-3 rounded-lg text-[11px] font-extrabold uppercase tracking-widest bg-blue-50 text-[#1e6bd6] hover:bg-[#1e6bd6] hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-100">
                                            Flip V ↕
                                        </button>
                                    </div>
                                )}

                                {/* Adjust controls */}
                                {activeTool === 'adjust' && (
                                    <div className="space-y-3">
                                        {[
                                            { key: 'brightness', label: 'Brightness' },
                                            { key: 'contrast', label: 'Contrast' },
                                            { key: 'saturate', label: 'Saturation' },
                                        ].map((f) => (
                                            <div key={f.key} className="flex items-center gap-4 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-100">
                                                <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest w-24">{f.label}</span>
                                                <input
                                                    type="range" min="0" max="200"
                                                    value={adjust[f.key]}
                                                    onChange={(e) => setAdjust((a) => ({ ...a, [f.key]: Number(e.target.value) }))}
                                                    className="flex-1 accent-[#1e6bd6]"
                                                />
                                                <span className="text-xs font-extrabold text-[#1e6bd6] w-10 text-right">{adjust[f.key]}%</span>
                                            </div>
                                        ))}
                                        <button onClick={resetAdjust} className="text-[10px] font-bold text-gray-500 hover:text-[#1e6bd6] uppercase tracking-widest flex items-center gap-2">
                                            <FiRefreshCw size={12} /> Reset Adjustments
                                        </button>
                                    </div>
                                )}

                                {/* Resize controls */}
                                {activeTool === 'resize' && (
                                    <div className="flex items-end gap-3 bg-blue-50/60 px-4 py-3 rounded-xl border border-blue-100">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest mb-1">Width</label>
                                            <input
                                                type="number" min="1"
                                                value={size.w}
                                                onChange={(e) => updateSize('w', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm font-bold text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest mb-1">Height</label>
                                            <input
                                                type="number" min="1"
                                                value={size.h}
                                                onChange={(e) => updateSize('h', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-blue-100 bg-white text-sm font-bold text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 pb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={size.lock}
                                                onChange={(e) => setSize((s) => ({ ...s, lock: e.target.checked }))}
                                                className="accent-[#1e6bd6]"
                                            />
                                            <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Lock Ratio</span>
                                        </label>
                                    </div>
                                )}

                                {/* Action row */}
                                <div className="flex gap-2 justify-end pt-1">
                                    <button
                                        onClick={() => { setActiveTool(null); resetAdjust(); }}
                                        disabled={isProcessing}
                                        className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 transition-all"
                                    >
                                        <FiX /> Cancel
                                    </button>

                                    {activeTool === 'crop' && (
                                        <button onClick={applyCrop} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 transition-all">
                                            <FiCheck /> Apply Crop
                                        </button>
                                    )}
                                    {activeTool === 'bg-remove' && (
                                        <button onClick={runBgRemove} disabled={isProcessing} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 disabled:opacity-60 transition-all">
                                            <FiZap /> {isProcessing ? 'Processing...' : 'Start AI Removal'}
                                        </button>
                                    )}
                                    {activeTool === 'bg-change' && (
                                        <button onClick={applyBackground} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 transition-all">
                                            <FiCheck /> Apply Background
                                        </button>
                                    )}
                                    {activeTool === 'erase' && (
                                        <button onClick={applyErase} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 transition-all">
                                            <FiCheck /> Save Erase
                                        </button>
                                    )}
                                    {activeTool === 'adjust' && (
                                        <button onClick={applyAdjust} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 transition-all">
                                            <FiCheck /> Apply Adjustments
                                        </button>
                                    )}
                                    {activeTool === 'resize' && (
                                        <button onClick={applyResize} className="px-5 py-3 rounded-lg font-extrabold uppercase tracking-widest text-xs text-white bg-[#1e6bd6] hover:bg-[#1656ac] flex items-center gap-2 shadow-sm shadow-blue-100 transition-all">
                                            <FiCheck /> Apply Resize
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!activeTool && (
                            <button
                                onClick={handleDownload}
                                className="mt-6 w-full bg-[#1e6bd6] hover:bg-[#1656ac] text-white py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs shadow-sm shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                            >
                                <FiDownload /> Download Image
                            </button>
                        )}
                    </div>

                    {/* Tool Sidebar */}
                    <aside className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="px-2 mb-3">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Tools</span>
                        </div>
                        <div className="space-y-1">
                            {tools.map((t) => {
                                const Icon = t.icon;
                                const isActive = activeTool === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTool(t.id)}
                                        disabled={isProcessing}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left disabled:opacity-50 ${
                                            isActive
                                                ? 'bg-blue-50 text-[#1e6bd6] font-bold shadow-sm shadow-blue-50'
                                                : 'text-gray-500 hover:bg-gray-50 font-medium'
                                        }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-[#1e6bd6]' : 'text-gray-400'} />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="px-2 mb-2">
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">File</span>
                            </div>
                            <label className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 font-medium cursor-pointer transition-all">
                                <FiUpload size={18} className="text-gray-400" />
                                <span>Replace Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </label>
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 font-medium transition-all"
                            >
                                <FiDownload size={18} className="text-gray-400" />
                                <span>Download PNG</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Info Footer */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <FiAlertCircle size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-extrabold text-gray-800 tracking-tight">Privacy Protected AI</h4>
                    <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">
                        This editor runs entirely in your browser. Your images are never uploaded to any server — all editing happens locally on your computer for maximum security and privacy.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                .ReactCrop__crop-selection {
                    border-color: #1e6bd6;
                }
                .ReactCrop__drag-handle::after {
                    background-color: #1e6bd6;
                    border-color: #ffffff;
                }
            `}</style>
        </div>
    );
}
