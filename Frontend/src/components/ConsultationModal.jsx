import React, { useState, useEffect } from 'react';
import { completeConsultation, generateSOAPNotes } from '../services/api';
import { FiMic, FiMicOff, FiVideo, FiX, FiCheck, FiActivity, FiCpu, FiLoader } from 'react-icons/fi';

const ConsultationModal = ({ appointment, onClose, onSuccess }) => {
    if (!appointment) return null;

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
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
                // Append to existing notes
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

    // --- AI Logic ---
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

            // Smart Merge of AI Data
            setFormData(prev => ({
                ...prev,
                // Append AI Subjective/Objective/Assessment to notes if needed, or just replace
                doctorNotes: `SUBJECTIVE: ${data.subjective}\n\nOBJECTIVE: ${data.objective}\n\nASSESSMENT: ${data.assessment}\n\nPLAN: ${data.plan}`,
                diagnosis: data.assessment.split('.')[0], // Guess the first sentence as diagnosis
                prescription: data.plan
            }));

        } catch (error) {
            console.error(error);
            alert("AI Generation failed. Please try again.");
        } finally {
            setAiLoading(false);
        }
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

    // --- Styles ---
    const overlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 };
    const modal = { width: '90%', maxWidth: '900px', height: '85vh', backgroundColor: 'white', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
    const header = { padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const body = { padding: '24px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' };
    const sectionTitle = { fontSize: '0.9rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' };
    const input = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px' };
    const textarea = { ...input, minHeight: '150px', resize: 'vertical', fontFamily: 'inherit' };

    return (
        <div style={overlay}>
            <div style={modal}>
                <div style={header}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Consultation: {appointment.patientId?.name}</h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{appointment.type} Visit • {appointment.timeSlot}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {appointment.videoLink && (
                            <a href={appointment.videoLink} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#e0f2fe', color: '#0284c7', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiVideo /> Join Video
                            </a>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><FiX /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={body}>
                        {/* LEFT COLUMN: Notes & Vitals */}
                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={sectionTitle}>Clinical Notes</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="button" onClick={toggleVoice} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: isListening ? '#fee2e2' : '#f1f5f9', color: isListening ? '#dc2626' : '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                                            {isListening ? <><FiMicOff /> Stop Recording</> : <><FiMic /> Voice Note</>}
                                        </button>
                                        <button type="button" onClick={handleGenerateAI} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                                            {aiLoading ? <FiLoader className="spin" /> : <FiCpu />} Generate SOAP
                                        </button>
                                    </div>
                                </div>
                                <textarea name="doctorNotes" value={formData.doctorNotes} onChange={handleChange} placeholder="Type or speak raw observations, then click 'Generate SOAP'..." style={textarea} />
                            </div>

                            <div>
                                <div style={sectionTitle}><FiActivity style={{ marginRight: '5px' }} /> Vitals</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input placeholder="BP (e.g. 120/80)" name="bp" value={formData.vitals.bp} onChange={handleVitalChange} style={input} />
                                    <input placeholder="Pulse (bpm)" name="pulse" value={formData.vitals.pulse} onChange={handleVitalChange} style={input} />
                                    <input placeholder="Temp (°F)" name="temp" value={formData.vitals.temp} onChange={handleVitalChange} style={input} />
                                    <input placeholder="Weight (kg)" name="weight" value={formData.vitals.weight} onChange={handleVitalChange} style={input} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Assessment & Plan */}
                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={sectionTitle}>Diagnosis (ICD-10)</div>
                                <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Primary diagnosis..." style={input} />
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                                <div style={sectionTitle}>Prescription / Plan</div>
                                <textarea name="prescription" value={formData.prescription} onChange={handleChange} placeholder="Rx: Medication name, dosage, frequency..." style={{ ...textarea, flex: 1 }} />
                            </div>

                            <div>
                                <div style={sectionTitle}>Visit Outcome</div>
                                <select 
                                    name="outcome" 
                                    value={formData.outcome || 'Pending'} 
                                    onChange={handleChange}
                                    style={{ ...input, cursor: 'pointer', backgroundColor: '#f8fafc' }}
                                >
                                    <option value="Pending">Select Outcome...</option>
                                    <option value="Improved">🟢 Improved</option>
                                    <option value="Stable">🟡 Stable</option>
                                    <option value="Worsening">🔴 Worsening</option>
                                    <option value="Referral">🔵 Referral Needed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '12px 24px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '12px 30px', border: 'none', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? 'Saving...' : <><FiCheck /> Complete Visit</>}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ConsultationModal;