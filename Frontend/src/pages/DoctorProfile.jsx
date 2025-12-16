import React, { useState, useEffect } from 'react';
import { getDoctorProfileMe, updateDoctorProfile } from '../services/api';

const DoctorProfile = () => {
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

    // Initial Data Fetch
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
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Slot Management
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

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(q => q !== '')
            };

            await updateDoctorProfile(payload);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Update error", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Styles ---
    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        paddingBottom: '40px'
    };

    const sectionStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #eee',
        marginBottom: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    };

    const headerTitle = {
        fontSize: '1.5rem',
        color: '#2c3e50',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    };

    const formGrid = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    };

    const fullWidth = {
        gridColumn: '1 / -1'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#34495e'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };

    const textAreaStyle = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical'
    };

    const buttonStyle = {
        padding: '14px 28px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: saving ? 'wait' : 'pointer',
        opacity: saving ? 0.7 : 1
    };

    const messageBox = (type) => ({
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
        color: type === 'success' ? '#155724' : '#721c24',
        border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
    });

    const slotRow = {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        alignItems: 'center'
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div style={containerStyle}>
            <h1 style={{ marginBottom: '20px', color: '#2c3e50' }}>Edit Profile</h1>

            {message.text && (
                <div style={messageBox(message.type)}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* 1. Professional Details */}
                <div style={sectionStyle}>
                    <h2 style={headerTitle}>Professional Details</h2>
                    <div style={formGrid}>
                        <div>
                            <label style={labelStyle}>Specialization</label>
                            <input
                                type="text" name="specialization"
                                value={formData.specialization} onChange={handleChange}
                                placeholder="e.g. Cardiologist" required style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Years of Experience</label>
                            <input
                                type="number" name="experience"
                                value={formData.experience} onChange={handleChange}
                                min="0" required style={inputStyle}
                            />
                        </div>
                        <div style={fullWidth}>
                            <label style={labelStyle}>Qualifications (comma separated)</label>
                            <input
                                type="text" name="qualifications"
                                value={formData.qualifications} onChange={handleChange}
                                placeholder="e.g. MBBS, MD, FACC" required style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Consultation Fee (₹)</label>
                            <input
                                type="number" name="fees"
                                value={formData.fees} onChange={handleChange}
                                min="0" required style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Clinic Info */}
                <div style={sectionStyle}>
                    <h2 style={headerTitle}>Clinic Information</h2>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Clinic Address</label>
                        <input
                            type="text" name="clinicAddress"
                            value={formData.clinicAddress} onChange={handleChange}
                            required style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>About / Bio</label>
                        <textarea
                            name="about"
                            value={formData.about} onChange={handleChange}
                            placeholder="Tell patients about yourself..."
                            style={textAreaStyle}
                        />
                    </div>
                </div>

                {/* 3. Availability */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ ...headerTitle, borderBottom: 'none', marginBottom: 0 }}>Availability Slots</h2>
                        <button
                            type="button"
                            onClick={addSlot}
                            style={{ ...buttonStyle, padding: '8px 16px', fontSize: '0.9rem', backgroundColor: '#27ae60' }}
                        >
                            + Add Slot
                        </button>
                    </div>

                    {formData.availableSlots.length === 0 && (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No slots added. You won't appear in search results.</p>
                    )}

                    {formData.availableSlots.map((slot, index) => (
                        <div key={index} style={slotRow}>
                            <select
                                value={slot.day}
                                onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                                style={{ ...inputStyle, width: '150px' }}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>

                            <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                                style={inputStyle}
                            />
                            <span style={{ color: '#7f8c8d' }}>to</span>
                            <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                                style={inputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => removeSlot(index)}
                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px' }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <button type="submit" style={buttonStyle} disabled={saving}>
                    {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default DoctorProfile;