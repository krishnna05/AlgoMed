import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeConsultation, generateSOAPNotes } from '../services/api';
import { 
    FiMic, FiMicOff, FiVideo, FiX, FiCheck, FiActivity, FiCpu, 
    FiLoader, FiFileText, FiUser, FiClock, FiZap, FiPlus 
} from 'react-icons/fi';

// --- QUICK TEMPLATES (SaaS Feature) ---
const NOTE_TEMPLATES = {
    "General Checkup": "Patient presents for a routine checkup. No acute complaints reported. \n\nReview of Systems: Negative.",
    "Fever/Flu": "Chief Complaint: Fever, chills, body ache. \nOnset: 2 days ago. \nTemp: 101°F. \n\nExam: Throat congestion noted.",
    "Follow-up": "Patient returns for follow-up on Hypertension. \nCompliance with meds: Good. \nBP Check: Stable.",
    "Dermatology": "Complaint: Skin rash on left arm. \nDuration: 1 week. \nItching: Moderate. \n\nExam: Erythematous patch approx 2cm."
};

const QUICK_RX = [
    "Paracetamol 500mg (SOS)", "Amoxicillin 500mg (TD x 5)", "Cetirizine 10mg (OD)", "Multivitamin (OD)"
];

const ConsultationModal = ({ appointment, onClose, onSuccess }) => {
    if (!appointment) return null;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        doctorNotes: '',
        diagnosis: '',
        prescription: '',
        vitals: { bp: '', temp: '', weight: '', pulse: '' },
        outcome: 'Pending' 
    });

    // --- Voice to Text Logic ---
    useEffect(() => {
        let recognition = null;
        if ('webkitSpeechRecognition' in window) {
            recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                // Append to existing notes (simple debounce logic implied by usage)
                setFormData(prev => ({ ...prev, doctorNotes: prev.doctorNotes + ' ' + transcript }));
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }

        if (isListening && recognition) recognition.start();
        else if (recognition) recognition.stop();

        return () => { if (recognition) recognition.stop(); };
    }, [isListening]);

    const toggleVoice = () => setIsListening(!isListening);

    // --- Smart Helpers ---
    const applyTemplate = (templateName) => {
        setFormData(prev => ({
            ...prev,
            doctorNotes: prev.doctorNotes ? prev.doctorNotes + "\n\n" + NOTE_TEMPLATES[templateName] : NOTE_TEMPLATES[templateName]
        }));
    };

    const addQuickRx = (rx) => {
        setFormData(prev => ({
            ...prev,
            prescription: prev.prescription ? prev.prescription + "\n" + rx : rx
        }));
    };

    const handleGenerateAI = async () => {
        if (!formData.doctorNotes.trim()) {
            alert("Please speak or type some rough notes first.");
            return;
        }

        setAiLoading(true);
        try {
            const context = {
                patientAge: appointment.patientId?.age || 'Unknown',
                patientGender: appointment.patientId?.gender || 'Unknown'
            };

            const res = await generateSOAPNotes(formData.doctorNotes, context);
            const data = res.data;

            // Smart Merge
            setFormData(prev => ({
                ...prev,
                doctorNotes: `SUBJECTIVE: ${data.subjective}\n\nOBJECTIVE: ${data.objective}\n\nASSESSMENT: ${data.assessment}\n\nPLAN: ${data.plan}`,
                diagnosis: data.assessment ? data.assessment.split('.')[0] : prev.diagnosis,
                prescription: data.plan || prev.prescription
            }));

        } catch (error) {
            console.error(error);
            alert("AI Generation failed. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleJoinVideo = () => {
        // Open video in new tab or navigate
        // Since we are in a modal, navigating away might lose data unless we persist it.
        // For SaaS best practice, we'll open in a new tab or just navigate if you prefer.
        // Here we navigate to the internal route we built.
        const url = `/doctor/video-call/${appointment._id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // --- Handlers ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVitalChange = (e) => {
        setFormData({
            ...formData,
            vitals: { ...formData.vitals, [e.target.name]: e.target.value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await completeConsultation(appointment._id, formData);
            onSuccess();
            onClose();
        } catch (error) {
            alert("Failed to save consultation");
        } finally {
            setLoading(false);
        }
    };

    // --- Styles (SaaS Clinical Workstation) ---
    const styles = {
        overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 },
        modal: { 
            width: '95%', maxWidth: '1200px', height: '90vh', backgroundColor: '#f8fafc', 
            borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        },
        
        // Header
        header: { 
            padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px'
        },
        patientBadge: { display: 'flex', alignItems: 'center', gap: '12px' },
        avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
        
        // Main Workspace (3 Columns)
        workspace: { flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 320px', overflow: 'hidden' },
        
        // Column 1: Context Sidebar
        sidebar: { padding: '20px', borderRight: '1px solid #e2e8f0', backgroundColor: '#fff', overflowY: 'auto' },
        sidebarSection: { marginBottom: '25px' },
        sidebarTitle: { fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' },
        infoItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#334155', marginBottom: '8px' },
        
        // Column 2: Clinical Editor (Center)
        editor: { padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflowY: 'auto' },
        toolbar: { display: 'flex', gap: '10px', marginBottom: '15px' },
        chip: { padding: '6px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' },
        
        mainInput: { 
            flex: 1, padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', 
            backgroundColor: 'white', fontSize: '1rem', lineHeight: '1.6', resize: 'none', 
            outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' 
        },
        
        // Column 3: Plan & Action (Right)
        actionsPanel: { padding: '24px', borderLeft: '1px solid #e2e8f0', backgroundColor: 'white', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
        inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
        label: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
        inputField: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.9rem' },
        
        // Footer
        footer: { padding: '16px 24px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' },
        
        // Buttons
        btnSecondary: { padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' },
        btnPrimary: { padding: '10px 24px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
        btnAI: { background: 'linear-gradient(135deg, #4f46e5, #9333ea)', color: 'white', border: 'none' },
        btnVideo: { backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                
                {/* --- HEADER --- */}
                <div style={styles.header}>
                    <div style={styles.patientBadge}>
                        <div style={styles.avatar}>{appointment.patientId?.name?.charAt(0) || 'P'}</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{appointment.patientId?.name || 'Unknown Patient'}</h2>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                                <span>{appointment.patientId?.gender || 'N/A'}, {appointment.patientId?.age || '--'} yrs</span>
                                <span>•</span>
                                <span style={{display:'flex', alignItems:'center', gap:'4px'}}><FiClock size={12}/> {appointment.timeSlot}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {appointment.type === 'Online' && (
                            <button onClick={handleJoinVideo} style={{ ...styles.btnPrimary, ...styles.btnVideo }}>
                                <FiVideo /> Start Video Call
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}><FiX /></button>
                    </div>
                </div>

                {/* --- WORKSPACE --- */}
                <div style={styles.workspace}>
                    
                    {/* LEFT: Context */}
                    <div style={styles.sidebar}>
                        <div style={styles.sidebarSection}>
                            <div style={styles.sidebarTitle}>Current Visit</div>
                            <div style={styles.infoItem}><strong>Reason:</strong> {appointment.reason}</div>
                            <div style={styles.infoItem}><strong>Type:</strong> {appointment.type}</div>
                        </div>

                        <div style={styles.sidebarSection}>
                            <div style={styles.sidebarTitle}>Vitals Input</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input placeholder="BP" name="bp" value={formData.vitals.bp} onChange={handleVitalChange} style={styles.inputField} />
                                <input placeholder="Pulse" name="pulse" value={formData.vitals.pulse} onChange={handleVitalChange} style={styles.inputField} />
                                <input placeholder="Temp °F" name="temp" value={formData.vitals.temp} onChange={handleVitalChange} style={styles.inputField} />
                                <input placeholder="Wt (kg)" name="weight" value={formData.vitals.weight} onChange={handleVitalChange} style={styles.inputField} />
                            </div>
                        </div>

                        <div style={styles.sidebarSection}>
                            <div style={styles.sidebarTitle}>History</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                                No previous history records found in this demo.
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Clinical Notes Editor */}
                    <div style={styles.editor}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiFileText /> Clinical Notes
                            </h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={toggleVoice} style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: '0.8rem', backgroundColor: isListening ? '#fee2e2' : 'white', color: isListening ? '#dc2626' : '#64748b', borderColor: isListening ? '#fca5a5' : '#e2e8f0' }}>
                                    {isListening ? <><FiMicOff /> Stop</> : <><FiMic /> Dictate</>}
                                </button>
                                <button type="button" onClick={handleGenerateAI} disabled={aiLoading} style={{ ...styles.btnPrimary, ...styles.btnAI, padding: '6px 16px', fontSize: '0.8rem' }}>
                                    {aiLoading ? <FiLoader className="spin" /> : <FiZap />} AI Draft
                                </button>
                            </div>
                        </div>

                        {/* Templates Toolbar */}
                        <div style={styles.toolbar}>
                            {Object.keys(NOTE_TEMPLATES).map(temp => (
                                <button key={temp} onClick={() => applyTemplate(temp)} style={styles.chip}>
                                    + {temp}
                                </button>
                            ))}
                        </div>

                        <textarea 
                            name="doctorNotes" 
                            value={formData.doctorNotes} 
                            onChange={handleChange} 
                            placeholder="Start typing or use a template / AI dictation..." 
                            style={styles.mainInput} 
                        />
                    </div>

                    {/* RIGHT: Plan & Rx */}
                    <div style={styles.actionsPanel}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Diagnosis (ICD-10)</label>
                            <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="e.g. Acute Viral Fever" style={styles.inputField} />
                        </div>

                        <div style={{ ...styles.inputGroup, flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={styles.label}>Prescription Plan</label>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Quick Add:</span>
                            </div>
                            {/* Quick Rx Chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                {QUICK_RX.map((rx, i) => (
                                    <span key={i} onClick={() => addQuickRx(rx)} style={{ ...styles.chip, fontSize: '0.75rem', backgroundColor: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                                        {rx}
                                    </span>
                                ))}
                            </div>
                            <textarea 
                                name="prescription" 
                                value={formData.prescription} 
                                onChange={handleChange} 
                                placeholder="Rx details..." 
                                style={{ ...styles.inputField, flex: 1, resize: 'none', fontFamily: 'inherit' }} 
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Outcome</label>
                            <select name="outcome" value={formData.outcome} onChange={handleChange} style={styles.inputField}>
                                <option value="Pending">Select Outcome...</option>
                                <option value="Improved">Improved</option>
                                <option value="Stable">Stable</option>
                                <option value="Worsening">Worsening</option>
                                <option value="Referral">Referral Required</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div style={styles.footer}>
                    <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={loading} style={styles.btnPrimary}>
                        {loading ? 'Finalizing...' : <><FiCheck /> Finalize Consultation</>}
                    </button>
                </div>

            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ConsultationModal;