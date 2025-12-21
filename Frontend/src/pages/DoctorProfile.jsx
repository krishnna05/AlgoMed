import React, { useState, useEffect, useMemo } from 'react';
import { getDoctorProfileMe, updateDoctorProfile } from '../services/api';
import { useAuth } from '../context/AuthContext'; 
import { 
    FiUser, FiMapPin, FiClock, FiAward, FiGlobe, FiLinkedin, 
    FiLink, FiSave, FiCheckCircle, FiTrash2, FiPlus, FiDatabase, FiAlertCircle 
} from 'react-icons/fi';

// --- DEMO DATA ---
const DEMO_DOCTOR_DATA = {
    specialization: 'Interventional Cardiologist',
    experience: 15,
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC', 'FESC'],
    languages: ['English', 'Hindi', 'German', 'Spanish'],
    awards: ['Best Cardiologist 2024', 'Healthcare Excellence Award', 'Top Rated Physician'],
    fees: 1500,
    clinicAddress: 'Heart Care Center, Building 45, Cyber City, Gurugram',
    about: 'Dr. Sharma is a senior interventional cardiologist with over 15 years of experience in managing complex heart conditions. He specializes in angioplasty, pacemaker implantation, and preventive cardiology. Dedicated to providing compassionate and evidence-based care to all patients.',
    availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
        { day: 'Friday', startTime: '10:00', endTime: '14:00' }
    ],
    socialLinks: {
        website: 'https://drsharmaheartcare.com',
        linkedin: 'https://linkedin.com/in/drsharma-demo',
        twitter: '@drsharma_cardio'
    }
};

const DoctorProfile = () => {
    const { user } = useAuth(); // Get logged-in user details
    
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDemoMode, setIsDemoMode] = useState(false);

    const [formData, setFormData] = useState({
        specialization: '',
        experience: 0,
        qualifications: [],
        languages: [],
        awards: [],
        fees: 0,
        clinicAddress: '',
        about: '',
        availableSlots: [],
        socialLinks: { website: '', linkedin: '', twitter: '' }
    });

    // --- Effects ---
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await getDoctorProfileMe(); //
            if (res.data) {
                setFormData({
                    specialization: res.data.specialization || '',
                    experience: res.data.experience || 0,
                    qualifications: res.data.qualifications || [],
                    languages: res.data.languages || [],
                    awards: res.data.awards || [],
                    fees: res.data.fees || 0,
                    clinicAddress: res.data.clinicAddress || '',
                    about: res.data.about || '',
                    availableSlots: res.data.availableSlots || [],
                    socialLinks: { 
                        website: res.data.socialLinks?.website || '',
                        linkedin: res.data.socialLinks?.linkedin || '',
                        twitter: res.data.socialLinks?.twitter || ''
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile", error);
            setMessage({ type: 'error', text: 'Could not load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Demo Mode Handler ---
    const toggleDemoData = () => {
        if (isDemoMode) {
            // Exit Demo Mode -> Reload Real Data
            setIsDemoMode(false);
            setMessage({ type: '', text: '' });
            fetchProfile();
        } else {
            // Enter Demo Mode -> Load Fake Data
            setIsDemoMode(true);
            setFormData(prev => ({
                ...prev,
                ...DEMO_DOCTOR_DATA
            }));
            setMessage({ type: 'info', text: 'Demo Mode Active: You are viewing sample data. Changes cannot be saved.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- Computed: Profile Strength ---
    const profileStrength = useMemo(() => {
        let score = 0;
        if (formData.specialization) score += 15;
        if (formData.experience) score += 10;
        if (formData.qualifications.length > 0) score += 10;
        if (formData.languages.length > 0) score += 5;
        if (formData.clinicAddress) score += 15;
        if (formData.fees) score += 10;
        if (formData.about.length > 50) score += 15;
        if (formData.availableSlots.length > 0) score += 15;
        if (formData.awards.length > 0) score += 5;
        return Math.min(score, 100);
    }, [formData]);

    // --- Handlers ---
    const handleChange = (e) => {
        if (isDemoMode) return;
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTagInput = (e, field) => {
        if (isDemoMode) return;
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val && !formData[field].includes(val)) {
                setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
            }
            e.target.value = '';
        }
    };

    const removeTag = (field, tagToRemove) => {
        if (isDemoMode) return;
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(tag => tag !== tagToRemove)
        }));
    };

    // --- Slot Handlers ---
    const addSlot = () => {
        if (isDemoMode) return;
        setFormData(prev => ({
            ...prev,
            availableSlots: [...prev.availableSlots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
        }));
    };

    const removeSlot = (index) => {
        if (isDemoMode) return;
        setFormData(prev => ({
            ...prev,
            availableSlots: prev.availableSlots.filter((_, i) => i !== index)
        }));
    };

    const handleSlotChange = (index, field, value) => {
        if (isDemoMode) return;
        const newSlots = [...formData.availableSlots];
        newSlots[index][field] = value;
        setFormData(prev => ({ ...prev, availableSlots: newSlots }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDemoMode) {
            alert("Please exit Demo Mode to save changes.");
            return;
        }
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateDoctorProfile(formData); //
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Update error", error);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Render Helpers ---
    const renderTags = (field, placeholder) => (
        <div style={styles.tagContainer}>
            {formData[field].map((tag, i) => (
                <span key={i} style={styles.tag}>
                    {tag} 
                    {!isDemoMode && <button type="button" onClick={() => removeTag(field, tag)} style={styles.tagRemove}>×</button>}
                </span>
            ))}
            {!isDemoMode && (
                <input 
                    placeholder={placeholder} 
                    onKeyDown={(e) => handleTagInput(e, field)} 
                    style={styles.tagInput} 
                />
            )}
        </div>
    );

    // --- Styles ---
    const styles = {
        page: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
        
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
        title: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 },
        subtitle: { color: '#64748b', marginTop: '8px' },
        
        container: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' },
        
        tabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '1px' },
        tabBtn: (active) => ({
            padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
            color: active ? '#3b82f6' : '#64748b', fontWeight: '600', fontSize: '0.95rem',
            transition: 'all 0.2s'
        }),

        card: { backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '24px' },
        sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },

        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' },
        input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: isDemoMode ? '#f8fafc' : 'white', cursor: isDemoMode ? 'not-allowed' : 'text' },
        textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', minHeight: '120px', resize: 'vertical', backgroundColor: isDemoMode ? '#f8fafc' : 'white', cursor: isDemoMode ? 'not-allowed' : 'text' },

        tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '48px', backgroundColor: isDemoMode ? '#f8fafc' : 'white' },
        tag: { backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
        tagRemove: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', padding: 0 },
        tagInput: { border: 'none', outline: 'none', flex: 1, minWidth: '120px', fontSize: '0.95rem', backgroundColor: 'transparent' },

        slotRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.2fr 1fr 0.5fr', gap: '10px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' },
        
        previewCard: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'sticky', top: '20px' },
        previewHeader: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '30px 20px', textAlign: 'center', color: 'white' },
        previewAvatar: { width: '80px', height: '80px', backgroundColor: 'white', color: '#3b82f6', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
        previewBody: { padding: '24px' },
        previewStat: { textAlign: 'center', flex: 1 },
        
        strengthContainer: { padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bbf7d0' },
        progressBar: { height: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' },
        progressFill: { height: '100%', backgroundColor: '#16a34a', width: `${profileStrength}%`, transition: 'width 0.5s' },

        btnPrimary: { padding: '12px 24px', backgroundColor: isDemoMode ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isDemoMode ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' },
        demoBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #6366f1', backgroundColor: isDemoMode ? '#e0e7ff' : 'white', color: '#6366f1', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }
    };

    if (loading && !isDemoMode) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Profile...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Doctor Settings</h1>
                    <p style={styles.subtitle}>Customize your professional presence and clinic details.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isDemoMode && (
                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid #fcd34d' }}>
                            DEMO MODE ACTIVE
                        </span>
                    )}
                    <button onClick={toggleDemoData} style={styles.demoBtn} type="button">
                        <FiDatabase /> {isDemoMode ? 'Exit Demo' : 'Load Demo Data'}
                    </button>
                </div>
            </div>

            {message.text && (
                <div style={{ padding: '10px 20px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#e0f2fe', color: message.type === 'success' ? '#166534' : '#0369a1', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />} {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={styles.container}>
                    
                    {/* --- LEFT COLUMN --- */}
                    <div>
                        {/* Tabs */}
                        <div style={styles.tabs}>
                            <button type="button" onClick={() => setActiveTab('general')} style={styles.tabBtn(activeTab === 'general')}>General Info</button>
                            <button type="button" onClick={() => setActiveTab('clinic')} style={styles.tabBtn(activeTab === 'clinic')}>Clinic & Availability</button>
                            <button type="button" onClick={() => setActiveTab('social')} style={styles.tabBtn(activeTab === 'social')}>Social & Awards</button>
                        </div>

                        {/* TAB 1: GENERAL */}
                        {activeTab === 'general' && (
                            <div style={{ animation: 'fadeIn 0.3s' }}>
                                <div style={styles.card}>
                                    <div style={styles.sectionTitle}><FiUser /> Basic Information</div>
                                    <div style={styles.grid2}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Specialization</label>
                                            <input name="specialization" value={formData.specialization} onChange={handleChange} style={styles.input} placeholder="e.g. Cardiologist" readOnly={isDemoMode} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Experience (Years)</label>
                                            <input type="number" name="experience" value={formData.experience} onChange={handleChange} style={styles.input} readOnly={isDemoMode} />
                                        </div>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Professional Bio</label>
                                        <textarea name="about" value={formData.about} onChange={handleChange} style={styles.textarea} placeholder="Write a short bio about your expertise..." readOnly={isDemoMode} />
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <div style={styles.sectionTitle}><FiAward /> Qualifications & Languages</div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Qualifications (Press Enter to add)</label>
                                        {renderTags('qualifications', 'Add qualification (e.g. MBBS)...')}
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Languages Spoken (Press Enter to add)</label>
                                        {renderTags('languages', 'Add language (e.g. English, Hindi)...')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CLINIC & AVAILABILITY */}
                        {activeTab === 'clinic' && (
                            <div style={{ animation: 'fadeIn 0.3s' }}>
                                <div style={styles.card}>
                                    <div style={styles.sectionTitle}><FiMapPin /> Clinic Details</div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Clinic Address</label>
                                        <input name="clinicAddress" value={formData.clinicAddress} onChange={handleChange} style={styles.input} readOnly={isDemoMode} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Consultation Fee (₹)</label>
                                        <input type="number" name="fees" value={formData.fees} onChange={handleChange} style={styles.input} readOnly={isDemoMode} />
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={styles.sectionTitle}><FiClock /> Weekly Schedule</div>
                                        {!isDemoMode && (
                                            <button type="button" onClick={addSlot} style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <FiPlus /> Add Slot
                                            </button>
                                        )}
                                    </div>
                                    
                                    {formData.availableSlots.length === 0 && <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No slots configured.</div>}

                                    {formData.availableSlots.map((slot, index) => (
                                        <div key={index} style={styles.slotRow}>
                                            <select value={slot.day} onChange={(e) => handleSlotChange(index, 'day', e.target.value)} style={styles.input} disabled={isDemoMode}>
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <input type="time" value={slot.startTime} onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)} style={styles.input} readOnly={isDemoMode} />
                                            <span style={{ textAlign: 'center', color: '#64748b' }}>-</span>
                                            <input type="time" value={slot.endTime} onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)} style={styles.input} readOnly={isDemoMode} />
                                            {!isDemoMode && (
                                                <button type="button" onClick={() => removeSlot(index)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><FiTrash2 /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: SOCIAL & AWARDS */}
                        {activeTab === 'social' && (
                            <div style={{ animation: 'fadeIn 0.3s' }}>
                                <div style={styles.card}>
                                    <div style={styles.sectionTitle}><FiAward /> Awards & Recognitions</div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Awards (Press Enter to add)</label>
                                        {renderTags('awards', 'Add award (e.g. Best Cardiologist 2024)...')}
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <div style={styles.sectionTitle}><FiGlobe /> Social Presence</div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}><FiGlobe style={{ marginRight: '5px' }} /> Website</label>
                                        <input name="socialLinks.website" value={formData.socialLinks.website} onChange={handleChange} style={styles.input} placeholder="https://..." readOnly={isDemoMode} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}><FiLinkedin style={{ marginRight: '5px' }} /> LinkedIn</label>
                                        <input name="socialLinks.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} style={styles.input} placeholder="LinkedIn Profile URL" readOnly={isDemoMode} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}><FiLink style={{ marginRight: '5px' }} /> Twitter / X</label>
                                        <input name="socialLinks.twitter" value={formData.socialLinks.twitter} onChange={handleChange} style={styles.input} placeholder="@username" readOnly={isDemoMode} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: PREVIEW & STRENGTH --- */}
                    <div>
                        {/* Profile Strength Widget */}
                        <div style={styles.strengthContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: '#166534' }}>Profile Strength</span>
                                <span style={{ fontWeight: '800', color: '#16a34a' }}>{profileStrength}%</span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill}></div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '10px' }}>
                                {profileStrength < 100 ? "Add a bio, awards, and more slots to reach 100%." : "Excellent! Your profile is top-notch."}
                            </p>
                        </div>

                        {/* Live Preview Card */}
                        <div style={styles.previewCard}>
                            <div style={styles.previewHeader}>
                                <div style={styles.previewAvatar}>Dr</div>
                                <h3 style={{ margin: 0 }}>Dr. {isDemoMode ? 'Sharma' : (user?.name || 'Name')}</h3>
                                <p style={{ margin: '5px 0 0', opacity: 0.9 }}>{formData.specialization || 'Specialist'}</p>
                            </div>
                            <div style={styles.previewBody}>
                                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
                                    <div style={styles.previewStat}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{formData.experience} Yrs</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Experience</div>
                                    </div>
                                    <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                                    <div style={styles.previewStat}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>4.9 ★</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rating</div>
                                    </div>
                                    <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                                    <div style={styles.previewStat}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>₹{formData.fees}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fee</div>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>About</div>
                                    <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                                        {formData.about ? (formData.about.length > 80 ? formData.about.substring(0, 80) + '...' : formData.about) : 'No bio added yet.'}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {formData.languages.slice(0, 3).map((lang, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>{lang}</span>
                                    ))}
                                </div>

                                <button type="button" style={styles.btnPrimary} disabled>Book Appointment</button>
                                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>Preview Mode</div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={{ marginTop: '20px' }}>
                            <button type="submit" style={styles.btnPrimary} disabled={saving || isDemoMode}>
                                {saving ? 'Saving...' : (isDemoMode ? 'Exit Demo to Save' : <><FiSave /> Save Changes</>)}
                            </button>
                        </div>
                    </div>

                </div>
            </form>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default DoctorProfile;