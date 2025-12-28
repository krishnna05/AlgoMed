import React, { useState, useEffect } from 'react';
import { 
    FiMic, FiMicOff, FiX, FiCheck, FiActivity, FiCpu, 
    FiLoader, FiEdit3, FiZap, FiPlus, FiTrash2, 
    FiAlertTriangle, FiSearch, FiClock
} from 'react-icons/fi';

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

    // --- RESPONSIVE & ZOOM STATE ---
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const isMobile = width < 900; 

    // CONSTANT SCALE: 0.8 (80% Zoom look)
    const currentScale = 0.8;

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

    // --- MOCK API CALLS ---
    const completeConsultation = async (id, payload) => { 
        return new Promise(resolve => setTimeout(resolve, 1000)); 
    };
    const generateSOAPNotes = async (text, context) => {
        return new Promise(resolve => setTimeout(() => resolve({
            data: { assessment: "Likely Viral URI", plan: "Rest and fluids", redFlags: [] }
        }), 1500));
    };

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
            if(onSuccess) onSuccess();
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
            position: 'fixed', inset: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            zIndex: 9999,
            overflow: 'hidden' 
        },
        container: { 
            transform: `scale(${currentScale})`,
            transformOrigin: 'center center',
            width: isMobile ? '115vw' : `${95 * (1/currentScale)}vw`,
            height: isMobile ? '110vh' : `${92 * (1/currentScale)}vh`, 
            maxWidth: isMobile ? '115vw' : `${1920 * (1/currentScale)}px`, 
            borderRadius: '20px', 
            backgroundColor: '#f8fafc', 
            display: 'flex', flexDirection: 'column', 
            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            position: 'relative',
        },
        
        // --- Header ---
        header: { 
            flexShrink: 0, 
            padding: isMobile ? '12px 16px' : '0 32px',
            height: isMobile ? 'auto' : '72px',
            backgroundColor: 'white', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            zIndex: 10
        },
        patientMeta: { 
            display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden',
            flex: 1
        },
        avatar: { 
            width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '12px', 
            backgroundColor: '#eff6ff', color: '#2563eb', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.25rem', flexShrink: 0 
        },
        patientInfo: {
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            justifyContent: 'center'
        },
        
        // --- Body ---
        bodyLayout: {
            display: 'flex',
            flex: 1, 
            overflow: 'hidden', 
            flexDirection: isMobile ? 'column' : 'row',
            backgroundColor: '#f1f5f9'
        },
        colLeft: {
            width: isMobile ? '100%' : '280px',
            borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
            backgroundColor: 'white',
            overflowY: 'auto',
            display: (isMobile && mobileTab !== 'vitals') ? 'none' : 'block',
            padding: '24px'
        },
        colCenter: {
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px 16px 80px 16px' : '32px',
            display: (isMobile && mobileTab !== 'clinical') ? 'none' : 'block',
        },
        colRight: {
            width: isMobile ? '100%' : '360px',
            borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
            backgroundColor: 'white',
            overflowY: 'auto',
            display: (isMobile && mobileTab !== 'ai') ? 'none' : 'block',
            padding: '24px'
        },

        // --- Mobile Navigation ---
        mobileNav: {
            flexShrink: 0,
            display: isMobile ? 'flex' : 'none',
            backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
            justifyContent: 'space-between', padding: '0 4px',
            boxShadow: '0 4px 6px -4px rgba(0,0,0,0.05)'
        },
        mobileNavItem: (active) => ({
            padding: '12px 0', flex: 1, textAlign: 'center',
            fontSize: '0.9rem', fontWeight: '600',
            color: active ? '#2563eb' : '#64748b',
            borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s'
        }),

        // --- Components ---
        sectionHead: { 
            fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', 
            textTransform: 'uppercase', letterSpacing: '0.05em', 
            marginBottom: '16px', marginTop: '4px',
            display: 'flex', alignItems: 'center', gap: '8px'
        },
        card: { 
            backgroundColor: 'white', borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0',
            padding: isMobile ? '16px' : '24px', marginBottom: '20px' 
        },
        
        vitalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f8fafc' },
        vitalInput: { width: '90px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '600', fontSize: '1rem', outline: 'none' },

        tabGroup: { display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '1px', overflowX: 'auto' },
        tab: (active) => ({
            padding: '10px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
            color: active ? '#2563eb' : '#64748b', 
            borderBottom: active ? '2px solid #2563eb' : '2px solid transparent', 
            marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
        }),
        textarea: { 
            width: '100%', minHeight: isMobile ? '180px' : '240px', padding: '16px', 
            borderRadius: '10px', border: '1px solid #cbd5e1', 
            fontSize: '16px', // Prevent iOS zoom
            lineHeight: '1.6', resize: 'none', 
            outline: 'none', fontFamily: 'inherit', color: '#334155',
            backgroundColor: '#fff'
        },

        input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '16px', outline: 'none' },
        rxGrid: { 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr auto', 
            gap: isMobile ? '16px' : '12px', 
            alignItems: 'center' 
        },

        aiCard: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
        aiBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '20px', marginBottom: '10px' },

        // --- Footer ---
        footer: { 
            flexShrink: 0,
            padding: isMobile ? '16px' : '20px 32px', 
            backgroundColor: 'white', borderTop: '1px solid #e2e8f0', 
            display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'space-between', alignItems: 'center', 
            gap: isMobile ? '12px' : '0',
            paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '20px'
        },
        btnPrimary: { 
            padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', 
            border: 'none', borderRadius: '10px', fontWeight: '600', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: '10px', fontSize: '1rem',
            width: isMobile ? '100%' : 'auto', transition: 'background 0.2s',
            height: '48px'
        },
        btnSecondary: { 
            padding: '12px 24px', backgroundColor: 'white', color: '#475569', 
            border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '600', 
            cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px',
            width: isMobile ? '100%' : 'auto', justifyContent: 'center',
            height: '48px'
        }
    };

    // --- RENDER HELPERS ---
    const renderSidebar = () => (
        <div style={styles.colLeft}>
            <div style={styles.sectionHead}><FiActivity /> VITALS</div>
            {Object.keys(vitals).map(k => (
                <div key={k} style={styles.vitalRow}>
                    <label style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'capitalize', fontWeight: '500' }}>
                        {k === 'bp' ? 'BP' : k === 'temp' ? 'Temp' : k === 'pulse' ? 'Pulse' : 'Weight'}
                        <span style={{fontSize:'0.75rem', fontWeight:'400', marginLeft:'4px'}}>
                           {k === 'bp' ? '(mmHg)' : k === 'temp' ? '(°F)' : k === 'pulse' ? '(bpm)' : '(kg)'}
                        </span>
                    </label>
                    <input 
                        name={k} 
                        inputMode={k === 'bp' ? 'text' : 'decimal'}
                        value={vitals[k]} 
                        onChange={handleVitalChange} 
                        placeholder="-" 
                        style={{ ...styles.vitalInput, color: getVitalColor(k, vitals[k]), borderColor: getVitalColor(k, vitals[k]) }} 
                    />
                </div>
            ))}
            
            <div style={{...styles.sectionHead, marginTop: '36px'}}><FiClock /> HISTORY</div>
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No prior records found.</span>
            </div>
        </div>
    );

    const renderMainContent = () => (
        <div style={styles.colCenter}>
            {/* SOAP Section */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
                        <FiEdit3 color="#64748b"/> Clinical Notes
                    </h3>
                    <button onClick={toggleVoice} style={{ border: 'none', background: isListening ? '#fef2f2' : 'white', color: isListening ? '#ef4444' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '8px 16px', borderRadius: '20px', border: `1px solid ${isListening ? '#fecaca' : '#e2e8f0'}` }}>
                        {isListening ? <FiMicOff /> : <FiMic />} {isListening ? 'Stop' : 'Dictate'}
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
                    placeholder={`Type ${activeSection} details here... (e.g., Patient complains of...)`}
                    style={styles.textarea}
                    autoFocus
                />
            </div>

            {/* Diagnosis & Rx Section */}
            <div style={styles.card}>
                <div style={{ ...styles.sectionHead, marginTop: 0 }}>Diagnosis & Treatment</div>
                
                {/* Search Diagnosis */}
                <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 16px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <FiSearch color="#94a3b8" size={20} />
                        <input 
                            value={diagnosisSearch || selectedDiagnosis}
                            onChange={(e) => { setDiagnosisSearch(e.target.value); setSelectedDiagnosis(e.target.value); }}
                            placeholder="Search ICD-10 Diagnosis (e.g., Hypertension)..."
                            style={{ ...styles.input, border: 'none', padding: '14px', fontSize: '16px' }}
                        />
                        {selectedDiagnosis && <FiCheck color="#10b981" size={20} />}
                    </div>
                    {diagnosisSearch && !COMMON_DIAGNOSES.some(d => d.name === selectedDiagnosis) && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 20, marginTop: '6px', overflow: 'hidden' }}>
                            {COMMON_DIAGNOSES.filter(d => d.name.toLowerCase().includes(diagnosisSearch.toLowerCase())).map(d => (
                                <div key={d.code} onClick={() => { setSelectedDiagnosis(`${d.code} - ${d.name}`); setDiagnosisSearch(''); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155', ':hover': { backgroundColor: '#f8fafc' } }}>
                                    <strong style={{ color: '#2563eb' }}>{d.code}</strong> {d.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Medicine */}
                <div style={{backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9'}}>
                    <div style={styles.rxGrid}>
                        <input placeholder="Drug Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} style={styles.input} />
                        <input placeholder="Dose (e.g. 500mg)" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} style={styles.input} />
                        <select value={newMed.freq} onChange={e => setNewMed({...newMed, freq: e.target.value})} style={styles.input}>
                            {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} style={styles.input}>
                            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button onClick={addMedication} style={{ ...styles.btnPrimary, padding: '12px', width: '100%' }}>
                            <FiPlus /> {isMobile ? 'Add Medication' : ''}
                        </button>
                    </div>
                </div>

                {/* Medicine List */}
                <div style={{ marginTop: '20px' }}>
                    {medications.length === 0 && <div style={{textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', padding: '12px'}}>No medications added yet.</div>}
                    {medications.map(med => (
                        <div key={med.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1rem' }}>{med.name} <span style={{color: '#64748b', fontWeight: '400'}}>{med.dose}</span></div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', marginRight: '8px' }}>{med.freq}</span>
                                    <span>{med.duration}</span>
                                </div>
                            </div>
                            <button onClick={() => removeMedication(med.id)} style={{ border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '8px', display: 'flex' }}><FiTrash2 /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAiPanel = () => (
        <div style={styles.colRight}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={styles.sectionHead}><FiZap fill="#f59e0b" color="#f59e0b" /> AI ASSISTANT</div>
                <button onClick={runAIAssistant} disabled={aiLoading} style={{ fontSize: '0.85rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', opacity: aiLoading ? 0.5 : 1 }}>
                    {aiLoading ? 'Thinking...' : 'Refresh'}
                </button>
            </div>

            {aiSuggestions ? (
                <>
                    <div style={styles.aiCard}>
                        <div style={styles.aiBadge}>DIAGNOSIS</div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{aiSuggestions.assessment || "No data."}</div>
                    </div>
                    {aiSuggestions.redFlags?.length > 0 && (
                        <div style={{ ...styles.aiCard, backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
                            <div style={{ ...styles.aiBadge, backgroundColor: '#fee2e2', color: '#991b1b' }}><FiAlertTriangle /> RED FLAGS</div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#7f1d1d' }}>
                                {aiSuggestions.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                            </ul>
                        </div>
                    )}
                    <div style={styles.aiCard}>
                        <div style={styles.aiBadge}>PLAN SUGGESTION</div>
                        <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {aiSuggestions.plan}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px' }}>
                    <FiCpu size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Input clinical notes and vitals,</p>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>then click Refresh.</p>
                </div>
            )}
        </div>
    );

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                
                {/* --- HEADER --- */}
                <header style={styles.header}>
                    <div style={styles.patientMeta}>
                        <div style={styles.avatar}>{(appointment.patientId?.name || 'U').charAt(0)}</div>
                        <div style={styles.patientInfo}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {appointment.patientId?.name || 'Unknown'}
                            </h3>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                {appointment.patientId?.gender?.charAt(0)}, {appointment.patientId?.age || '?'}y • {appointment.type}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onClose} style={{ ...styles.btnSecondary, border: 'none', fontSize: '1.4rem', padding: '10px' }}>
                            <FiX />
                        </button>
                    </div>
                </header>

                {/* --- MOBILE TABS --- */}
                {step === 1 && (
                    <div style={styles.mobileNav}>
                        <div onClick={() => setMobileTab('vitals')} style={styles.mobileNavItem(mobileTab === 'vitals')}>
                            <FiActivity /> Vitals
                        </div>
                        <div onClick={() => setMobileTab('clinical')} style={styles.mobileNavItem(mobileTab === 'clinical')}>
                            <FiEdit3 /> Clinical
                        </div>
                        <div onClick={() => setMobileTab('ai')} style={styles.mobileNavItem(mobileTab === 'ai')}>
                            <FiZap /> AI Assist
                        </div>
                    </div>
                )}

                {/* --- BODY CONTENT (SCROLLABLE) --- */}
                {step === 1 ? (
                    <div style={styles.bodyLayout}>
                        {renderSidebar()}
                        {renderMainContent()}
                        {renderAiPanel()}
                    </div>
                ) : (
                    // --- REVIEW SCREEN ---
                    <div style={{ ...styles.bodyLayout, display: 'block', padding: isMobile ? '20px' : '40px', overflowY: 'auto' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', padding: isMobile ? '24px' : '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '32px' }}>Prescription Review</h2>
                            
                            <div style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px', marginBottom: '30px'}}>
                                <div>
                                    <div style={styles.sectionHead}>DIAGNOSIS</div>
                                    <div style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e293b'}}>{selectedDiagnosis || 'Not specified'}</div>
                                    <div style={{marginTop: '12px', fontSize: '1rem', color: '#475569'}}>{soap.a}</div>
                                </div>
                                <div>
                                    <div style={styles.sectionHead}>VITALS</div>
                                    <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
                                        {Object.entries(vitals).map(([k, v]) => v && (
                                            <span key={k} style={{backgroundColor:'#f1f5f9', padding:'6px 12px', borderRadius:'6px', fontSize:'0.9rem', color:'#334155'}}>
                                                <strong>{k}:</strong> {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{marginBottom: '32px'}}>
                                <div style={styles.sectionHead}>MEDICATIONS</div>
                                <table style={{width:'100%', borderCollapse:'collapse', fontSize: '1rem'}}>
                                    <thead style={{backgroundColor: '#f8fafc', color: '#64748b'}}>
                                        <tr>
                                            <th style={{padding:'12px', textAlign:'left'}}>Drug</th>
                                            <th style={{padding:'12px', textAlign:'left'}}>Dosage</th>
                                            <th style={{padding:'12px', textAlign:'left'}}>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medications.map(m => (
                                            <tr key={m.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                                                <td style={{padding:'14px', fontWeight:'600', color:'#1e293b'}}>{m.name}</td>
                                                <td style={{padding:'14px'}}>{m.dose} • {m.freq}</td>
                                                <td style={{padding:'14px'}}>{m.duration}</td>
                                            </tr>
                                        ))}
                                        {medications.length === 0 && <tr><td colSpan="3" style={{padding:'14px', textAlign:'center', color:'#94a3b8'}}>None</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <div style={styles.sectionHead}>INSTRUCTIONS</div>
                                <p style={{fontSize: '1rem', color: '#334155', lineHeight: '1.6'}}>{soap.p || "No specific instructions."}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER --- */}
                <footer style={styles.footer}>
                    {step === 1 ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                                <span style={{ fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>Outcome:</span>
                                <select value={outcome} onChange={(e) => setOutcome(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1, outline: 'none', backgroundColor: 'white' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="Treated">Discharged</option>
                                    <option value="Follow-up">Follow-up</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                                <button onClick={() => {}} style={{ ...styles.btnSecondary, width: isMobile ? '120px' : 'auto', justifyContent: 'center' }}>Save Draft</button>
                                <button onClick={handleReview} style={{ ...styles.btnPrimary, flex: 1 }}>Review & Sign <FiCheck /></button>
                            </div>
                        </>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                            <button onClick={() => setStep(1)} style={styles.btnSecondary}>Back to Edit</button>
                            <button onClick={finalizeConsultation} disabled={loading} style={{ ...styles.btnPrimary, backgroundColor: '#16a34a', width: isMobile ? '100%' : 'auto' }}>
                                {loading ? <><FiLoader /> Processing...</> : <><FiCheck /> Confirm Prescription</>}
                            </button>
                        </div>
                    )}
                </footer>

            </div>
        </div>
    );
};

export default ConsultationModal;