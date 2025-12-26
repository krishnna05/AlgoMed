import React, { useState, useEffect, useMemo } from 'react';
import { getDoctorProfileMe, updateDoctorProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FiUser, FiMapPin, FiClock, FiAward, FiGlobe, FiLinkedin,
    FiLink, FiSave, FiCheckCircle, FiTrash2, FiPlus, FiAlertCircle, FiLoader, FiCheck
} from 'react-icons/fi';

const DoctorProfile = () => {
    const { user } = useAuth();

    // --- State Management ---
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await getDoctorProfileMe();
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

    const profileStrength = useMemo(() => {
        let score = 0;
        if (formData.specialization) score += 15;
        if (formData.experience) score += 10;
        if (formData.qualifications.length > 0) score += 10;
        if (formData.languages.length > 0) score += 5;
        if (formData.clinicAddress) score += 15;
        if (formData.fees) score += 10;
        if (formData.about.length > 20) score += 15;
        if (formData.availableSlots.length > 0) score += 15;
        if (formData.awards.length > 0) score += 5;
        return Math.min(score, 100);
    }, [formData]);

    // --- Handlers ---
    const handleChange = (e) => {
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
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(tag => tag !== tagToRemove)
        }));
    };

    // --- Slot Handlers ---
    const addSlot = () => {
        setFormData(prev => ({
            ...prev,
            availableSlots: [...prev.availableSlots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
        }));
    };

    const removeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            availableSlots: prev.availableSlots.filter((_, i) => i !== index)
        }));
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...formData.availableSlots];
        newSlots[index][field] = value;
        setFormData(prev => ({ ...prev, availableSlots: newSlots }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateDoctorProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            if (window.innerWidth > 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
        <div className="tag-container">
            {formData[field].map((tag, i) => (
                <span key={i} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => removeTag(field, tag)} className="tag-remove">×</button>
                </span>
            ))}
            <input
                placeholder={placeholder}
                onKeyDown={(e) => handleTagInput(e, field)}
                className="tag-input"
            />
        </div>
    );

    if (loading) return (
        <div className="loading-state">
            <FiLoader className="spinner" /> <span>Loading Profile...</span>
        </div>
    );

    return (
        <div className="page-wrapper">
            <style>{`
                :root {
                    --primary: #2563eb;
                    --primary-dark: #1d4ed8;
                    --bg-page: #f1f5f9;
                    --bg-card: #ffffff;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --border-color: #e2e8f0;
                    --input-bg: #f8fafc;
                    --success-green: #10b981;
                    --radius: 8px;
                }

                * { box-sizing: border-box; }
                body { background-color: var(--bg-page); font-family: 'Inter', system-ui, sans-serif; color: var(--text-main); margin: 0; }

                .page-wrapper {
                    padding: 40px 20px;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .header-wrapper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .page-title { font-size: 29px; font-weight: 800; color: var(--text-main); margin: 0; }
                .page-subtitle { color: var(--text-muted); margin: 4px 0 0; font-size: 15px; }

                .btn {
                    padding: 10px 20px;
                    border-radius: var(--radius);
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                .btn-primary { background: var(--primary); color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .btn-primary:hover { background: var(--primary-dark); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .desktop-save-btn { display: flex; }
                .mobile-save-btn { display: none; margin-top: 30px; width: 100%; padding: 14px; font-size: 16px; }

                .strength-banner {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius);
                    padding: 16px 24px;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .strength-info { flex: 1; }
                .strength-label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
                .strength-bar-bg { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
                .strength-bar-fill { height: 100%; background: var(--success-green); border-radius: 4px; transition: width 0.6s ease; }
                .strength-icon { width: 40px; height: 40px; border-radius: 50%; background: #d1fae5; color: var(--success-green); display: flex; align-items: center; justify-content: center; font-size: 20px; }

                .tabs-nav {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 1px;
                }
                .tab-item {
                    padding: 10px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-muted);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s;
                }
                .tab-item:hover { color: var(--primary); }
                .tab-item.active { color: var(--primary); font-weight: 600; }
                .tab-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary);
                }

                .content-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius);
                    padding: 32px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                }
                .section-title { font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0; }
                .section-icon { color: var(--primary); font-size: 20px; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-full { grid-column: span 2; }
                
                .form-group { margin-bottom: 20px; }
                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 8px;
                }
                .saas-input, .saas-textarea, .saas-select {
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 14px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius);
                    background-color: var(--input-bg);
                    color: var(--text-main);
                    transition: border-color 0.2s, background-color 0.2s;
                }
                .saas-input:focus, .saas-textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background-color: #fff;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                .saas-textarea { min-height: 120px; resize: vertical; }

                .tag-container {
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius);
                    padding: 8px;
                    background: var(--input-bg);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    min-height: 48px;
                }
                .tag-chip {
                    background: white;
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .tag-remove { border: none; background: none; color: #94a3b8; cursor: pointer; font-size: 16px; display: flex; align-items: center; }
                .tag-remove:hover { color: #ef4444; }
                .tag-input { border: none; outline: none; background: transparent; flex: 1; font-size: 14px; min-width: 120px; padding: 4px; }

                /* Slots */
                .slot-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 20px 1fr 50px;
                    gap: 12px;
                    align-items: center;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius);
                    margin-bottom: 12px;
                }
                .slot-separator { text-align: center; color: var(--text-muted); }
                .btn-icon-danger {
                    color: #ef4444; background: white; border: 1px solid #fee2e2;
                    width: 36px; height: 36px; border-radius: var(--radius);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.2s;
                }
                .btn-icon-danger:hover { background: #fee2e2; }
                
                .btn-add-slot {
                    width: 100%;
                    padding: 12px;
                    border: 2px dashed var(--border-color);
                    background: white;
                    color: var(--primary);
                    border-radius: var(--radius);
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: 0.2s;
                }
                .btn-add-slot:hover { border-color: var(--primary); background: #eff6ff; }

                .alert-box {
                    padding: 16px; border-radius: var(--radius);
                    margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
                    font-size: 14px; font-weight: 500;
                }
                .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
                .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

                .loading-state {
                    display: flex; justify-content: center; align-items: center; height: 300px;
                    color: var(--text-muted); gap: 10px;
                }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .page-wrapper {
                        width: 125%; 
                        transform: scale(0.8);
                        transform-origin: top left;
                        margin-bottom: -20%; 
                    }

                    .form-grid { grid-template-columns: 1fr; }
                    .form-full { grid-column: auto; }
                    
                    .header-wrapper { flex-direction: column; align-items: flex-start; gap: 16px; }
                    
                    .desktop-save-btn { display: none; }
                    
                    .mobile-save-btn { display: flex; }
                    
                    .slot-row { grid-template-columns: 1fr; gap: 8px; padding: 12px; position: relative; }
                    .slot-separator { display: none; }
                    .btn-icon-danger { position: absolute; top: 10px; right: 10px; }
                }
            `}</style>

            <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div className="header-wrapper">
                    <div>
                        <h1 className="page-title">Doctor Settings</h1>
                        <p className="page-subtitle">Manage your profile, clinic details, and consultation slots.</p>
                    </div>
                    <div className="desktop-save-btn">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <FiLoader className="spinner" /> : <FiSave />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />} {message.text}
                    </div>
                )}

                <div className="strength-banner">
                    <div className="strength-icon">
                        {profileStrength === 100 ? <FiCheck /> : <FiAward />}
                    </div>
                    <div className="strength-info">
                        <div className="strength-label">
                            <span>Profile Completeness</span>
                            <span>{profileStrength}%</span>
                        </div>
                        <div className="strength-bar-bg">
                            <div className="strength-bar-fill" style={{ width: `${profileStrength}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="tabs-nav">
                    {['general', 'clinic', 'social'].map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab === 'general' ? 'General Info' : tab === 'clinic' ? 'Clinic & Schedule' : 'Social & Awards'}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {activeTab === 'general' && (
                        <div className="content-card">
                            <div className="section-header">
                                <FiUser className="section-icon" />
                                <h3 className="section-title">Professional Information</h3>
                            </div>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="saas-input"
                                        placeholder="e.g. Cardiologist"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="saas-input"
                                    />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Professional Bio</label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        className="saas-textarea"
                                        placeholder="Brief summary of your medical career..."
                                    />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Qualifications (Press Enter to add)</label>
                                    {renderTags('qualifications', 'e.g. MBBS, MD...')}
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Languages Spoken</label>
                                    {renderTags('languages', 'e.g. English, Spanish...')}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clinic' && (
                        <>
                            <div className="content-card">
                                <div className="section-header">
                                    <FiMapPin className="section-icon" />
                                    <h3 className="section-title">Clinic Details</h3>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group form-full">
                                        <label className="form-label">Clinic Address</label>
                                        <input
                                            name="clinicAddress"
                                            value={formData.clinicAddress}
                                            onChange={handleChange}
                                            className="saas-input"
                                            placeholder="Full address of your clinic"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Consultation Fee (₹)</label>
                                        <input
                                            type="number"
                                            name="fees"
                                            value={formData.fees}
                                            onChange={handleChange}
                                            className="saas-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="section-header">
                                    <FiClock className="section-icon" />
                                    <h3 className="section-title">Weekly Availability</h3>
                                </div>
                                {formData.availableSlots.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
                                        No slots configured. Add a slot to start accepting appointments.
                                    </div>
                                )}
                                {formData.availableSlots.map((slot, index) => (
                                    <div key={index} className="slot-row">
                                        <select
                                            value={slot.day}
                                            onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                                            className="saas-select"
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                                            className="saas-input"
                                        />
                                        <span className="slot-separator">-</span>
                                        <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                                            className="saas-input"
                                        />
                                        <button type="button" onClick={() => removeSlot(index)} className="btn-icon-danger" title="Remove Slot">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addSlot} className="btn-add-slot">
                                    <FiPlus /> Add New Availability Slot
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'social' && (
                        <div className="content-card">
                            <div className="section-header">
                                <FiGlobe className="section-icon" />
                                <h3 className="section-title">Social & Recognition</h3>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Awards & Honors</label>
                                {renderTags('awards', 'Add award...')}
                            </div>
                            <div className="form-grid" style={{ marginTop: '24px' }}>
                                <div className="form-group form-full">
                                    <label className="form-label"><FiGlobe style={{ marginRight: 6 }} /> Website URL</label>
                                    <input
                                        name="socialLinks.website"
                                        value={formData.socialLinks.website}
                                        onChange={handleChange}
                                        className="saas-input"
                                        placeholder="https://"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiLinkedin style={{ marginRight: 6 }} /> LinkedIn</label>
                                    <input
                                        name="socialLinks.linkedin"
                                        value={formData.socialLinks.linkedin}
                                        onChange={handleChange}
                                        className="saas-input"
                                        placeholder="Profile URL"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiLink style={{ marginRight: 6 }} /> Twitter / X</label>
                                    <input
                                        name="socialLinks.twitter"
                                        value={formData.socialLinks.twitter}
                                        onChange={handleChange}
                                        className="saas-input"
                                        placeholder="@handle"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary mobile-save-btn" disabled={saving}>
                        {saving ? <FiLoader className="spinner" /> : <FiSave />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorProfile;