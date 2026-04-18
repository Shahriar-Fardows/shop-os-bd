"use client";
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
    FiCode, FiDownload, FiPrinter, FiCopy, FiRefreshCw,
    FiAlertCircle, FiWifi, FiUser, FiMessageSquare, FiCheck
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const MODES = [
    { id: 'text', label: 'Text / URL', icon: FiMessageSquare },
    { id: 'wifi', label: 'WiFi', icon: FiWifi },
    { id: 'vcard', label: 'Contact Card', icon: FiUser },
];

const QUICK_PREFIX = [
    { label: 'WhatsApp', prefix: 'https://wa.me/88' },
    { label: 'Phone', prefix: 'tel:+88' },
    { label: 'Website', prefix: 'https://' },
    { label: 'Email', prefix: 'mailto:' },
    { label: 'SMS', prefix: 'sms:+88' },
    { label: 'Facebook', prefix: 'https://facebook.com/' },
];

const wifiString = (w) => `WIFI:T:${w.auth};S:${w.ssid};P:${w.password};${w.hidden ? 'H:true;' : ''};`;
const vcardString = (v) =>
    `BEGIN:VCARD\nVERSION:3.0\nFN:${v.name}\nTEL:${v.phone}\nEMAIL:${v.email}\nORG:${v.org}\nADR:;;${v.address};;;;\nURL:${v.url}\nEND:VCARD`;

export default function QRCodePage() {
    const [mode, setMode] = useState('text');
    const [text, setText] = useState('https://shoposbd.com');
    const [wifi, setWifi] = useState({ ssid: '', password: '', auth: 'WPA', hidden: false });
    const [vcard, setVcard] = useState({ name: '', phone: '', email: '', org: '', address: '', url: '' });

    const [size, setSize] = useState(512);
    const [margin, setMargin] = useState(2);
    const [darkColor, setDarkColor] = useState('#000000');
    const [lightColor, setLightColor] = useState('#ffffff');
    const [ecLevel, setECLevel] = useState('H');

    const [preview, setPreview] = useState(null);

    const payload = (() => {
        if (mode === 'wifi') return wifi.ssid ? wifiString(wifi) : 'WIFI:T:WPA;S:Preview;P:password;;';
        if (mode === 'vcard') return vcardString(vcard);
        return (text || '').trim() || ' ';
    })();

    useEffect(() => {
        let cancelled = false;
        QRCode.toDataURL(payload, {
            width: size,
            margin,
            color: { dark: darkColor, light: lightColor },
            errorCorrectionLevel: ecLevel,
        }).then((url) => { if (!cancelled) setPreview(url); })
          .catch(() => { if (!cancelled) setPreview(null); });
        return () => { cancelled = true; };
    }, [payload, size, margin, darkColor, lightColor, ecLevel]);

    const handleDownload = () => {
        if (!preview) return;
        const a = document.createElement('a');
        a.href = preview;
        a.download = `shoposbd-qr-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handlePrint = () => {
        if (!preview) return;
        const win = window.open('', '_blank');
        if (!win) {
            Swal.fire('Blocked', 'Please allow popups to print.', 'warning');
            return;
        }
        win.document.write(`<!doctype html><html><head><title>Print QR Code</title><style>
            @page { margin: 20mm; }
            html, body { margin: 0; padding: 0; background: #fff; font-family: sans-serif; text-align: center; }
            .wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 95vh; }
            img { max-width: 80%; height: auto; }
            .caption { font-size: 14px; color: #555; margin-top: 12px; word-break: break-all; max-width: 80%; }
        </style></head><body>
            <div class="wrap">
                <img src="${preview}" onload="setTimeout(()=>{window.focus();window.print();}, 120);" />
                <div class="caption">${payload.substring(0, 200)}</div>
            </div>
        </body></html>`);
        win.document.close();
    };

    const handleCopy = async () => {
        try {
            const res = await fetch(preview);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            Swal.fire({
                icon: 'success', title: 'QR Copied!', toast: true,
                position: 'top-end', showConfirmButton: false, timer: 2000
            });
        } catch {
            Swal.fire('Copy failed', 'Clipboard access denied.', 'error');
        }
    };

    return (
        <div className="space-y-8 font-nunito pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">QR Code Generator</h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Professional Shopkeeper Utilities
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                {/* Preview */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Live Preview</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{size} × {size}px</span>
                    </div>

                    <div className="w-full rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[440px] p-8">
                        {preview ? (
                            <img src={preview} alt="QR" className="max-h-[440px] w-auto drop-shadow-sm" />
                        ) : (
                            <div className="text-center">
                                <FiRefreshCw className="animate-spin text-[#1e6bd6] mx-auto mb-2" size={32} />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generating...</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 w-full grid grid-cols-3 gap-3">
                        <button
                            onClick={handleCopy}
                            disabled={!preview}
                            className="bg-blue-50 hover:bg-blue-100 text-[#1e6bd6] py-2.5 rounded-lg font-black uppercase tracking-widest text-sm border border-blue-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <FiCopy /> Copy
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={!preview}
                            className="bg-blue-50 hover:bg-blue-100 text-[#1e6bd6] py-2.5 rounded-lg font-black uppercase tracking-widest text-sm border border-blue-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <FiPrinter /> Print
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!preview}
                            className="bg-[#1e6bd6] hover:bg-[#1656ac] text-white py-2.5 rounded-lg font-black uppercase tracking-widest text-sm shadow-md shadow-blue-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>

                {/* Form Sidebar */}
                <aside className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-5">
                    {/* Mode Tabs */}
                    <div>
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-widest block mb-2">QR Type</span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {MODES.map((m) => {
                                const Icon = m.icon;
                                const isActive = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`py-2.5 rounded-lg text-sm font-extrabold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${isActive ? 'bg-[#1e6bd6] text-white shadow-sm shadow-blue-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Icon size={16} />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Text mode */}
                    {mode === 'text' && (
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest block mb-2">Content</span>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={4}
                                    placeholder="Enter URL, message, phone number..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest block mb-2">Quick Templates</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_PREFIX.map((t) => (
                                        <button
                                            key={t.label}
                                            onClick={() => setText(t.prefix)}
                                            className="px-2.5 py-1.5 rounded text-sm font-extrabold uppercase tracking-widest bg-blue-50 text-[#1e6bd6] border border-blue-100 hover:bg-blue-100 transition-all"
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WiFi mode */}
                    {mode === 'wifi' && (
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">WiFi Credentials</span>
                            <input
                                value={wifi.ssid}
                                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                                placeholder="Network Name (SSID)"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                            />
                            <input
                                type="text"
                                value={wifi.password}
                                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                                placeholder="Password"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <select
                                    value={wifi.auth}
                                    onChange={(e) => setWifi({ ...wifi, auth: e.target.value })}
                                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                                >
                                    <option value="WPA">WPA / WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">No Password</option>
                                </select>
                                <label className="flex items-center gap-2 cursor-pointer px-3">
                                    <input
                                        type="checkbox"
                                        checked={wifi.hidden}
                                        onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                                        className="accent-[#1e6bd6]"
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hidden</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* vCard mode */}
                    {mode === 'vcard' && (
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-1">Contact Information</span>
                            {[
                                { k: 'name', p: 'Full Name' },
                                { k: 'phone', p: 'Phone (+8801...)' },
                                { k: 'email', p: 'Email Address' },
                                { k: 'org', p: 'Organization / Shop' },
                                { k: 'address', p: 'Address' },
                                { k: 'url', p: 'Website URL' },
                            ].map((f) => (
                                <input
                                    key={f.k}
                                    value={vcard[f.k]}
                                    onChange={(e) => setVcard({ ...vcard, [f.k]: e.target.value })}
                                    placeholder={f.p}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                                />
                            ))}
                        </div>
                    )}

                    {/* Design */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Design</span>

                        <div className="flex items-center gap-4 bg-blue-50/60 px-3 py-2.5 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Dark</span>
                                <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-9 h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Light</span>
                                <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-9 h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <button
                                onClick={() => { setDarkColor('#1e6bd6'); setLightColor('#ffffff'); }}
                                className="ml-auto text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest"
                                title="Brand colors"
                            >
                                Brand
                            </button>
                        </div>

                        <div className="flex items-center gap-3 bg-blue-50/60 px-3 py-2.5 rounded-lg border border-blue-100">
                            <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Size</span>
                            <input type="range" min="128" max="1024" step="64" value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1 accent-[#1e6bd6]" />
                            <span className="text-xs font-extrabold text-[#1e6bd6] w-12 text-right">{size}px</span>
                        </div>

                        <div className="flex items-center gap-3 bg-blue-50/60 px-3 py-2.5 rounded-lg border border-blue-100">
                            <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Margin</span>
                            <input type="range" min="0" max="10" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="flex-1 accent-[#1e6bd6]" />
                            <span className="text-xs font-extrabold text-[#1e6bd6] w-8 text-right">{margin}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-blue-50/60 px-3 py-2.5 rounded-lg border border-blue-100">
                            <span className="text-[10px] font-bold text-[#1e6bd6] uppercase tracking-widest">Error Level</span>
                            <div className="flex gap-1 ml-auto">
                                {['L', 'M', 'Q', 'H'].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setECLevel(lvl)}
                                        className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest ${ecLevel === lvl ? 'bg-[#1e6bd6] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Info Footer */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1e6bd6] flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <FiAlertCircle size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Offline QR Protection</h4>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 leading-relaxed">
                        ALL QR CODES ARE GENERATED LOCALLY ON YOUR DEVICE. YOUR DATA NEVER LEAVES THIS BROWSER. HIGHER ERROR-CORRECTION (H) IS PREFERRED FOR PHYSICAL PRINTS TO ENSURE SCANNABILITY.
                    </p>
                </div>
            </div>
        </div>
    );
}
