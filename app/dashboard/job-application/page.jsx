"use client";
import { useState, useEffect, useMemo } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiPhone, FiSave, FiX,
    FiZap, FiLoader, FiRefreshCw, FiCopy, FiDownload, FiUploadCloud
} from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

/* ═══════════════════════════════════════════════════════════════════
   Form schema — maps 1:1 with server JobApplication model
═══════════════════════════════════════════════════════════════════ */

const SELECT_OPTIONS = {
    religion:       ['', 'Islam', 'Hindu', 'Christian', 'Buddhist', 'Other'],
    gender:         ['', 'Male', 'Female', 'Other'],
    marital_status: ['', 'Single', 'Married', 'Divorced', 'Widowed'],
    quota:          ['Not Applicable', 'Freedom Fighter', 'Female', 'Tribal', 'Disabled', 'Ansar/VDP', 'Orphan'],
    dep_status:     ['', 'Self-Employed', 'Employed', 'Unemployed', 'Student'],
    nid:            ['No', 'Yes'],
    breg:           ['No', 'Yes'],
    passport:       ['No', 'Yes'],
    ssc_exam:       ['', 'SSC', 'Dakhil', 'SSC (Vocational)', 'O Level'],
    ssc_board:      ['', 'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Comilla', 'Jessore', 'Dinajpur', 'Mymensingh', 'Madrasah', 'Technical'],
    ssc_group:      ['', 'Science', 'Humanities', 'Business Studies', 'Vocational'],
    ssc_result_type:['', 'GPA (Out of 5)', 'Division', 'CGPA'],
    hsc_exam:       ['', 'HSC', 'Alim', 'HSC (Vocational)', 'A Level', 'Diploma'],
    hsc_board:      ['', 'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Comilla', 'Jessore', 'Dinajpur', 'Mymensingh', 'Madrasah', 'Technical'],
    hsc_group:      ['', 'Science', 'Humanities', 'Business Studies', 'Vocational'],
    hsc_result_type:['', 'GPA (Out of 5)', 'Division', 'CGPA'],
    gra_exam:       ['', 'B.Sc', 'B.A', 'B.Com', 'BBA', 'B.Ed', 'LLB', 'MBBS', 'Honours', 'Pass'],
    gra_result_type:['', 'CGPA (Out of 4)', 'CGPA (Out of 5)', 'Division', 'Class'],
    mas_exam:       ['M.Sc', 'M.A', 'M.Com', 'MBA', 'M.Ed', 'LLM', 'Masters'],
    mas_result_type:['', 'CGPA (Out of 4)', 'CGPA (Out of 5)', 'Division', 'Class'],
};

const BLANK = {
    mobile: '', name: '', name_bn: '', father: '', father_bn: '', mother: '', mother_bn: '',
    dob: '', religion: '', gender: '', marital_status: '', spouse_name: '',
    quota: 'Not Applicable', dep_status: '',
    nid: 'No', nid_no: '', breg: 'No', breg_no: '', passport: 'No', passport_no: '',
    email: '',
    present_careof: '', present_village: '', present_district: '', present_upazila: '', present_post: '', present_postcode: '',
    is_permanent_same: '0',
    permanent_careof: '', permanent_village: '', permanent_district: '', permanent_upazila: '', permanent_post: '', permanent_postcode: '',
    ssc_exam: '', ssc_board: '', ssc_roll: '', ssc_group: '', ssc_year: '', ssc_result_type: '', ssc_result: '',
    hsc_exam: '', hsc_board: '', hsc_roll: '', hsc_group: '', hsc_year: '', hsc_result_type: '', hsc_result: '',
    gra_exam: '', gra_subject: '', gra_institute: '', gra_year: '', gra_duration: '', gra_result_type: '', gra_result: '',
    mas_exam: '', mas_subject: '', mas_institute: '', mas_year: '', mas_duration: '', mas_result_type: '', mas_result: '',
};

/* ═══════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════ */

export default function JobApplicationPage() {
    const api = useAxios();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null); // null | BLANK | applicant obj
    const [saving, setSaving] = useState(false);
    const [aiBusy, setAiBusy] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/job-application');
            setList(res.data?.data || []);
        } catch (e) { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return list.filter(a =>
            (a.mobile || '').toLowerCase().includes(q) ||
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q)
        );
    }, [list, search]);

    const openNew = () => setEditing({ ...BLANK });
    const openEdit = (row) => setEditing({ ...BLANK, ...row });
    const closeForm = () => setEditing(null);

    const save = async () => {
        if (!editing.mobile?.trim()) {
            Swal.fire('Required', 'Mobile (Unique ID) is required.', 'warning');
            return;
        }
        setSaving(true);
        try {
            if (editing._id) {
                await api.patch(`/job-application/${editing._id}`, editing);
            } else {
                await api.post('/job-application', editing);
            }
            await load();
            Swal.fire({ icon: 'success', title: 'Saved', toast: true, position: 'top-end', showConfirmButton: false, timer: 1600 });
            setEditing(null);
        } catch (e) {
            Swal.fire('Error', e.response?.data?.message || 'সেভ হয়নি', 'error');
        }
        setSaving(false);
    };

    const remove = async (row) => {
        const r = await Swal.fire({
            icon: 'warning',
            title: 'Delete applicant?',
            text: `${row.name || row.mobile} মুছে ফেলা হবে।`,
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Delete',
        });
        if (!r.isConfirmed) return;
        await api.delete(`/job-application/${row._id}`);
        await load();
    };

    const importFromResume = async () => {
        const { value: text } = await Swal.fire({
            title: 'Import from CV / Resume',
            html: `
                <p class="text-[11px] text-gray-500 mb-2 text-left">Paste the CV/Resume text below. Gemini AI will extract the fields and fill the form.</p>
                <textarea id="ja-cv-text" class="swal2-textarea !w-full !min-h-[220px] !text-sm" placeholder="Paste resume / biographical text here..."></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Extract',
            confirmButtonColor: '#1e6bd6',
            preConfirm: () => document.getElementById('ja-cv-text').value.trim(),
        });
        if (!text) return;

        setAiBusy(true);
        try {
            const res = await api.post('/job-application/extract', { text });
            const extracted = res.data?.data || {};
            setEditing(e => ({ ...(e || BLANK), ...extracted }));
            Swal.fire({ icon: 'success', title: 'Auto-filled!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1800 });
        } catch (e) {
            Swal.fire('AI Error', e.response?.data?.message || 'Gemini থেকে data আনা যায়নি।', 'error');
        }
        setAiBusy(false);
    };

    const copyJson = () => {
        if (!editing) return;
        const clean = { ...editing };
        delete clean._id; delete clean.clientId; delete clean.createdAt; delete clean.updatedAt; delete clean.__v;
        navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
        Swal.fire({ icon: 'success', title: 'JSON copied', toast: true, position: 'top-end', showConfirmButton: false, timer: 1200 });
    };

    return (
        <div className="space-y-6 font-nunito pb-12">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Job Application <span className="text-[#1e6bd6]">Info</span>
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        চাকরির জন্য আবেদনকারীদের তথ্য সংরক্ষণ করুন · extension দিয়ে auto-fill হবে
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={openNew}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100">
                        <FiPlus size={14} /> Add New
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, mobile, email..."
                    className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium shadow-sm focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none"
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-gray-800">
                        Applicants <span className="text-gray-400">· {filtered.length}</span>
                    </p>
                </div>
                {loading ? (
                    <div className="p-10 text-center text-gray-400 text-sm font-bold">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e6bd6] mx-auto flex items-center justify-center mb-3">
                            <FiUser size={22} />
                        </div>
                        <p className="text-sm font-extrabold text-gray-700">No applicants yet</p>
                        <p className="text-xs text-gray-400 mt-1">"Add New" বাটনে ক্লিক করে প্রথম applicant যোগ করুন।</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map(row => (
                            <div key={row._id} className="p-4 flex items-center gap-4 hover:bg-gray-50/60">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center font-extrabold text-sm shrink-0">
                                    {(row.name || row.mobile || 'A').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-extrabold text-gray-800 truncate">{row.name || 'Unnamed'}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                                        <span className="flex items-center gap-1"><FiPhone size={10} /> {row.mobile || '—'}</span>
                                        {row.email && <span className="truncate">{row.email}</span>}
                                        {row.ssc_year && <span className="font-bold text-gray-400">SSC {row.ssc_year}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(row)}
                                            className="w-9 h-9 rounded-lg bg-blue-50 text-[#1e6bd6] border border-blue-100 flex items-center justify-center hover:bg-blue-100">
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button onClick={() => remove(row)}
                                            className="w-9 h-9 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-100">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FORM MODAL */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-3 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-6">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                            <div>
                                <p className="text-sm font-extrabold text-gray-800">{editing._id ? 'Edit Applicant' : 'Add New Applicant'}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile is the unique ID</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={importFromResume} disabled={aiBusy}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-extrabold uppercase tracking-widest shadow-sm disabled:opacity-60">
                                    {aiBusy ? <FiLoader size={13} className="animate-spin" /> : <FiZap size={13} />}
                                    AI Import from CV
                                </button>
                                <button onClick={copyJson}
                                        className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 flex items-center justify-center hover:bg-gray-100" title="Copy JSON">
                                    <FiCopy size={14} />
                                </button>
                                <button onClick={closeForm}
                                        className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                                    <FiX size={14} />
                                </button>
                            </div>
                        </div>

                        <FormBody value={editing} onChange={setEditing} />

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
                            <button onClick={closeForm}
                                    className="px-5 py-2.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 text-xs font-extrabold uppercase tracking-widest">
                                Cancel
                            </button>
                            <button onClick={save} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100 disabled:opacity-60">
                                {saving ? <FiRefreshCw size={13} className="animate-spin" /> : <FiSave size={13} />}
                                Save Applicant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   FormBody — renders all sections
═══════════════════════════════════════════════════════════════════ */

function FormBody({ value, onChange }) {
    const set = (k, v) => onChange(e => ({ ...e, [k]: v }));

    // Auto-mirror present → permanent when flag flips on
    const syncPermanent = (flag) => {
        if (flag === '1') {
            onChange(e => ({
                ...e,
                is_permanent_same: '1',
                permanent_careof:   e.present_careof,
                permanent_village:  e.present_village,
                permanent_district: e.present_district,
                permanent_upazila:  e.present_upazila,
                permanent_post:     e.present_post,
                permanent_postcode: e.present_postcode,
            }));
        } else {
            set('is_permanent_same', '0');
        }
    };

    return (
        <div className="p-5 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* Personal */}
            <Section title="Personal Information">
                <Field label="Mobile (Unique ID)" required>
                    <Input value={value.mobile} onChange={v => set('mobile', v)} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Name (EN)"><Input value={value.name} onChange={v => set('name', v)} /></Field>
                <Field label="Name (BN)"><Input value={value.name_bn} onChange={v => set('name_bn', v)} /></Field>
                <Field label="Father (EN)"><Input value={value.father} onChange={v => set('father', v)} /></Field>
                <Field label="Father (BN)"><Input value={value.father_bn} onChange={v => set('father_bn', v)} /></Field>
                <Field label="Mother (EN)"><Input value={value.mother} onChange={v => set('mother', v)} /></Field>
                <Field label="Mother (BN)"><Input value={value.mother_bn} onChange={v => set('mother_bn', v)} /></Field>
                <Field label="DOB (YYYY-MM-DD)"><Input type="date" value={value.dob} onChange={v => set('dob', v)} /></Field>
                <Field label="Religion"><Select opts={SELECT_OPTIONS.religion} value={value.religion} onChange={v => set('religion', v)} /></Field>
                <Field label="Gender"><Select opts={SELECT_OPTIONS.gender} value={value.gender} onChange={v => set('gender', v)} /></Field>
                <Field label="Marital Status"><Select opts={SELECT_OPTIONS.marital_status} value={value.marital_status} onChange={v => set('marital_status', v)} /></Field>
                <Field label="Spouse Name"><Input value={value.spouse_name} onChange={v => set('spouse_name', v)} /></Field>
                <Field label="Quota"><Select opts={SELECT_OPTIONS.quota} value={value.quota} onChange={v => set('quota', v)} /></Field>
                <Field label="Dept Status"><Select opts={SELECT_OPTIONS.dep_status} value={value.dep_status} onChange={v => set('dep_status', v)} /></Field>
            </Section>

            {/* Identity */}
            <Section title="Identity">
                <Field label="NID"><Select opts={SELECT_OPTIONS.nid} value={value.nid} onChange={v => set('nid', v)} /></Field>
                <Field label="NID No"><Input value={value.nid_no} onChange={v => set('nid_no', v)} disabled={value.nid === 'No'} /></Field>
                <Field label="Birth Reg"><Select opts={SELECT_OPTIONS.breg} value={value.breg} onChange={v => set('breg', v)} /></Field>
                <Field label="Birth Reg No"><Input value={value.breg_no} onChange={v => set('breg_no', v)} disabled={value.breg === 'No'} /></Field>
                <Field label="Passport"><Select opts={SELECT_OPTIONS.passport} value={value.passport} onChange={v => set('passport', v)} /></Field>
                <Field label="Passport No"><Input value={value.passport_no} onChange={v => set('passport_no', v)} disabled={value.passport === 'No'} /></Field>
                <Field label="Email" span={2}><Input type="email" value={value.email} onChange={v => set('email', v)} /></Field>
            </Section>

            {/* Present Address */}
            <Section title="Present Address">
                <Field label="Care Of"><Input value={value.present_careof} onChange={v => set('present_careof', v)} /></Field>
                <Field label="Village"><Input value={value.present_village} onChange={v => set('present_village', v)} /></Field>
                <Field label="District"><Input value={value.present_district} onChange={v => set('present_district', v)} /></Field>
                <Field label="Upazila"><Input value={value.present_upazila} onChange={v => set('present_upazila', v)} /></Field>
                <Field label="Post Office"><Input value={value.present_post} onChange={v => set('present_post', v)} /></Field>
                <Field label="Post Code"><Input value={value.present_postcode} onChange={v => set('present_postcode', v)} /></Field>
            </Section>

            {/* Permanent Address */}
            <Section
                title="Permanent Address"
                extra={
                    <label className="flex items-center gap-2 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value.is_permanent_same === '1'}
                            onChange={e => syncPermanent(e.target.checked ? '1' : '0')}
                            className="w-4 h-4 accent-[#1e6bd6]"
                        />
                        Same as Present
                    </label>
                }
            >
                <Field label="Perm. Care Of"><Input value={value.permanent_careof} onChange={v => set('permanent_careof', v)} /></Field>
                <Field label="Perm. Village"><Input value={value.permanent_village} onChange={v => set('permanent_village', v)} /></Field>
                <Field label="Perm. District"><Input value={value.permanent_district} onChange={v => set('permanent_district', v)} /></Field>
                <Field label="Perm. Upazila"><Input value={value.permanent_upazila} onChange={v => set('permanent_upazila', v)} /></Field>
                <Field label="Perm. Post Office"><Input value={value.permanent_post} onChange={v => set('permanent_post', v)} /></Field>
                <Field label="Perm. Post Code"><Input value={value.permanent_postcode} onChange={v => set('permanent_postcode', v)} /></Field>
            </Section>

            {/* SSC */}
            <Section title="SSC">
                <Field label="Exam"><Select opts={SELECT_OPTIONS.ssc_exam} value={value.ssc_exam} onChange={v => set('ssc_exam', v)} /></Field>
                <Field label="Board"><Select opts={SELECT_OPTIONS.ssc_board} value={value.ssc_board} onChange={v => set('ssc_board', v)} /></Field>
                <Field label="Roll"><Input value={value.ssc_roll} onChange={v => set('ssc_roll', v)} /></Field>
                <Field label="Group"><Select opts={SELECT_OPTIONS.ssc_group} value={value.ssc_group} onChange={v => set('ssc_group', v)} /></Field>
                <Field label="Year"><Input value={value.ssc_year} onChange={v => set('ssc_year', v)} placeholder="2018" /></Field>
                <Field label="Result Type"><Select opts={SELECT_OPTIONS.ssc_result_type} value={value.ssc_result_type} onChange={v => set('ssc_result_type', v)} /></Field>
                <Field label="Result"><Input value={value.ssc_result} onChange={v => set('ssc_result', v)} placeholder="e.g. 5.00" /></Field>
            </Section>

            {/* HSC */}
            <Section title="HSC">
                <Field label="Exam"><Select opts={SELECT_OPTIONS.hsc_exam} value={value.hsc_exam} onChange={v => set('hsc_exam', v)} /></Field>
                <Field label="Board"><Select opts={SELECT_OPTIONS.hsc_board} value={value.hsc_board} onChange={v => set('hsc_board', v)} /></Field>
                <Field label="Roll"><Input value={value.hsc_roll} onChange={v => set('hsc_roll', v)} /></Field>
                <Field label="Group"><Select opts={SELECT_OPTIONS.hsc_group} value={value.hsc_group} onChange={v => set('hsc_group', v)} /></Field>
                <Field label="Year"><Input value={value.hsc_year} onChange={v => set('hsc_year', v)} /></Field>
                <Field label="Result Type"><Select opts={SELECT_OPTIONS.hsc_result_type} value={value.hsc_result_type} onChange={v => set('hsc_result_type', v)} /></Field>
                <Field label="Result"><Input value={value.hsc_result} onChange={v => set('hsc_result', v)} /></Field>
            </Section>

            {/* Graduation */}
            <Section title="Graduation">
                <Field label="Exam"><Select opts={SELECT_OPTIONS.gra_exam} value={value.gra_exam} onChange={v => set('gra_exam', v)} /></Field>
                <Field label="Subject"><Input value={value.gra_subject} onChange={v => set('gra_subject', v)} /></Field>
                <Field label="Institute" span={2}><Input value={value.gra_institute} onChange={v => set('gra_institute', v)} /></Field>
                <Field label="Year"><Input value={value.gra_year} onChange={v => set('gra_year', v)} /></Field>
                <Field label="Duration"><Input value={value.gra_duration} onChange={v => set('gra_duration', v)} placeholder="4" /></Field>
                <Field label="Result Type"><Select opts={SELECT_OPTIONS.gra_result_type} value={value.gra_result_type} onChange={v => set('gra_result_type', v)} /></Field>
                <Field label="Result"><Input value={value.gra_result} onChange={v => set('gra_result', v)} /></Field>
            </Section>

            {/* Masters */}
            <Section title="Masters">
                <Field label="Exam"><Select opts={SELECT_OPTIONS.mas_exam} value={value.mas_exam} onChange={v => set('mas_exam', v)} /></Field>
                <Field label="Subject"><Input value={value.mas_subject} onChange={v => set('mas_subject', v)} /></Field>
                <Field label="Institute" span={2}><Input value={value.mas_institute} onChange={v => set('mas_institute', v)} /></Field>
                <Field label="Year"><Input value={value.mas_year} onChange={v => set('mas_year', v)} /></Field>
                <Field label="Duration"><Input value={value.mas_duration} onChange={v => set('mas_duration', v)} placeholder="2" /></Field>
                <Field label="Result Type"><Select opts={SELECT_OPTIONS.mas_result_type} value={value.mas_result_type} onChange={v => set('mas_result_type', v)} /></Field>
                <Field label="Result"><Input value={value.mas_result} onChange={v => set('mas_result', v)} /></Field>
            </Section>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   Form primitives
═══════════════════════════════════════════════════════════════════ */

function Section({ title, extra, children }) {
    return (
        <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{title}</p>
                {extra}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {children}
            </div>
        </div>
    );
}

function Field({ label, required, children, span }) {
    return (
        <div className={span === 2 ? 'sm:col-span-2' : ''}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function Input({ value, onChange, type = 'text', placeholder = '', disabled }) {
    return (
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none disabled:bg-gray-100 disabled:text-gray-400"
        />
    );
}

function Select({ opts, value, onChange }) {
    return (
        <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] outline-none"
        >
            {opts.map(o => <option key={o} value={o}>{o || 'Select'}</option>)}
        </select>
    );
}
