"use client";
import { useState, useEffect, useRef } from 'react';
import {
    FiFileText, FiDownload, FiPrinter, FiUpload, FiPlus, FiX,
    FiAlertCircle, FiRefreshCw, FiUser, FiBook, FiGlobe, FiInfo,
    FiMonitor, FiStar, FiTrash2, FiCheck, FiChevronLeft, FiChevronRight,
    FiEye, FiBriefcase
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const DEFAULT_CV = {
    name: '',
    photo: '',
    mailingAddress: '',
    contact: '',
    email: '',
    objective: 'To secure a position in a reputable organization that offers a supportive work environment and opportunities to take initiative, where I can contribute my best efforts and achieve long-term career growth.',
    academic: [
        { level: 'H.S.C (Higher Secondary School Certificate)', institution: '', gpa: '', year: '', board: '' },
        { level: 'S.S.C (Secondary School Certificate)', institution: '', gpa: '', year: '', board: '' },
    ],
    languages: [
        'Excellent verbal & written communication in mother tongue (Bangla)',
        'Good verbal & written communication in English language.',
    ],
    personal: {
        fatherName: '',
        motherName: '',
        permVillage: '',
        permPostOffice: '',
        permPoliceStation: '',
        permDistrict: '',
        dob: '',
        gender: 'Male',
        maritalStatus: 'Unmarried',
        nationality: 'Bangladeshi',
        religion: 'Islam',
        presentAddress: '',
    },
    workExperience: [],
    computerSkills: [
        { label: 'Operating System', value: 'Windows 10, 11' },
        { label: 'Application Packages', value: 'MS Word, MS Excel, MS PowerPoint' },
        { label: 'Internet', value: 'Internet Browsing, E-Mail Writing' },
    ],
    personalSkills: [
        'Ability to work under pressure and positive attitude.',
        'Ability to adopt in any environment.',
        'Working hard with logical thinking.',
        'Self-Motivated.',
    ],
};

const DRAFT_KEY = 'shoposbd-cv-draft-v3';

const STEPS = [
    { id: 'basic', label: 'Basic', icon: FiUser, help: 'Your name, contact & photo' },
    { id: 'objective', label: 'Objective', icon: FiStar, help: 'Career goal statement' },
    { id: 'academic', label: 'Academic', icon: FiBook, help: 'Education history' },
    { id: 'experience', label: 'Experience', icon: FiBriefcase, help: 'Work history (optional)' },
    { id: 'languages', label: 'Language', icon: FiGlobe, help: 'Language skills' },
    { id: 'personal', label: 'Personal', icon: FiInfo, help: 'Family & address' },
    { id: 'computer', label: 'Skills', icon: FiMonitor, help: 'Skills you have' },
    { id: 'skills', label: 'Qualities', icon: FiCheck, help: 'Personal qualities' },
    { id: 'review', label: 'Review', icon: FiEye, help: 'Preview & print' },
];

export default function CVMakerPage() {
    const [cv, setCv] = useState(DEFAULT_CV);
    const [loaded, setLoaded] = useState(false);
    const [step, setStep] = useState(0);
    const previewRef = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) setCv({ ...DEFAULT_CV, ...JSON.parse(saved) });
            const savedStep = localStorage.getItem(DRAFT_KEY + '-step');
            if (savedStep) setStep(Math.min(parseInt(savedStep) || 0, STEPS.length - 1));
        } catch {}
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(cv));
            localStorage.setItem(DRAFT_KEY + '-step', String(step));
        } catch {}
    }, [cv, step, loaded]);

    const update = (key, val) => setCv((c) => ({ ...c, [key]: val }));
    const updatePersonal = (key, val) => setCv((c) => ({ ...c, personal: { ...c.personal, [key]: val } }));

    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return Swal.fire('Too large', 'Photo must be under 5MB', 'error');
        const reader = new FileReader();
        reader.onloadend = () => update('photo', reader.result);
        reader.readAsDataURL(file);
    };

    const addAcademic = () => update('academic', [...cv.academic, { level: '', institution: '', gpa: '', year: '', board: '' }]);
    const removeAcademic = (i) => update('academic', cv.academic.filter((_, idx) => idx !== i));
    const updateAcademic = (i, key, val) => update('academic', cv.academic.map((a, idx) => idx === i ? { ...a, [key]: val } : a));

    const addToList = (key) => update(key, [...cv[key], '']);
    const removeFromList = (key, i) => update(key, cv[key].filter((_, idx) => idx !== i));
    const updateListItem = (key, i, val) => update(key, cv[key].map((v, idx) => idx === i ? val : v));

    const addExp = () => update('workExperience', [...cv.workExperience, { company: '', position: '', duration: '', description: '' }]);
    const removeExp = (i) => update('workExperience', cv.workExperience.filter((_, idx) => idx !== i));
    const updateExp = (i, key, val) => update('workExperience', cv.workExperience.map((x, idx) => idx === i ? { ...x, [key]: val } : x));

    const addCompSkill = () => update('computerSkills', [...cv.computerSkills, { label: '', value: '' }]);
    const removeCompSkill = (i) => update('computerSkills', cv.computerSkills.filter((_, idx) => idx !== i));
    const updateCompSkill = (i, key, val) => update('computerSkills', cv.computerSkills.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

    const handlePrint = () => window.print();

    const handleReset = async () => {
        const res = await Swal.fire({
            title: 'Reset CV?',
            text: 'All entered data will be cleared.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e6bd6',
            confirmButtonText: 'Yes, reset',
        });
        if (res.isConfirmed) {
            localStorage.removeItem(DRAFT_KEY);
            localStorage.removeItem(DRAFT_KEY + '-step');
            setCv(DEFAULT_CV);
            setStep(0);
        }
    };

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));
    const pct = Math.round(((step + 1) / STEPS.length) * 100);

    const current = STEPS[step];

    return (
        <div className="font-nunito pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 no-print px-6 pt-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">CV / Bio-Data Maker</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                        Bangladesh-Standard Resume · Step-by-Step · Auto-Saved
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <FiTrash2 /> Reset
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-sm shadow-blue-100"
                    >
                        <FiPrinter /> Print / Save PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start px-6">

                {/* Step Form Column */}
                <div className="no-print space-y-4 xl:sticky xl:top-6">

                    {/* Stepper */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest">
                                Step {step + 1} of {STEPS.length}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pct}% Complete</span>
                        </div>
                        <div className="h-1.5 bg-blue-50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-[#1e6bd6] transition-all duration-300 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="grid grid-cols-9 gap-1">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const done = i < step;
                                const active = i === step;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setStep(i)}
                                        title={s.label}
                                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                                            active
                                                ? 'bg-[#1e6bd6] text-white shadow-sm shadow-blue-100 scale-105'
                                                : done
                                                    ? 'bg-blue-50 text-[#1e6bd6] border border-blue-100'
                                                    : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {done ? <FiCheck size={14} /> : <Icon size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current Step Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e6bd6] flex items-center justify-center border border-blue-100 shadow-sm">
                                <current.icon size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">{current.label}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{current.help}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* STEP: BASIC */}
                            {current.id === 'basic' && (
                                <>
                                    <Field label="Full Name">
                                        <input
                                            value={cv.name}
                                            onChange={(e) => update('name', e.target.value)}
                                            placeholder="e.g. Md. Rahim Uddin"
                                            className={inputClass}
                                        />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Contact No">
                                            <input
                                                value={cv.contact}
                                                onChange={(e) => update('contact', e.target.value)}
                                                placeholder="01XXXXXXXXX"
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="Email">
                                            <input
                                                type="email"
                                                value={cv.email}
                                                onChange={(e) => update('email', e.target.value)}
                                                placeholder="name@example.com"
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>
                                    <Field label="Mailing Address">
                                        <textarea
                                            value={cv.mailingAddress}
                                            onChange={(e) => update('mailingAddress', e.target.value)}
                                            rows={2}
                                            placeholder="Village, Road, City"
                                            className={`${inputClass} resize-none`}
                                        />
                                    </Field>
                                    <Field label="Photo (Passport Size)">
                                        {cv.photo ? (
                                            <div className="flex items-center gap-3">
                                                <img src={cv.photo} alt="" className="w-16 h-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                                <button onClick={() => update('photo', '')} className="text-red-500 hover:text-red-600 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1">
                                                    <FiX /> Remove Photo
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest cursor-pointer hover:bg-blue-50">
                                                <FiUpload /> Upload Photo
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                                            </label>
                                        )}
                                    </Field>
                                </>
                            )}

                            {/* STEP: OBJECTIVE */}
                            {current.id === 'objective' && (
                                <Field label="Career Objective">
                                    <textarea
                                        value={cv.objective}
                                        onChange={(e) => update('objective', e.target.value)}
                                        rows={6}
                                        className={`${inputClass} resize-none`}
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Tip: 2–4 sentences about what you want to achieve.</p>
                                </Field>
                            )}

                            {/* STEP: ACADEMIC */}
                            {current.id === 'academic' && (
                                <div className="space-y-3">
                                    {cv.academic.map((a, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-xl space-y-2 relative border border-gray-100">
                                            <button
                                                onClick={() => removeAcademic(i)}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                            >
                                                <FiX size={14} />
                                            </button>
                                            <Field label="Degree / Level">
                                                <input value={a.level} onChange={(e) => updateAcademic(i, 'level', e.target.value)} placeholder="e.g. H.S.C" className={inputClass} />
                                            </Field>
                                            <Field label="Institution">
                                                <input value={a.institution} onChange={(e) => updateAcademic(i, 'institution', e.target.value)} className={inputClass} />
                                            </Field>
                                            <div className="grid grid-cols-3 gap-2">
                                                <Field label="GPA">
                                                    <input value={a.gpa} onChange={(e) => updateAcademic(i, 'gpa', e.target.value)} placeholder="4.50" className={inputClass} />
                                                </Field>
                                                <Field label="Year">
                                                    <input value={a.year} onChange={(e) => updateAcademic(i, 'year', e.target.value)} placeholder="2024" className={inputClass} />
                                                </Field>
                                                <Field label="Board">
                                                    <input value={a.board} onChange={(e) => updateAcademic(i, 'board', e.target.value)} placeholder="Dhaka" className={inputClass} />
                                                </Field>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addAcademic} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Degree
                                    </button>
                                </div>
                            )}

                            {/* STEP: EXPERIENCE */}
                            {current.id === 'experience' && (
                                <div className="space-y-3">
                                    {cv.workExperience.length === 0 && (
                                        <div className="text-center py-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                                                No work experience yet. <br/> Skip this step if you're a fresher.
                                            </p>
                                        </div>
                                    )}
                                    {cv.workExperience.map((x, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-xl space-y-2 relative border border-gray-100">
                                            <button onClick={() => removeExp(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                <FiX size={14} />
                                            </button>
                                            <Field label="Company / Organization">
                                                <input value={x.company} onChange={(e) => updateExp(i, 'company', e.target.value)} placeholder="e.g. ABC Ltd." className={inputClass} />
                                            </Field>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Field label="Position">
                                                    <input value={x.position} onChange={(e) => updateExp(i, 'position', e.target.value)} placeholder="e.g. Officer" className={inputClass} />
                                                </Field>
                                                <Field label="Duration">
                                                    <input value={x.duration} onChange={(e) => updateExp(i, 'duration', e.target.value)} placeholder="Jan 2022 – Present" className={inputClass} />
                                                </Field>
                                            </div>
                                            <Field label="Responsibilities (optional)">
                                                <textarea value={x.description} onChange={(e) => updateExp(i, 'description', e.target.value)} rows={2} placeholder="Main duties..." className={`${inputClass} resize-none`} />
                                            </Field>
                                        </div>
                                    ))}
                                    <button onClick={addExp} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Work Experience
                                    </button>
                                </div>
                            )}

                            {/* STEP: LANGUAGES */}
                            {current.id === 'languages' && (
                                <div className="space-y-2">
                                    {cv.languages.map((l, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={l}
                                                onChange={(e) => updateListItem('languages', i, e.target.value)}
                                                placeholder="e.g. Fluent in Bangla & English"
                                                className={`flex-1 ${inputClass}`}
                                            />
                                            <button onClick={() => removeFromList('languages', i)} className="text-red-400 hover:text-red-600 px-2">
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addToList('languages')} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Language
                                    </button>
                                </div>
                            )}

                            {/* STEP: PERSONAL */}
                            {current.id === 'personal' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Father's Name">
                                            <input value={cv.personal.fatherName} onChange={(e) => updatePersonal('fatherName', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Mother's Name">
                                            <input value={cv.personal.motherName} onChange={(e) => updatePersonal('motherName', e.target.value)} className={inputClass} />
                                        </Field>
                                    </div>
                                    <Field label="Permanent Address">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input value={cv.personal.permVillage} onChange={(e) => updatePersonal('permVillage', e.target.value)} placeholder="Village" className={inputClass} />
                                            <input value={cv.personal.permPostOffice} onChange={(e) => updatePersonal('permPostOffice', e.target.value)} placeholder="Post Office" className={inputClass} />
                                            <input value={cv.personal.permPoliceStation} onChange={(e) => updatePersonal('permPoliceStation', e.target.value)} placeholder="Police Station" className={inputClass} />
                                            <input value={cv.personal.permDistrict} onChange={(e) => updatePersonal('permDistrict', e.target.value)} placeholder="District" className={inputClass} />
                                        </div>
                                    </Field>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Date of Birth">
                                            <input value={cv.personal.dob} onChange={(e) => updatePersonal('dob', e.target.value)} placeholder="DD-MM-YYYY" className={inputClass} />
                                        </Field>
                                        <Field label="Gender">
                                            <select value={cv.personal.gender} onChange={(e) => updatePersonal('gender', e.target.value)} className={inputClass}>
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </Field>
                                        <Field label="Marital Status">
                                            <select value={cv.personal.maritalStatus} onChange={(e) => updatePersonal('maritalStatus', e.target.value)} className={inputClass}>
                                                <option>Unmarried</option><option>Married</option>
                                            </select>
                                        </Field>
                                        <Field label="Nationality">
                                            <input value={cv.personal.nationality} onChange={(e) => updatePersonal('nationality', e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Religion">
                                            <input value={cv.personal.religion} onChange={(e) => updatePersonal('religion', e.target.value)} className={inputClass} />
                                        </Field>
                                    </div>
                                    <Field label="Present Address">
                                        <textarea value={cv.personal.presentAddress} onChange={(e) => updatePersonal('presentAddress', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                                    </Field>
                                </>
                            )}

                            {/* STEP: COMPUTER */}
                            {current.id === 'computer' && (
                                <div className="space-y-2">
                                    {cv.computerSkills.map((s, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input value={s.label} onChange={(e) => updateCompSkill(i, 'label', e.target.value)} placeholder="Category" className={`flex-1 ${inputClass}`} />
                                            <input value={s.value} onChange={(e) => updateCompSkill(i, 'value', e.target.value)} placeholder="Details" className={`flex-[1.5] ${inputClass}`} />
                                            <button onClick={() => removeCompSkill(i)} className="text-red-400 hover:text-red-600 px-2">
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addCompSkill} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Computer Skill
                                    </button>
                                </div>
                            )}

                            {/* STEP: SKILLS */}
                            {current.id === 'skills' && (
                                <div className="space-y-2">
                                    {cv.personalSkills.map((s, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={s}
                                                onChange={(e) => updateListItem('personalSkills', i, e.target.value)}
                                                placeholder="e.g. Self-motivated"
                                                className={`flex-1 ${inputClass}`}
                                            />
                                            <button onClick={() => removeFromList('personalSkills', i)} className="text-red-400 hover:text-red-600 px-2">
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addToList('personalSkills')} className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-[#1e6bd6] text-xs font-extrabold uppercase tracking-widest hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <FiPlus /> Add Personal Skill
                                    </button>
                                </div>
                            )}

                            {/* STEP: REVIEW */}
                            {current.id === 'review' && (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                        <div className="flex items-center gap-2">
                                            <FiCheck className="text-emerald-600" />
                                            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Ready to print!</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-emerald-600 mt-2 leading-relaxed">
                                            Your CV preview is shown on the right. Click <strong>Print / Save PDF</strong> above or the button below to print.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePrint}
                                        className="w-full py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiPrinter /> Print / Save as PDF
                                    </button>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                        Want to change something? Use the step buttons above ↑
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nav */}
                        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100">
                            <button
                                onClick={prev}
                                disabled={step === 0}
                                className="px-4 py-2 rounded-lg bg-gray-50 text-gray-500 font-extrabold text-xs uppercase tracking-widest hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                            >
                                <FiChevronLeft /> Back
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={next}
                                    className="px-5 py-2 rounded-lg bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold text-xs uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center gap-1.5 transition-all"
                                >
                                    Next <FiChevronRight />
                                </button>
                            ) : (
                                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">All Steps Done ✓</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <FiAlertCircle className="text-[#1e6bd6] shrink-0 mt-0.5" size={16} />
                        <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                            Draft auto-saved in this browser. Close & come back anytime — nothing is uploaded.
                        </p>
                    </div>
                </div>

                {/* CV Preview (A4) */}
                <div className="cv-preview-wrapper flex justify-center">
                    <div
                        ref={previewRef}
                        className="cv-sheet bg-white shadow-xl"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '18mm 18mm 18mm 18mm',
                            fontFamily: 'Nunito, Arial, sans-serif',
                            color: '#171717',
                            fontSize: '11pt',
                            lineHeight: 1.55,
                        }}
                    >
                        {/* Header — 60% text / 40% photo, RESUME OF on its own line, name below */}
                        <div style={{ display: 'flex', gap: '8mm', marginBottom: '10mm', alignItems: 'stretch' }}>
                            <div style={{ width: '60%' }}>
                                <div style={{
                                    color: '#1e6bd6',
                                    fontSize: '13pt',
                                    fontWeight: 700,
                                    letterSpacing: '3px',
                                    marginBottom: '4pt',
                                    textTransform: 'uppercase'
                                }}>
                                    Resume of
                                </div>
                                <h1 style={{
                                    color: '#1e6bd6',
                                    fontSize: '22pt',
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    margin: '0 0 6pt 0',
                                    lineHeight: 1.15,
                                    wordBreak: 'break-word'
                                }}>
                                    {cv.name || '______'}
                                </h1>
                                <div style={{
                                    height: '3px',
                                    width: '60pt',
                                    background: '#1e6bd6',
                                    borderRadius: '2px',
                                    marginBottom: '8pt'
                                }} />
                                <div style={{ fontSize: '10.5pt', lineHeight: 1.7 }}>
                                    {cv.mailingAddress && (
                                        <div><strong style={{ color: '#1e6bd6' }}>Address:</strong> {cv.mailingAddress}</div>
                                    )}
                                    {cv.contact && (
                                        <div><strong style={{ color: '#1e6bd6' }}>Contact:</strong> {cv.contact}</div>
                                    )}
                                    {cv.email && (
                                        <div><strong style={{ color: '#1e6bd6' }}>E-mail:</strong> {cv.email}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ width: '40%', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                                {cv.photo ? (
                                    <img
                                        src={cv.photo}
                                        alt="Photo"
                                        style={{
                                            width: '38mm',
                                            height: '48mm',
                                            objectFit: 'cover',
                                            border: '2px solid #1e6bd6',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 4px rgba(30,107,214,0.15)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '38mm',
                                        height: '48mm',
                                        border: '2px dashed #dbeafe',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#93c5fd',
                                        fontSize: '9pt',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        padding: '4pt'
                                    }}>
                                        Photo<br />38×48mm
                                    </div>
                                )}
                            </div>
                        </div>

                        <CVSection title="CAREER OBJECTIVE">
                            <p style={{ margin: 0, textAlign: 'justify' }}>{cv.objective}</p>
                        </CVSection>

                        <CVSection title="ACADEMIC BACKGROUND">
                            {cv.academic.map((a, i) => (
                                <div key={i} style={{ marginBottom: '10pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                    <div style={{ marginBottom: '4pt' }}>
                                        <Tick /> <strong>{a.level || '______'}</strong>
                                    </div>
                                    <div style={{ paddingLeft: '22pt', fontSize: '10.5pt' }}>
                                        <CVField label="Institution" value={a.institution} />
                                        <CVField label="GPA" value={a.gpa} />
                                        <CVField label="Year" value={a.year} />
                                        <CVField label="Board" value={a.board} />
                                    </div>
                                </div>
                            ))}
                        </CVSection>

                        {cv.workExperience.length > 0 && (
                            <CVSection title="WORK EXPERIENCE">
                                {cv.workExperience.map((x, i) => (
                                    <div key={i} style={{ marginBottom: '10pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                                            <strong style={{ fontSize: '11pt' }}>{x.position || '—'}</strong>
                                            <span style={{ fontSize: '10pt', color: '#6b7280', fontStyle: 'italic' }}>{x.duration}</span>
                                        </div>
                                        {x.company && (
                                            <div style={{ fontSize: '10.5pt', color: '#1e6bd6', fontWeight: 600, marginBottom: '3pt' }}>
                                                {x.company}
                                            </div>
                                        )}
                                        {x.description && (
                                            <div style={{ fontSize: '10pt', textAlign: 'justify', paddingLeft: '10pt' }}>
                                                {x.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CVSection>
                        )}

                        <CVSection title="LANGUAGE SKILLS">
                            {cv.languages.map((l, i) => (
                                <div key={i} style={{ marginBottom: '3pt' }}>
                                    <Tick /> {l}
                                </div>
                            ))}
                        </CVSection>

                        <CVSection title="PERSONAL DETAILS">
                            <div style={{ fontSize: '10.5pt' }}>
                                <CVField label="Father's Name" value={cv.personal.fatherName} />
                                <CVField label="Mother's Name" value={cv.personal.motherName} />
                                {(cv.personal.permVillage || cv.personal.permPostOffice || cv.personal.permPoliceStation || cv.personal.permDistrict) && (
                                    <div style={{ display: 'flex', marginBottom: '3pt', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                        <span style={{ width: '140pt', fontWeight: 600 }}>Permanent Address</span>
                                        <span style={{ marginRight: '8pt' }}>:</span>
                                        <div>
                                            {cv.personal.permVillage && <div>Village &nbsp;&nbsp; - {cv.personal.permVillage},</div>}
                                            {cv.personal.permPostOffice && <div>Post Office &nbsp; - {cv.personal.permPostOffice},</div>}
                                            {cv.personal.permPoliceStation && <div>Police Station - {cv.personal.permPoliceStation},</div>}
                                            {cv.personal.permDistrict && <div>District &nbsp;&nbsp; - {cv.personal.permDistrict}.</div>}
                                        </div>
                                    </div>
                                )}
                                <CVField label="Date of Birth" value={cv.personal.dob} />
                                <CVField label="Gender" value={cv.personal.gender} />
                                <CVField label="Marital Status" value={cv.personal.maritalStatus} />
                                <CVField label="Nationality" value={cv.personal.nationality} />
                                <CVField label="Religion" value={cv.personal.religion} />
                                <CVField label="Present Address" value={cv.personal.presentAddress} />
                            </div>
                        </CVSection>

                        <CVSection title="SKILLS">
                            {cv.computerSkills.map((s, i) => (
                                <div key={i} style={{ marginBottom: '3pt', display: 'flex', breakInside: 'avoid' }}>
                                    <Tick />
                                    <span style={{ width: '140pt', fontWeight: 600 }}>{s.label}</span>
                                    <span style={{ marginRight: '8pt' }}>:</span>
                                    <span>{s.value}</span>
                                </div>
                            ))}
                        </CVSection>

                        <CVSection title="PERSONAL SKILLS">
                            {cv.personalSkills.map((s, i) => (
                                <div key={i} style={{ marginBottom: '3pt' }}>
                                    <Tick /> {s}
                                </div>
                            ))}
                        </CVSection>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 18mm 18mm 18mm 18mm;
                    }
                    html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .cv-preview-wrapper { display: block !important; }
                    .cv-sheet {
                        box-shadow: none !important;
                        width: 100% !important;
                        min-height: unset !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        position: static !important;
                    }
                    .cv-sheet h1, .cv-sheet h2 {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .cv-section-block {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    aside, header { display: none !important; }
                    body * { visibility: hidden; }
                    .cv-sheet, .cv-sheet * { visibility: visible; }
                    .cv-sheet { position: absolute; top: 0; left: 0; }
                }
            `}</style>
        </div>
    );
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-[#1e6bd6] focus:ring-2 focus:ring-blue-50 outline-none transition-all";

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function CVSection({ title, children }) {
    return (
        <div className="cv-section-block" style={{ marginBottom: '14pt', breakInside: 'avoid-page', pageBreakInside: 'avoid' }}>
            <h2 style={{
                color: '#1e6bd6',
                fontSize: '12pt',
                fontWeight: 800,
                letterSpacing: '0.5px',
                margin: '0 0 4pt 0',
                paddingBottom: '3pt',
                borderBottom: '2px solid #1e6bd6',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid'
            }}>
                {title}
            </h2>
            <div style={{ paddingTop: '6pt' }}>{children}</div>
        </div>
    );
}

function CVField({ label, value }) {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', marginBottom: '3pt', breakInside: 'avoid' }}>
            <span style={{ width: '140pt', fontWeight: 600 }}>{label}</span>
            <span style={{ marginRight: '8pt' }}>:</span>
            <span style={{ flex: 1 }}>{value}</span>
        </div>
    );
}

function Tick() {
    return (
        <span style={{ color: '#1e6bd6', fontWeight: 900, marginRight: '6pt', display: 'inline-block' }}>✓</span>
    );
}
