import React, { useState, useEffect } from 'react';
import { getDoctorProfileMe, updateDoctorProfile } from '../services/api';

const DoctorProfile = () => {
    // --- State Management ---
    const [formData, setFormData] = useState({
        specialization: '',
        experience: 0,
        qualifications: '',
        fees: 0,
        clinicAddress: '',
        about: '',
        availableSlots: []
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- Effects ---
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getDoctorProfileMe();
            if (res.data) {
                setFormData({
                    specialization: res.data.specialization || '',
                    experience: res.data.experience || 0,
                    qualifications: res.data.qualifications ? res.data.qualifications.join(', ') : '',
                    fees: res.data.fees || 0,
                    clinicAddress: res.data.clinicAddress || '',
                    about: res.data.about || '',
                    availableSlots: res.data.availableSlots || []
                });
            }
        } catch (error) {
            console.error("Error fetching profile", error);
            setMessage({ type: 'error', text: 'Could not load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSlot = () => {
        setFormData(prev => ({
            ...prev,
            availableSlots: [...prev.availableSlots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
        }));
    };

    const removeSlot = (index) => {
        const newSlots = formData.availableSlots.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, availableSlots: newSlots }));
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
            const payload = {
                ...formData,
                qualifications: typeof formData.qualifications === 'string' 
                    ? formData.qualifications.split(',').map(q => q.trim()).filter(q => q !== '')
                    : formData.qualifications
            };

            await updateDoctorProfile(payload);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Update error", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Modern Styling System ---
    const styles = {
        pageContainer: {
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            padding: '40px 20px',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        contentWrapper: {
            maxWidth: '850px',
            margin: '0 auto',
        },
        header: {
            marginBottom: '30px',
            textAlign: 'left',
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px',
        },
        subtitle: {
            color: '#6b7280',
            fontSize: '1rem',
        },
        card: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            padding: '32px',
            marginBottom: '24px',
            border: '1px solid #f3f4f6',
        },
        sectionTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            paddingBottom: '12px',
            borderBottom: '2px solid #f3f4f6',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
        },
        fullWidth: {
            gridColumn: '1 / -1',
            width: '100%',
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
            display: 'block', // Ensures label sits above input
        },
        input: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            color: '#1f2937',
            backgroundColor: '#fff',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
            width: '100%', // Ensures input fills the container
            boxSizing: 'border-box', // Prevents padding from breaking layout
        },
        textarea: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            color: '#1f2937',
            minHeight: '120px',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            width: '100%', // Ensures textarea fills the container
            boxSizing: 'border-box',
        },
        buttonPrimary: {
            backgroundColor: '#2563eb', // Modern blue
            color: 'white',
            fontWeight: '600',
            padding: '14px 28px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'background-color 0.2s, transform 0.1s',
            width: '100%',
            marginTop: '10px',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
        },
        buttonSecondary: {
            backgroundColor: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        slotRow: {
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 0.2fr 1fr 0.5fr',
            gap: '12px',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb',
        },
        removeBtn: {
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '4px',
        },
        alert: (type) => ({
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }),
        helperText: {
            fontSize: '0.8rem',
            color: '#9ca3af',
            marginTop: '4px',
        }
    };

    // Helper to add focus styles
    const handleFocus = (e) => {
        e.target.style.borderColor = '#2563eb';
        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
    };

    if (loading) {
        return (
            <div style={{ ...styles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading your profile...</div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Doctor Profile</h1>
                    <p style={styles.subtitle}>Manage your public profile, clinic details, and consultation hours.</p>
                </div>

                {message.text && (
                    <div style={styles.alert(message.type)}>
                        {message.type === 'success' ? '✓' : '⚠'} &nbsp; {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Professional Details Card */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Professional Information</h2>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Specialization</label>
                                <input
                                    type="text" name="specialization"
                                    value={formData.specialization} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    placeholder="e.g. Cardiologist" required style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Experience (Years)</label>
                                <input
                                    type="number" name="experience"
                                    value={formData.experience} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    min="0" required style={styles.input}
                                />
                            </div>
                            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                <label style={styles.label}>Qualifications</label>
                                <input
                                    type="text" name="qualifications"
                                    value={formData.qualifications} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    placeholder="e.g. MBBS, MD, FACC" required style={styles.input}
                                />
                                <span style={styles.helperText}>Separate multiple qualifications with commas.</span>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Consultation Fee (₹)</label>
                                <input
                                    type="number" name="fees"
                                    value={formData.fees} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    min="0" required style={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Clinic Info Card */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Clinic Details</h2>
                        <div style={styles.grid}>
                            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                <label style={styles.label}>Clinic Address</label>
                                <input
                                    type="text" name="clinicAddress"
                                    value={formData.clinicAddress} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    placeholder="Full address of your clinic"
                                    required style={styles.input}
                                />
                            </div>
                            <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                                <label style={styles.label}>About / Bio</label>
                                <textarea
                                    name="about"
                                    value={formData.about} onChange={handleChange}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                    placeholder="Write a brief bio about your expertise and background..."
                                    style={styles.textarea}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Availability Card */}
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
                            <h2 style={{ ...styles.sectionTitle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Availability Slots</h2>
                            <button
                                type="button"
                                onClick={addSlot}
                                style={styles.buttonSecondary}
                            >
                                + Add New Slot
                            </button>
                        </div>

                        {formData.availableSlots.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                <p>No availability slots configured.</p>
                                <p style={{ fontSize: '0.85rem' }}>Add slots to allow patients to book appointments.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {formData.availableSlots.map((slot, index) => (
                                    <div key={index} style={styles.slotRow}>
                                        <select
                                            value={slot.day}
                                            onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                                            style={styles.input}
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>

                                        <input
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                                            style={styles.input}
                                        />
                                        <span style={{ textAlign: 'center', color: '#6b7280' }}>to</span>
                                        <input
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                                            style={styles.input}
                                        />

                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(index)}
                                                style={styles.removeBtn}
                                                title="Remove Slot"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div style={{ marginTop: '30px', marginBottom: '60px' }}>
                        <button 
                            type="submit" 
                            style={styles.buttonPrimary} 
                            disabled={saving}
                            onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#1d4ed8')}
                            onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#2563eb')}
                        >
                            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default DoctorProfile;