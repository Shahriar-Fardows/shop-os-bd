"use client";
import { useState, useRef } from 'react';
import {
    FiPrinter, FiDownload, FiUpload, FiUser, FiHash, FiMapPin, FiPhone,
    FiCalendar, FiBriefcase, FiImage, FiRefreshCw
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const BLANK = {
    orgName: 'ShopOS BD',
    orgTagline: 'Employee Identification Card',
    cardType: 'Employee',
    fullName: '',
    designation: '',
    idNumber: '',
    dateOfBirth: '',
    bloodGroup: '',
    phone: '',
    address: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    photoDataUrl: '',
    primaryColor: '#1e6bd6',
};

const CARD_TYPES = ['Employee', 'Student', 'Visitor', 'Member', 'Staff'];

export default function IdCardMakerPage() {
    const [card, setCard] = useState(BLANK);
    const [side, setSide] = useState('front');
    const printRef = useRef(null);

    const update = (key, val) => setCard(c => ({ ...c, [key]: val }));

    const onPhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => update('photoDataUrl', reader.result);
        reader.readAsDataURL(file);
    };

    const handlePrint = () => {
        if (!card.fullName) {
            Swal.fire('Incomplete', 'অন্তত নাম দিন।', 'warning');
            return;
        }
        window.print();
    };

    const handleReset = () => {
        Swal.fire({
            title: 'Reset card?',
            text: 'All fields will be cleared.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'Yes, reset',
        }).then(r => r.isConfirmed && setCard(BLANK));
    };

    return (
        <div className="space-y-6 font-nunito pb-12">
            {/* Print-only CSS — hide chrome, show only the card */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #id-card-print, #id-card-print * { visibility: visible; }
                    #id-card-print {
                        position: absolute;
                        top: 0; left: 0;
                        margin: 0;
                        padding: 24px;
                        width: 100%;
                    }
                    #id-card-print .card-row {
                        display: flex !important;
                        gap: 20px;
                        justify-content: center;
                        page-break-inside: avoid;
                    }
                    @page { size: A4; margin: 10mm; }
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        ID Card <span className="text-[#1e6bd6]">Maker</span>
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Create printable employee / student / visitor ID cards
                    </p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <button onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-extrabold uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <FiRefreshCw size={13} /> Reset
                    </button>
                    <button onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100 transition-all">
                        <FiPrinter size={13} /> Print / Save PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* FORM */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 print:hidden">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization Name</label>
                            <input value={card.orgName} onChange={e => update('orgName', e.target.value)}
                                   className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tagline / Card Title</label>
                            <input value={card.orgTagline} onChange={e => update('orgTagline', e.target.value)}
                                   className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                                <select value={card.cardType} onChange={e => update('cardType', e.target.value)}
                                        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold focus:border-[#1e6bd6] outline-none">
                                    {CARD_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Color</label>
                                <input type="color" value={card.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                                       className="mt-1 w-full h-[42px] rounded-lg border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name *</label>
                            <input value={card.fullName} onChange={e => update('fullName', e.target.value)}
                                   placeholder="Md. Karim Uddin"
                                   className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</label>
                                <input value={card.designation} onChange={e => update('designation', e.target.value)}
                                       placeholder="e.g. Sales Executive"
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Number</label>
                                <input value={card.idNumber} onChange={e => update('idNumber', e.target.value)}
                                       placeholder="EMP-00123"
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold focus:border-[#1e6bd6] outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
                                <input type="date" value={card.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)}
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Blood Group</label>
                                <input value={card.bloodGroup} onChange={e => update('bloodGroup', e.target.value)}
                                       placeholder="B+"
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold focus:border-[#1e6bd6] outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                            <input value={card.phone} onChange={e => update('phone', e.target.value)}
                                   placeholder="01XXXXXXXXX"
                                   className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                            <input value={card.address} onChange={e => update('address', e.target.value)}
                                   placeholder="Village, Upazila, District"
                                   className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Date</label>
                                <input type="date" value={card.issueDate} onChange={e => update('issueDate', e.target.value)}
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiry Date</label>
                                <input type="date" value={card.expiryDate} onChange={e => update('expiryDate', e.target.value)}
                                       className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1e6bd6] outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photo</label>
                        <label className="mt-2 flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1e6bd6] hover:bg-blue-50/30 transition-all">
                            {card.photoDataUrl ? (
                                <img src={card.photoDataUrl} alt="preview" className="w-20 h-24 object-cover rounded-lg" />
                            ) : (
                                <>
                                    <FiUpload size={24} className="text-gray-300" />
                                    <span className="text-xs font-bold text-gray-400">Click to upload passport photo</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-center gap-2 mb-4 print:hidden">
                        <button onClick={() => setSide('front')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
                                    side === 'front'
                                        ? 'bg-[#1e6bd6] text-white border-[#1e6bd6]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}>
                            Front
                        </button>
                        <button onClick={() => setSide('back')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
                                    side === 'back'
                                        ? 'bg-[#1e6bd6] text-white border-[#1e6bd6]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}>
                            Back
                        </button>
                    </div>

                    <div id="id-card-print" ref={printRef} className="flex justify-center">
                        <div className="card-row flex gap-6 justify-center">
                            {/* FRONT */}
                            <div
                                className={`${side === 'back' ? 'hidden print:block' : ''} rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white`}
                                style={{ width: '320px', height: '510px' }}
                            >
                                <div className="h-3" style={{ background: card.primaryColor }} />
                                <div className="px-5 pt-5 text-center">
                                    <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: card.primaryColor }}>
                                        {card.orgName || 'Organization'}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-500 mt-0.5 uppercase tracking-widest">
                                        {card.orgTagline || 'ID Card'}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-center">
                                    <div className="w-28 h-32 rounded-xl bg-gray-100 border-2 overflow-hidden flex items-center justify-center"
                                         style={{ borderColor: card.primaryColor }}>
                                        {card.photoDataUrl ? (
                                            <img src={card.photoDataUrl} alt="photo" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser size={42} className="text-gray-300" />
                                        )}
                                    </div>
                                </div>
                                <div className="px-5 mt-4 text-center">
                                    <p className="text-base font-extrabold text-gray-900 leading-tight">{card.fullName || 'Full Name'}</p>
                                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">{card.designation || 'Designation'}</p>
                                    <div className="mt-2 inline-block text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                                         style={{ background: card.primaryColor }}>
                                        {card.cardType}
                                    </div>
                                </div>
                                <div className="px-5 mt-4 space-y-1.5 text-[11px] font-semibold text-gray-700">
                                    {card.idNumber && <div className="flex items-center gap-2"><FiHash size={11} className="text-gray-400" /> ID: <b>{card.idNumber}</b></div>}
                                    {card.bloodGroup && <div className="flex items-center gap-2"><span className="text-red-500 font-extrabold">♥</span> Blood: <b>{card.bloodGroup}</b></div>}
                                    {card.phone && <div className="flex items-center gap-2"><FiPhone size={11} className="text-gray-400" /> {card.phone}</div>}
                                </div>
                                <div className="mt-4 px-5 pb-4 border-t border-gray-100 pt-3 flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Signature</p>
                                        <div className="mt-6 w-24 h-px bg-gray-300" />
                                    </div>
                                    {card.expiryDate && (
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Valid Till</p>
                                            <p className="text-[10px] font-extrabold text-gray-700 mt-0.5">{card.expiryDate}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BACK */}
                            <div
                                className={`${side === 'front' ? 'hidden print:block' : ''} rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white`}
                                style={{ width: '320px', height: '510px' }}
                            >
                                <div className="h-3" style={{ background: card.primaryColor }} />
                                <div className="p-5 space-y-3">
                                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-center" style={{ color: card.primaryColor }}>
                                        Holder Information
                                    </p>
                                    <div className="border-t border-gray-100 pt-3 space-y-2 text-[11px]">
                                        <Row icon={<FiUser size={11} />}     label="Name"     value={card.fullName} />
                                        <Row icon={<FiBriefcase size={11} />} label="Role"     value={card.designation} />
                                        <Row icon={<FiHash size={11} />}      label="ID No"    value={card.idNumber} />
                                        <Row icon={<FiCalendar size={11} />}  label="DOB"      value={card.dateOfBirth} />
                                        <Row icon={<FiPhone size={11} />}     label="Phone"    value={card.phone} />
                                        <Row icon={<FiMapPin size={11} />}    label="Address"  value={card.address} />
                                        <Row icon={<FiCalendar size={11} />}  label="Issued"   value={card.issueDate} />
                                        <Row icon={<FiCalendar size={11} />}  label="Expires"  value={card.expiryDate} />
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 text-[9px] font-semibold text-gray-500 leading-relaxed">
                                        This card is the property of <b>{card.orgName || 'the organization'}</b>. If found, kindly return to the address below.
                                    </div>
                                    <div className="text-center mt-4">
                                        <div className="inline-block w-20 h-20 bg-gradient-to-br from-gray-100 to-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <FiImage size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">QR (optional)</p>
                                    </div>
                                </div>
                                <div className="px-5 pb-3 pt-2 text-center border-t border-gray-100">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Powered by ShopOS BD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">{icon}</span>
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest w-14 shrink-0">{label}</span>
            <span className="font-semibold text-gray-700 flex-1 break-words">{value}</span>
        </div>
    );
}
