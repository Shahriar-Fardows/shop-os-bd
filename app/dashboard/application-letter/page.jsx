"use client";
import { useState, useEffect } from 'react';
import {
    FiMail, FiPrinter, FiTrash2, FiAlertCircle, FiCheck,
    FiChevronLeft, FiChevronRight, FiEye, FiFileText, FiUser,
    FiEdit3, FiLayers
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const TEMPLATES = [
    {
        id: 'leave',
        label: 'Leave Application (ছুটির দরখাস্ত)',
        subject: 'Application for Leave of Absence',
        recipient: 'The Headmaster / Principal',
        institution: '[School/College Name]',
        address: '[Address]',
        body: `With due respect, I beg to state that I am a regular student of your esteemed institution, studying in class [Class] (Roll No. [Roll]). I am suffering from [Reason e.g. high fever] since [start date] and as per doctor's advice I need complete rest for [number] days. As a result, I am unable to attend my classes during this period.

Therefore, I pray and hope that you would be kind enough to grant me leave from [start date] to [end date] and oblige thereby.`,
        closing: "Your's obedient student,",
        signature: '[Your Name]\nClass: [Class]\nRoll: [Roll]',
    },
    {
        id: 'job',
        label: 'Job Application (চাকরির আবেদন)',
        subject: 'Application for the Post of [Position]',
        recipient: 'The Chairman / Managing Director',
        institution: '[Company Name]',
        address: '[Company Address]',
        body: `With due respect, I have the honour to inform you that I came to know from a reliable source that several posts of [Position] are vacant in your esteemed organization. I, being a suitable candidate for the said post, would like to offer myself as a candidate.

If you kindly give me a chance to serve your organization, I assure you that I shall discharge my duties with utmost sincerity and to the best of your satisfaction.

My bio-data is enclosed herewith for your kind consideration.`,
        closing: 'Yours faithfully,',
        signature: '[Your Name]\n[Your Address]\n[Contact No.]',
    },
    {
        id: 'tc',
        label: 'Transfer Certificate (TC) Application',
        subject: 'Application for Transfer Certificate',
        recipient: 'The Headmaster / Principal',
        institution: '[School/College Name]',
        address: '[Address]',
        body: `With due respect, I beg to state that I was a student of your esteemed institution in class [Class], Roll No. [Roll], Session [Session]. Due to [Reason e.g. transfer of my father], my family is moving to [New City] and I have to continue my studies in a new institution there.

Therefore, I pray and hope that you would be kind enough to issue me a Transfer Certificate (TC) at your earliest convenience.`,
        closing: "Your's obedient student,",
        signature: '[Your Name]\nClass: [Class]\nRoll: [Roll]',
    },
    {
        id: 'scholarship',
        label: 'Scholarship Application (বৃত্তির আবেদন)',
        subject: 'Application for Financial Scholarship',
        recipient: 'The Headmaster / Principal',
        institution: '[School/College Name]',
        address: '[Address]',
        body: `With due respect, I beg to state that I am a regular student of your esteemed institution in class [Class], Roll No. [Roll]. My father is a [Father's Profession] and the sole earning member of our family. His limited income is not sufficient to bear my educational expenses along with family costs.

Despite financial hardship, I have maintained good academic results (GPA [GPA] in last exam). A scholarship would be of great help for me to continue my studies.

Therefore, I pray and hope that you would be kind enough to grant me a financial scholarship and oblige thereby.`,
        closing: "Your's obedient student,",
        signature: '[Your Name]\nClass: [Class]\nRoll: [Roll]',
    },
    {
        id: 'custom',
        label: 'Blank / Custom Letter',
        subject: '[Write your subject here]',
        recipient: '[Recipient Title]',
        institution: '[Institution / Company]',
        address: '[Address]',
        body: '[Write your letter body here. You can describe your request, reason, and any supporting details.]',
        closing: 'Yours sincerely,',
        signature: '[Your Name]',
    },
];

const DEFAULT_LETTER = {
    templateId: 'leave',
    date: new Date().toISOString().slice(0, 10),
    recipient: TEMPLATES[0].recipient,
    institution: TEMPLATES[0].institution,
    address: TEMPLATES[0].address,
    subject: TEMPLATES[0].subject,
    salutation: 'Sir,',
    body: TEMPLATES[0].body,
    closing: TEMPLATES[0].closing,
    signature: TEMPLATES[0].signature,
};

const DRAFT_KEY = 'shoposbd-letter-draft-v1';

const STEPS = [
    { id: 'template', label: 'Template', icon: FiLayers, help: 'Pick letter type' },
    { id: 'recipient', label: 'Recipient', icon: FiUser, help: 'Who are you writing to' },
    { id: 'subject', label: 'Subject', icon: FiFileText, help: 'Subject & salutation' },
    { id: 'body', label: 'Body', icon: FiEdit3, help: 'Main content' },
    { id: 'signature', label: 'Sign-off', icon: FiMail, help: 'Closing & signature' },
    { id: 'review', label: 'Review', icon: FiEye, help: 'Preview & print' },
];

export default function ApplicationLetterPage() {
    const [letter, setLetter] = useState(DEFAULT_LETTER);
    const [loaded, setLoaded] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) setLetter({ ...DEFAULT_LETTER, ...JSON.parse(saved) });
            const savedStep = localStorage.getItem(DRAFT_KEY + '-step');
            if (savedStep) setStep(Math.min(parseInt(savedStep) || 0, STEPS.length - 1));
        } catch {}
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(letter));
            localStorage.setItem(DRAFT_KEY + '-step', String(step));
        } catch {}
    }, [letter, step, loaded]);

    const update = (key, val) => setLetter((l) => ({ ...l, [key]: val }));

    const applyTemplate = (id) => {
        const t = TEMPLATES.find((x) => x.id === id);
        if (!t) return;
        setLetter({
            templateId: t.id,
            date: letter.date,
            recipient: t.recipient,
            institution: t.institution,
            address: t.address,
            subject: t.subject,
            salutation: 'Sir,',
            body: t.body,
            closing: t.closing,
            signature: t.signature,
        });
    };

    const handlePrint = () => window.print();

    const handleReset = async () => {
        const res = await Swal.fire({
            title: 'Reset letter?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#1e6bd6', confirmButtonText: 'Yes, reset',
        });
        if (res.isConfirmed) {
            localStorage.removeItem(DRAFT_KEY);
            localStorage.removeItem(DRAFT_KEY + '-step');
            setLetter(DEFAULT_LETTER);
            setStep(0);
        }
    };

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const prev = () => setStep((s) => Math.max(s - 1, 0));
    const pct = Math.round(((step + 1) / STEPS.length) * 100);
    const current = STEPS[step];

    const prettyDate = (() => {
        try {
            return new Date(letter.date).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
        } catch { return letter.date; }
    })();

    return (
        <div className="font-nunito pb-20">
            <div className="flex justify-between items-center mb-6 no-print px-6 pt-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Application Letter Maker</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                        দরখাস্ত · Leave, Job, TC, Scholarship · Step-by-Step · Auto-Saved
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleReset} className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <FiTrash2 /> Reset
                    </button>
                    <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 shadow-sm shadow-blue-100">
                        <FiPrinter /> Print Letter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6 items-start px-6">

                {/* Step Form */}
                <div className="no-print space-y-4 xl:sticky xl:top-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-extrabold text-[#1e6bd6] uppercase tracking-widest">
                                Step {step + 1} of {STEPS.length}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-blue-50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-[#1e6bd6] transition-all duration-300 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
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
                            {current.id === 'template' && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Pick one — template auto-fills all fields
                                    </p>
                                    {TEMPLATES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => applyTemplate(t.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                                letter.templateId === t.id
                                                    ? 'bg-blue-50 border-[#1e6bd6] shadow-sm shadow-blue-100'
                                                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {letter.templateId === t.id && <FiCheck className="text-[#1e6bd6]" size={14} />}
                                                <span className={`text-sm font-extrabold ${letter.templateId === t.id ? 'text-[#1e6bd6]' : 'text-gray-700'}`}>
                                                    {t.label}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {current.id === 'recipient' && (
                                <>
                                    <Field label="Date">
                                        <input type="date" value={letter.date} onChange={(e) => update('date', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Recipient (To)">
                                        <input value={letter.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="e.g. The Headmaster" className={inputClass} />
                                    </Field>
                                    <Field label="Institution / Company Name">
                                        <input value={letter.institution} onChange={(e) => update('institution', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Address">
                                        <textarea value={letter.address} onChange={(e) => update('address', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                                    </Field>
                                </>
                            )}

                            {current.id === 'subject' && (
                                <>
                                    <Field label="Subject">
                                        <input value={letter.subject} onChange={(e) => update('subject', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Salutation">
                                        <select value={letter.salutation} onChange={(e) => update('salutation', e.target.value)} className={inputClass}>
                                            <option>Sir,</option>
                                            <option>Madam,</option>
                                            <option>Sir / Madam,</option>
                                            <option>Dear Sir,</option>
                                            <option>Dear Madam,</option>
                                        </select>
                                    </Field>
                                </>
                            )}

                            {current.id === 'body' && (
                                <Field label="Letter Body">
                                    <textarea
                                        value={letter.body}
                                        onChange={(e) => update('body', e.target.value)}
                                        rows={14}
                                        className={`${inputClass} resize-none font-medium`}
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
                                        Tip: Replace placeholders like [Class], [Roll], [Reason] with real values.
                                    </p>
                                </Field>
                            )}

                            {current.id === 'signature' && (
                                <>
                                    <Field label="Closing">
                                        <select value={letter.closing} onChange={(e) => update('closing', e.target.value)} className={inputClass}>
                                            <option>Your's obedient student,</option>
                                            <option>Yours faithfully,</option>
                                            <option>Yours sincerely,</option>
                                            <option>Yours truly,</option>
                                            <option>With best regards,</option>
                                        </select>
                                    </Field>
                                    <Field label="Your Name & Details">
                                        <textarea
                                            value={letter.signature}
                                            onChange={(e) => update('signature', e.target.value)}
                                            rows={4}
                                            placeholder="Your Name&#10;Class: XII&#10;Roll: 01"
                                            className={`${inputClass} resize-none`}
                                        />
                                    </Field>
                                </>
                            )}

                            {current.id === 'review' && (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                        <div className="flex items-center gap-2">
                                            <FiCheck className="text-emerald-600" />
                                            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Letter Ready!</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-emerald-600 mt-2 leading-relaxed">
                                            Preview shown on the right. Check once, then print.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePrint}
                                        className="w-full py-3 rounded-xl bg-[#1e6bd6] hover:bg-[#1656ac] text-white text-xs font-extrabold uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center justify-center gap-2"
                                    >
                                        <FiPrinter /> Print / Save as PDF
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100">
                            <button
                                onClick={prev}
                                disabled={step === 0}
                                className="px-4 py-2 rounded-lg bg-gray-50 text-gray-500 font-extrabold text-xs uppercase tracking-widest hover:bg-gray-100 disabled:opacity-40 flex items-center gap-1.5"
                            >
                                <FiChevronLeft /> Back
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={next}
                                    className="px-5 py-2 rounded-lg bg-[#1e6bd6] hover:bg-[#1656ac] text-white font-extrabold text-xs uppercase tracking-widest shadow-sm shadow-blue-100 flex items-center gap-1.5"
                                >
                                    Next <FiChevronRight />
                                </button>
                            ) : (
                                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Done ✓</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <FiAlertCircle className="text-[#1e6bd6] shrink-0 mt-0.5" size={16} />
                        <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                            Pick a template, customize a few fields, print. Auto-saved in browser.
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex justify-center">
                    <div
                        className="letter-sheet bg-white shadow-xl"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '25mm 22mm',
                            fontFamily: 'Nunito, Arial, sans-serif',
                            color: '#171717',
                            fontSize: '12pt',
                            lineHeight: 1.75,
                        }}
                    >
                        <div style={{ textAlign: 'right', fontSize: '11pt', marginBottom: '14pt' }}>
                            <strong>Date:</strong> {prettyDate}
                        </div>

                        <div style={{ marginBottom: '14pt' }}>
                            <div>To,</div>
                            <div><strong>{letter.recipient}</strong></div>
                            <div>{letter.institution}</div>
                            {letter.address && letter.address.split('\n').map((ln, i) => <div key={i}>{ln}</div>)}
                        </div>

                        <div style={{
                            marginBottom: '14pt',
                            textAlign: 'center',
                        }}>
                            <span style={{
                                fontWeight: 800,
                                borderBottom: '2px solid #171717',
                                paddingBottom: '2pt',
                                fontSize: '12.5pt'
                            }}>
                                Subject: {letter.subject}
                            </span>
                        </div>

                        <div style={{ marginBottom: '12pt' }}>
                            {letter.salutation}
                        </div>

                        <div style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', textIndent: '28pt' }}>
                            {letter.body}
                        </div>

                        <div style={{ marginTop: '22pt' }}>
                            {letter.closing}
                        </div>

                        <div style={{ marginTop: '30pt', whiteSpace: 'pre-wrap', fontWeight: 600 }}>
                            {letter.signature}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { background: #fff !important; }
                    .no-print { display: none !important; }
                    .letter-sheet {
                        box-shadow: none !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                    }
                    aside, header { display: none !important; }
                    body * { visibility: hidden; }
                    .letter-sheet, .letter-sheet * { visibility: visible; }
                    .letter-sheet { position: absolute; top: 0; left: 0; }
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
