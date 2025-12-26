import React, { useState, useEffect, useRef } from 'react';
import { completeConsultation, generateSOAPNotes } from '../services/api';
import { 
    FiMic, FiMicOff, FiVideo, FiX, FiCheck, FiActivity, FiCpu, 
    FiLoader, FiFileText, FiUser, FiZap, FiPlus, FiTrash2, 
    FiAlertTriangle, FiSearch, FiPrinter, FiEye, FiSave, FiClock,
    FiMenu, FiEdit3
} from 'react-icons/fi';

// --- CONSTANTS & MOCK DATA ---
const FREQUENCIES = ["OD (Once a day)", "BD (Twice a day)", "TDS (Thrice a day)", "QID (4 times)", "SOS (As needed)"];
const DURATIONS = ["3 Days", "5 Days", "7 Days", "15 Days", "1 Month", "Continue"];
const COMMON_DIAGNOSES = [
    { code: "J00", name: "Acute Nasopharyngitis (Common Cold)" },
    { code: "I10", name: "Essential (Primary) Hypertension" },
    { code: "E11", name: "Type 2 Diabetes Mellitus" },
    { code: "J20.9", name: "Acute Bronchitis, unspecified" },
    { code: "R50.9", name: "Fever, unspecified" },
    { code: "K21.9", name: "Gastro-esophageal reflux disease" }
];

const ConsultationModal = ({ appointment, onClose, onSuccess }) => {
    if (!appointment) return null;

    // --- RESPONSIVE STATE ---
    const [width, setWidth] = useState(window.innerWidth);
    const isMobile = width < 900; 
    const [mobileTab, setMobileTab] = useState('clinical'); 

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- STATE MANAGEMENT ---
    const [step, setStep] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [activeSection, setActiveSection] = useState('subjective');

    const [soap, setSoap] = useState({ s: '', o: '', a: '', p: '' });
    const [vitals, setVitals] = useState({ 
        bp: appointment.vitals?.bp || '', 
        temp: appointment.vitals?.temp || '', 
        weight: appointment.vitals?.weight || '', 
        pulse: appointment.vitals?.pulse || '' 
    });

    const [medications, setMedications] = useState([]);
    const [newMed, setNewMed] = useState({ name: '', dose: '', freq: 'BD (Twice a day)', duration: '5 Days', notes: '' });
    const [diagnosisSearch, setDiagnosisSearch] = useState('');
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(appointment.diagnosis || '');
    const [outcome, setOutcome] = useState('Pending');
    const [aiSuggestions, setAiSuggestions] = useState(null);

    // --- AUTOSAVE & SHORTCUTS ---
    useEffect(() => {
        const timer = setInterval(() => {
            const draft = { soap, vitals, medications, selectedDiagnosis };
            localStorage.setItem(`draft_${appointment._id}`, JSON.stringify(draft));
            setLastSaved(new Date());
        }, 15000); 

        const saved = localStorage.getItem(`draft_${appointment._id}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            setSoap(parsed.soap || { s: '', o: '', a: '', p: '' });
            setVitals(parsed.vitals || {});
            setMedications(parsed.medications || []);
            setSelectedDiagnosis(parsed.selectedDiagnosis || '');
        }
        return () => clearInterval(timer);
    }, [appointment._id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === 'd') { e.preventDefault(); document.getElementById('diagnosis-input')?.focus(); }
            if (e.altKey && e.key === 'p') { e.preventDefault(); document.getElementById('med-name-input')?.focus(); }
            if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleReview(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- HANDLERS ---
    const toggleVoice = () => setIsListening(!isListening);
    const handleSoapChange = (field, val) => setSoap(prev => ({ ...prev, [field]: val }));
    const handleVitalChange = (e) => setVitals({ ...vitals, [e.target.name]: e.target.value });

    const addMedication = () => {
        if (!newMed.name) return;
        setMedications([...medications, { ...newMed, id: Date.now() }]);
        setNewMed({ name: '', dose: '', freq: 'BD (Twice a day)', duration: '5 Days', notes: '' });
    };
    const removeMedication = (id) => setMedications(medications.filter(m => m.id !== id));

    const runAIAssistant = async () => {
        if (!soap.s && !soap.o) {
            alert("Please enter some symptoms or observations first.");
            return;
        }
        setAiLoading(true);
        if(isMobile) setMobileTab('ai');
        
        try {
            const context = {
                patientAge: appointment.patientId?.age || 'Unknown',
                patientGender: appointment.patientId?.gender || 'Unknown'
            };
            const rawText = `Subjective: ${soap.s}\nObjective: ${soap.o}\nVitals: BP ${vitals.bp}, Temp ${vitals.temp}`;
            const res = await generateSOAPNotes(rawText, context);
            const data = res.data;

            if (data) {
                setAiSuggestions(data);
                if (!soap.a && data.assessment) setSoap(prev => ({ ...prev, a: data.assessment }));
                if (!soap.p && data.plan) setSoap(prev => ({ ...prev, p: data.plan }));
            }
        } catch (error) {
            console.error("AI Error", error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleReview = () => setStep(2);
    
    const finalizeConsultation = async () => {
        setLoading(true);
        try {
            const formattedNotes = `[SUBJECTIVE]\n${soap.s}\n\n[OBJECTIVE]\n${soap.o}\n\n[ASSESSMENT]\n${soap.a}\n\n[PLAN]\n${soap.p}`.trim();
            const formattedRx = medications.map(m => `- ${m.name} ${m.dose} | ${m.freq} for ${m.duration} (${m.notes})`).join('\n');
            const payload = {
                doctorNotes: formattedNotes,
                diagnosis: selectedDiagnosis,
                prescription: formattedRx,
                vitals: vitals,
                outcome: outcome
            };
            await completeConsultation(appointment._id, payload);
            localStorage.removeItem(`draft_${appointment._id}`);
            onSuccess();
            onClose();
        } catch (error) {
            alert("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getVitalColor = (type, value) => {
        if (!value) return '#cbd5e1';
        const val = parseFloat(value);
        if (type === 'temp') return val > 99.5 ? '#ef4444' : '#10b981';
        if (type === 'bp') {
            const [sys, dia] = value.split('/').map(Number);
            return (sys > 140 || dia > 90) ? '#ef4444' : '#10b981';
        }
        return '#334155';
    };

    // --- STYLES ---
    const styles = {
        overlay: { 
            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 
        },
        container: { 
            width: isMobile ? '100vw' : '95vw', 
            maxWidth: '1400px', 
            height: isMobile ? '100vh' : '95vh', 
            backgroundColor: '#f8fafc', 
            borderRadius: isMobile ? '0' : '12px', 
            display: 'flex', flexDirection: 'column', overflow: 'hidden', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        },
        
        // Header
        header: { 
            padding: isMobile ? '12px 15px' : '0 20px', 
            height: isMobile ? 'auto' : '55px',
            minHeight: '55px',
            backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', 
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '8px' : '0'
        },
        patientMeta: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', position: 'relative' },
        avatar: { width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 },
        
        // Header Actions
        headerActions: { 
            display: 'flex', alignItems: 'center', gap: '12px', 
            width: isMobile ? '100%' : 'auto', 
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            paddingLeft: isMobile ? '48px' : '0',
            marginTop: isMobile ? '4px' : '0'
        },

        // Mobile Tabs
        mobileNav: {
            display: isMobile ? 'flex' : 'none',
            backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
            justifyContent: 'space-around', padding: '0 8px'
        },
        mobileNavItem: (active) => ({
            padding: '10px 0', flex: 1, textAlign: 'center',
            fontSize: '0.8rem', fontWeight: '600',
            color: active ? '#2563eb' : '#64748b',
            borderBottom: active ? '3px solid #2563eb' : '3px solid transparent'
        }),

        // Compact Layout (Columns narrowed)
        grid: { 
            display: isMobile ? 'flex' : 'grid', 
            flexDirection: 'column',
            gridTemplateColumns: '240px 1fr 280px', 
            flex: 1, overflow: 'hidden' 
        },
        
        // Panels
        sidebar: { 
            backgroundColor: 'white', borderRight: '1px solid #e2e8f0', padding: '16px', 
            display: (isMobile && mobileTab !== 'vitals') ? 'none' : 'block',
            overflowY: 'auto'
        },
        main: { 
            padding: isMobile ? '12px' : '20px', 
            backgroundColor: '#f1f5f9',
            display: (isMobile && mobileTab !== 'clinical') ? 'none' : 'flex',
            flexDirection: 'column', overflowY: 'auto'
        },
        aiPanel: { 
            backgroundColor: 'white', borderLeft: '1px solid #e2e8f0', padding: '16px',
            display: (isMobile && mobileTab !== 'ai') ? 'none' : 'block',
            overflowY: 'auto'
        },

        // Typography
        sectionHead: { fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', marginTop: '16px' },
        vitalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
        vitalInput: { width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '600', fontSize: isMobile ? '16px' : '0.85rem' },

        paper: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: isMobile ? '12px' : '16px', marginBottom: '16px' },
        
        tabGroup: { display: 'flex', gap: '5px', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', overflowX: 'auto' },
        tab: (active) => ({
            padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap',
            color: active ? '#2563eb' : '#64748b', borderBottom: active ? '2px solid #2563eb' : 'none', marginBottom: '-2px'
        }),
        textarea: { width: '100%', minHeight: '150px', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: '1.5', resize: 'vertical', outline: 'none', fontFamily: 'inherit' },

        // Rx Builder 
        rxGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr 0.5fr', 
            gap: '8px', alignItems: 'end' 
        },
        input: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', fontSize: isMobile ? '16px' : '0.85rem' },

        medChip: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginTop: '8px' },
        aiCard: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
        aiBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 6px', borderRadius: '20px', marginBottom: '6px' },

        // Footer
        footer: { 
            height: isMobile ? 'auto' : '55px',
            minHeight: '55px',
            backgroundColor: 'white', borderTop: '1px solid #e2e8f0', 
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', alignItems: 'center', 
            padding: isMobile ? '12px' : '0 20px',
            gap: isMobile ? '12px' : '0'
        },
        footerControls: {
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto', gap: '8px', alignItems: 'center'
        },
        btnPrimary: { 
            padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem',
            width: isMobile ? '100%' : 'auto'
        },
        btnSecondary: { 
            padding: '8px 16px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
            width: isMobile ? '100%' : 'auto'
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                
                {/* 1. Header */}
                <header style={styles.header}>
                    <div style={styles.patientMeta}>
                        <div style={styles.avatar}>{(appointment.patientId?.name || 'U').charAt(0)}</div>
                        <div style={{flex: 1}}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{appointment.patientId?.name || 'Unknown Patient'}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {appointment.patientId?.gender}, {appointment.patientId?.age || 'N/A'} yrs • {appointment.reason}
                            </span>
                        </div>
                        {isMobile && <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.2rem', color: '#64748b', padding: '5px' }}><FiX /></button>}
                    </div>

                    <div style={styles.headerActions}>
                        {/* Saved Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {lastSaved && <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheck /> Saved</span>}
                        </div>
                         
                        {/* Video Call Button */}
                        {appointment.type === 'Online' && (
                            <button 
                                onClick={() => window.open(appointment.videoLink || '#', '_blank')}
                                style={{ 
                                    ...styles.btnSecondary, 
                                    color: '#059669', 
                                    borderColor: '#a7f3d0', 
                                    backgroundColor: '#ecfdf5', 
                                    display: 'flex', alignItems: 'center', gap: '6px', 
                                    padding: '6px 12px', 
                                    fontSize: '0.85rem',
                                    width: 'auto' 
                                }} 
                            >
                                <FiVideo /> {isMobile ? 'Join' : 'Video Call'}
                            </button>
                        )}
                        {!isMobile && <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><FiX /></button>}
                    </div>
                </header>

                {/* Mobile Navigation Tabs */}
                {step === 1 && (
                    <div style={styles.mobileNav}>
                        <div onClick={() => setMobileTab('vitals')} style={styles.mobileNavItem(mobileTab === 'vitals')}>
                            <FiActivity style={{ marginBottom: '-2px' }}/> Vitals
                        </div>
                        <div onClick={() => setMobileTab('clinical')} style={styles.mobileNavItem(mobileTab === 'clinical')}>
                            <FiEdit3 style={{ marginBottom: '-2px' }}/> Clinical
                        </div>
                        <div onClick={() => setMobileTab('ai')} style={styles.mobileNavItem(mobileTab === 'ai')}>
                            <FiZap style={{ marginBottom: '-2px' }}/> AI Assist
                        </div>
                    </div>
                )}

                {/* 2. Main Content */}
                {step === 1 ? (
                    <div style={styles.grid}>
                        
                        {/* LEFT: Context & Vitals */}
                        <div style={styles.sidebar}>
                            <div style={styles.sectionHead}><FiActivity /> Vitals</div>
                            
                            {Object.keys(vitals).map(k => (
                                <div key={k} style={styles.vitalRow}>
                                    <label style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'capitalize' }}>
                                        {k === 'bp' ? 'BP (mmHg)' : k === 'temp' ? 'Temp (°F)' : k === 'pulse' ? 'Pulse (bpm)' : 'Weight (kg)'}
                                    </label>
                                    <input 
                                        name={k} 
                                        type={k === 'bp' ? 'text' : 'number'}
                                        inputMode={k === 'bp' ? 'text' : 'decimal'}
                                        value={vitals[k]} 
                                        onChange={handleVitalChange} 
                                        placeholder="-" 
                                        style={{ ...styles.vitalInput, color: getVitalColor(k, vitals[k]), borderColor: getVitalColor(k, vitals[k]) }} 
                                    />
                                </div>
                            ))}

                            <div style={styles.sectionHead}><FiClock /> History</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                                No previous consultation records available.
                            </div>
                        </div>

                        {/* CENTER: Clinical Editor */}
                        <div style={styles.main}>
                            
                            {/* SOAP Editor */}
                            <div style={styles.paper}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Clinical Notes</h3>
                                    <button onClick={toggleVoice} style={{ border: 'none', background: 'none', color: isListening ? '#ef4444' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                        {isListening ? <FiMicOff /> : <FiMic />} {isListening ? 'Stop' : isMobile ? '' : 'Dictate'}
                                    </button>
                                </div>
                                
                                <div style={styles.tabGroup}>
                                    {['subjective', 'objective', 'assessment', 'plan'].map(section => (
                                        <div key={section} onClick={() => setActiveSection(section)} style={styles.tab(activeSection === section)}>
                                            {section.charAt(0).toUpperCase() + section.slice(1)}
                                        </div>
                                    ))}
                                </div>

                                <textarea 
                                    value={soap[activeSection.charAt(0)]}
                                    onChange={(e) => handleSoapChange(activeSection.charAt(0), e.target.value)}
                                    placeholder={`Enter ${activeSection} details here...`}
                                    style={styles.textarea}
                                />
                            </div>

                            {/* Diagnosis & Rx */}
                            <div style={styles.paper}>
                                <div style={{ ...styles.sectionHead, marginTop: 0, marginBottom: '10px' }}>Diagnosis & Treatment</div>
                                
                                <div style={{ marginBottom: '15px', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', backgroundColor: 'white' }}>
                                        <FiSearch color="#94a3b8" />
                                        <input 
                                            id="diagnosis-input"
                                            value={diagnosisSearch || selectedDiagnosis}
                                            onChange={(e) => { setDiagnosisSearch(e.target.value); setSelectedDiagnosis(e.target.value); }}
                                            placeholder="Search ICD-10 Diagnosis..."
                                            style={{ ...styles.input, border: 'none' }}
                                        />
                                    </div>
                                    {diagnosisSearch && !COMMON_DIAGNOSES.some(d => d.name === selectedDiagnosis) && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                            {COMMON_DIAGNOSES.filter(d => d.name.toLowerCase().includes(diagnosisSearch.toLowerCase())).map(d => (
                                                <div key={d.code} onClick={() => { setSelectedDiagnosis(`${d.code} - ${d.name}`); setDiagnosisSearch(''); }} style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                                                    <strong>{d.code}</strong> {d.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Rx Builder */}
                                <div style={styles.rxGrid}>
                                    <input id="med-name-input" placeholder="Medicine Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} style={styles.input} />
                                    <input placeholder="Dose (500mg)" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} style={styles.input} />
                                    <select value={newMed.freq} onChange={e => setNewMed({...newMed, freq: e.target.value})} style={styles.input}>
                                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} style={styles.input}>
                                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <button onClick={addMedication} style={{ ...styles.btnPrimary, padding: '8px', justifyContent: 'center' }}>
                                        {isMobile ? 'Add Medication' : <FiPlus />}
                                    </button>
                                </div>

                                <div style={{ marginTop: '12px' }}>
                                    {medications.map(med => (
                                        <div key={med.id} style={styles.medChip}>
                                            <div style={{flex: 1}}>
                                                <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{med.name} {med.dose}</span>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{med.freq} • {med.duration}</div>
                                            </div>
                                            <button onClick={() => removeMedication(med.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><FiTrash2 /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: AI Assistant */}
                        <div style={styles.aiPanel}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                    <FiZap fill="#f59e0b" color="#f59e0b" /> AI Assistant
                                </div>
                                <button onClick={runAIAssistant} style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                    {aiLoading ? 'Analyzing...' : 'Refresh'}
                                </button>
                            </div>

                            {aiSuggestions ? (
                                <>
                                    <div style={styles.aiCard}>
                                        <div style={styles.aiBadge}>DIAGNOSIS ASSIST</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{aiSuggestions.assessment || "No diagnosis detected yet."}</div>
                                    </div>
                                    {aiSuggestions.redFlags?.length > 0 && (
                                        <div style={{ ...styles.aiCard, backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
                                            <div style={{ ...styles.aiBadge, backgroundColor: '#fee2e2', color: '#991b1b' }}><FiAlertTriangle /> RED FLAGS</div>
                                            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#7f1d1d' }}>
                                                {aiSuggestions.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <div style={styles.aiCard}>
                                        <div style={styles.aiBadge}>SUGGESTED PLAN</div>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                            {aiSuggestions.plan || "Please enter more clinical details."}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px', fontSize: '0.85rem' }}>
                                    <FiCpu size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                    <p>Enter details, then click <strong>Refresh</strong> for insights.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // --- REVIEW STEP ---
                    <div style={{ ...styles.main, display: 'block' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: isMobile ? '16px' : '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Summary</div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', fontSize: '0.9rem' }}>Clinical Details</h4>
                                    <p style={{ fontSize: '0.85rem' }}><strong>Diagnosis:</strong> {selectedDiagnosis || 'Not specified'}</p>
                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{soap.a}</p>
                                </div>
                                <div>
                                    <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', fontSize: '0.9rem' }}>Plan & Meds</h4>
                                    {medications.length > 0 ? (
                                        <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.85rem' }}>
                                            {medications.map(m => <li key={m.id}>{m.name} {m.dose} ({m.freq})</li>)}
                                        </ul>
                                    ) : <span style={{fontSize: '0.85rem'}}>No medications prescribed.</span>}
                                </div>
                            </div>
                            
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Patient Instructions</h4>
                                <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                                    {soap.p || "No specific instructions added."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Footer */}
                <footer style={styles.footer}>
                    {step === 1 ? (
                        <>
                            <div style={styles.footerControls}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', minWidth: '60px' }}>Outcome:</span>
                                <select value={outcome} onChange={(e) => setOutcome(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: isMobile ? '16px' : '0.85rem' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="Treated">Treated & Discharged</option>
                                    <option value="Follow-up">Follow-up Required</option>
                                    <option value="Referral">Referral</option>
                                </select>
                            </div>
                            <button onClick={handleReview} style={styles.btnPrimary}>
                                Review <FiCheck />
                            </button>
                        </>
                    ) : (
                        <div style={styles.footerControls}>
                            <button onClick={() => setStep(1)} style={styles.btnSecondary}>Back</button>
                            <button onClick={finalizeConsultation} disabled={loading} style={{ ...styles.btnPrimary, backgroundColor: '#16a34a' }}>
                                {loading ? 'Submitting...' : 'Confirm & Send'}
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ConsultationModal;