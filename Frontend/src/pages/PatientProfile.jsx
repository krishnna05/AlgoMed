import React, { useState, useEffect, useMemo } from 'react';
import { getPatientProfile, updatePatientProfile } from '../services/api';
import { 
  FiSave, FiPrinter, FiActivity, FiAlertCircle, 
  FiUser, FiCheckCircle, FiInfo, FiTrash2, FiPlus, FiCheck 
} from 'react-icons/fi';

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    dateOfBirth: '', bloodGroup: '', height: '', weight: '',
    medicalHistory: [], allergies: [], currentMedications: [],
    lifestyle: { smoking: 'No', alcohol: 'No', activityLevel: 'Moderate' },
    emergencyContact: { name: '', phone: '', relation: '' }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (getPatientProfile) {
            const res = await getPatientProfile();
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    ...res.data,
                    dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
                    lifestyle: { ...prev.lifestyle, ...(res.data.lifestyle || {}) },
                    emergencyContact: { ...prev.emergencyContact, ...(res.data.emergencyContact || {}) },
                    medicalHistory: res.data.medicalHistory || [],
                    allergies: res.data.allergies || [],
                    currentMedications: res.data.currentMedications || []
                }));
            }
        }
      } catch (error) {
        console.error("Error fetching patient profile", error);
        setMessage({ type: 'error', text: 'Could not load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const bmiData = useMemo(() => {
    if (formData.height && formData.weight) {
        const h = formData.height / 100; 
        const val = (formData.weight / (h * h)).toFixed(1);
        
        let status = 'Unknown';
        let color = '#94a3b8';
        
        if (val < 18.5) { status = 'Underweight'; color = '#3b82f6'; }
        else if (val < 25) { status = 'Healthy Weight'; color = '#22c55e'; }
        else if (val < 30) { status = 'Overweight'; color = '#eab308'; }
        else { status = 'Obese'; color = '#ef4444'; }

        return { value: val, status, color };
    }
    return null;
  }, [formData.height, formData.weight]);

  const profileStrength = useMemo(() => {
    let score = 0;
    if (formData.dateOfBirth) score += 10;
    if (formData.bloodGroup) score += 10;
    if (formData.height && formData.weight) score += 20;
    if (formData.emergencyContact?.name) score += 20;
    if (formData.medicalHistory.length > 0) score += 10;
    if (formData.lifestyle?.activityLevel) score += 10;
    if (formData.lifestyle?.smoking) score += 20;
    return score;
  }, [formData]);

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleArrayChange = (field, index, subField, value) => {
    const updated = [...formData[field]];
    updated[index][subField] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const addItem = (field, item) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      if(updatePatientProfile) await updatePatientProfile(formData);
      setMessage({ type: 'success', text: 'Medical profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading Profile...</div>;

  // --- STYLES ---
  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px', fontSize: '14px' },
    
    // Cards
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '20px' },
    
    // Digital ID Card
    idCard: {
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px', padding: '20px', color: 'white',
        boxShadow: '0 8px 20px -5px rgba(30, 41, 59, 0.4)',
        position: 'relative', overflow: 'hidden', marginBottom: '20px'
    },
    
    // Inputs
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '4px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', transition: 'all 0.2s', boxSizing: 'border-box' },
    select: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: 'white', boxSizing: 'border-box' },
    
    // Section Headers
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' },
    sectionIcon: { color: '#3b82f6', fontSize: '1rem' },
    sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 },

    // Buttons
    btnPrimary: { padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
    btnSecondary: { padding: '8px 16px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' },
    btnSmall: { padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
    btnIcon: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s', padding: '4px', display: 'flex', alignItems: 'center' },

    // List Item Container
    listItem: { backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '8px', border: '1px solid #f1f5f9', padding: '10px' },
    
    // BMI Widget
    bmiWidget: { textAlign: 'center', padding: '16px', background: bmiData ? bmiData.color + '10' : '#f8fafc', borderRadius: '10px', border: `1px solid ${bmiData ? bmiData.color : '#e2e8f0'}` },
    bmiValue: { fontSize: '2rem', fontWeight: '800', color: bmiData ? bmiData.color : '#cbd5e1', lineHeight: 1, marginBottom: '4px' },
    bmiStatus: { fontSize: '0.85rem', fontWeight: '600', color: bmiData ? bmiData.color : '#94a3b8', textTransform: 'uppercase' },

    // Progress Bar
    progressBg: { height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '8px' },
    progressFill: { height: '100%', backgroundColor: '#22c55e', width: `${profileStrength}%`, transition: 'width 0.5s ease' }
  };

  return (
    <div className="mobile-scaler" style={styles.container}>
      
      {/* --- HEADER SECTION --- */}
      <div className="header-flex">
        <div style={{ flex: 1 }}>
            <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: '0', letterSpacing: '-1px' }}>Health Profile</h1>
            <p className="sub-title">Manage your medical history and vital stats securely.</p>
        </div>
        <div className="header-actions">
            <button type="button" onClick={handlePrint} style={styles.btnSecondary}>
                <FiPrinter /> Print
            </button>
            <button type="submit" form="profile-form" style={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : <><FiSave /> Save</>}
            </button>
        </div>
      </div>

      {message.text && (
          <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '8px' }}>
             {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />} {message.text}
          </div>
      )}

      <div style={styles.idCard} className="printable-card">
          <div style={styles.idHeader} className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiActivity size={20} color="#3b82f6" />
                  <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.5px' }}>Algo<span style={{color: '#3b82f6'}}>Med</span> ID</span>
              </div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.7 }}>Official Record</span>
          </div>
          <div className="id-grid">
              <div className="id-item">
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Blood Group</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{formData.bloodGroup || '--'}</div>
              </div>
              <div className="id-item">
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Date of Birth</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{formData.dateOfBirth || '--'}</div>
              </div>
              <div className="id-item">
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Emergency</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{formData.emergencyContact.phone || '--'}</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{formData.emergencyContact.name}</div>
              </div>
              <div className="id-item">
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Allergies</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{formData.allergies.length > 0 ? `${formData.allergies.length} Active` : 'None'}</div>
              </div>
          </div>
          <div style={{ position: 'absolute', right: -15, bottom: -15, width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="main-layout-grid">
            
            {/* --- LEFT COLUMN: FORMS --- */}
            <div>
                {/* 1. Basic Vitals */}
                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <FiUser style={styles.sectionIcon} />
                        <h3 style={styles.sectionTitle}>Essential Vitals</h3>
                    </div>
                    <div className="vitals-grid">
                        <div>
                            <label style={styles.label}>DOB</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={styles.input} />
                        </div>
                        <div>
                             <label style={styles.label}>Blood Type</label>
                             <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={styles.select}>
                                <option value="">--</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                             </select>
                        </div>
                        <div>
                             <label style={styles.label}>Height (cm)</label>
                             <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="175" style={styles.input} />
                        </div>
                        <div>
                             <label style={styles.label}>Weight (kg)</label>
                             <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" style={styles.input} />
                        </div>
                    </div>
                </div>

                {/* 2. Medical History */}
                <div style={styles.card}>
                     <div style={{ ...styles.sectionHeader, justifyContent: 'space-between', border: 'none', paddingBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiActivity style={styles.sectionIcon} />
                            <h3 style={styles.sectionTitle}>Conditions</h3>
                        </div>
                        <button type="button" onClick={() => addItem('medicalHistory', { condition: '', diagnosedDate: '', status: 'Active' })} style={styles.btnSmall}>
                            <FiPlus /> Add
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}></div>

                    {formData.medicalHistory.length === 0 && <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '8px', fontSize: '0.85rem' }}>No medical conditions listed.</div>}
                    
                    {formData.medicalHistory.map((item, index) => (
                        <div key={index} style={styles.listItem} className="list-item-wrapper">
                             <div className="list-inputs-grid-3">
                                 <input placeholder="Condition" value={item.condition} onChange={(e) => handleArrayChange('medicalHistory', index, 'condition', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <input type="date" value={item.diagnosedDate ? item.diagnosedDate.split('T')[0] : ''} onChange={(e) => handleArrayChange('medicalHistory', index, 'diagnosedDate', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <select value={item.status} onChange={(e) => handleArrayChange('medicalHistory', index, 'status', e.target.value)} style={{...styles.select, padding: '6px 8px'}}>
                                    <option value="Active">Active</option>
                                    <option value="Managed">Managed</option>
                                    <option value="Cured">Cured</option>
                                 </select>
                             </div>
                             <div className="list-action">
                                <button type="button" onClick={() => removeItem('medicalHistory', index)} style={{...styles.btnIcon, color: '#ef4444'}}>
                                    <FiTrash2 size={16} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>

                {/* 3. Allergies */}
                <div style={styles.card}>
                    <div style={{ ...styles.sectionHeader, justifyContent: 'space-between', border: 'none', paddingBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiAlertCircle style={styles.sectionIcon} />
                            <h3 style={styles.sectionTitle}>Allergies</h3>
                        </div>
                        <button type="button" onClick={() => addItem('allergies', { allergen: '', reaction: '', severity: 'Mild' })} style={styles.btnSmall}>
                            <FiPlus /> Add
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}></div>

                    {formData.allergies.map((item, index) => (
                        <div key={index} style={styles.listItem} className="list-item-wrapper">
                             <div className="list-inputs-grid-allergy">
                                 <input placeholder="Allergen" value={item.allergen} onChange={(e) => handleArrayChange('allergies', index, 'allergen', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <input placeholder="Reaction" value={item.reaction} onChange={(e) => handleArrayChange('allergies', index, 'reaction', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <select value={item.severity} onChange={(e) => handleArrayChange('allergies', index, 'severity', e.target.value)} style={{...styles.select, padding: '6px 8px'}}>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                 </select>
                             </div>
                             <div className="list-action">
                                <button type="button" onClick={() => removeItem('allergies', index)} style={{...styles.btnIcon, color: '#ef4444'}}>
                                    <FiTrash2 size={16} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>

                {/* 4. Medications */}
                <div style={styles.card}>
                     <div style={{ ...styles.sectionHeader, justifyContent: 'space-between', border: 'none', paddingBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCheckCircle style={styles.sectionIcon} />
                            <h3 style={styles.sectionTitle}>Medications</h3>
                        </div>
                        <button type="button" onClick={() => addItem('currentMedications', { name: '', dosage: '', frequency: '' })} style={styles.btnSmall}>
                            <FiPlus /> Add
                        </button>
                    </div>
                    <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}></div>
                      {formData.currentMedications.map((item, index) => (
                        <div key={index} style={styles.listItem} className="list-item-wrapper">
                             <div className="list-inputs-grid-3">
                                 <input placeholder="Medication Name" value={item.name} onChange={(e) => handleArrayChange('currentMedications', index, 'name', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <input placeholder="Dosage" value={item.dosage} onChange={(e) => handleArrayChange('currentMedications', index, 'dosage', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                                 <input placeholder="Frequency" value={item.frequency} onChange={(e) => handleArrayChange('currentMedications', index, 'frequency', e.target.value)} style={{...styles.input, padding: '6px 8px'}} />
                             </div>
                             <div className="list-action">
                                <button type="button" onClick={() => removeItem('currentMedications', index)} style={{...styles.btnIcon, color: '#ef4444'}}>
                                    <FiTrash2 size={16} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- RIGHT COLUMN: WIDGETS --- */}
            <div>
                {/* Widget 1: BMI Calculator */}
                <div style={{ ...styles.card, position: 'sticky', top: '10px' }}>
                    <h3 style={{ ...styles.sectionTitle, marginBottom: '12px' }}>Body Mass Index</h3>
                    {bmiData ? (
                        <div style={styles.bmiWidget}>
                            <div style={styles.bmiValue}>{bmiData.value}</div>
                            <div style={styles.bmiStatus}>{bmiData.status}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                                Based on {formData.height}cm / {formData.weight}kg
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '15px', fontSize: '0.85rem' }}>
                            <FiInfo style={{ marginBottom: '5px', fontSize: '1rem' }} /> <br/>
                            Enter Height & Weight to calculate BMI.
                        </div>
                    )}
                </div>

                {/* Widget 2: Profile Strength */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ ...styles.sectionTitle, fontSize: '0.9rem' }}>Profile Completion</h3>
                        <span style={{ fontWeight: '700', color: profileStrength === 100 ? '#22c55e' : '#3b82f6', fontSize: '0.9rem' }}>{profileStrength}%</span>
                    </div>
                    <div style={styles.progressBg}>
                        <div style={styles.progressFill}></div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                        {profileStrength < 100 ? "Complete lifestyle & emergency to reach 100%." : "Profile complete."}
                    </p>
                </div>

                {/* Widget 3: Lifestyle Quick Edit */}
                <div style={styles.card}>
                    <h3 style={{ ...styles.sectionTitle, marginBottom: '12px' }}>Lifestyle</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                             <label style={styles.label}>Smoking</label>
                             <select value={formData.lifestyle.smoking} onChange={(e) => handleNestedChange('lifestyle', 'smoking', e.target.value)} style={styles.select}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                                <option value="Occasionally">Occasionally</option>
                             </select>
                        </div>
                        <div>
                             <label style={styles.label}>Alcohol</label>
                             <select value={formData.lifestyle.alcohol} onChange={(e) => handleNestedChange('lifestyle', 'alcohol', e.target.value)} style={styles.select}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                                <option value="Occasionally">Occasionally</option>
                             </select>
                        </div>
                         <div>
                             <label style={styles.label}>Activity</label>
                             <select value={formData.lifestyle.activityLevel} onChange={(e) => handleNestedChange('lifestyle', 'activityLevel', e.target.value)} style={styles.select}>
                                <option value="Sedentary">Sedentary</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Active">Active</option>
                             </select>
                        </div>
                    </div>
                </div>
                
                 {/* Widget 4: Emergency Contact */}
                <div style={{ ...styles.card, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                    <h3 style={{ ...styles.sectionTitle, color: '#991b1b', marginBottom: '12px' }}>Emergency Contact</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input placeholder="Contact Name" value={formData.emergencyContact.name} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} style={{ ...styles.input, borderColor: '#fca5a5' }} />
                        <input placeholder="Phone Number" value={formData.emergencyContact.phone} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} style={{ ...styles.input, borderColor: '#fca5a5' }} />
                        <input placeholder="Relationship" value={formData.emergencyContact.relation} onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)} style={{ ...styles.input, borderColor: '#fca5a5' }} />
                    </div>
                </div>

            </div>
        </div>
      </form>
      
      <style>{`
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
        .header-actions { display: flex; gap: 10px; }
        .main-layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }
        .vitals-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }
        .id-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .id-item { background: rgba(255,255,255,0.1); padding: 10px; borderRadius: 8px; backdrop-filter: blur(5px); }
        .page-title { fontSize: 2rem; fontWeight: 900; color: #1e293b; margin: 0; letter-spacing: -1px; line-height: 1.2; }
        .sub-title { color: #64748b; margin-top: 4px; fontSize: 0.9rem; margin-bottom: 0; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        
        .list-item-wrapper { display: flex; align-items: center; gap: 8px; }
        .list-inputs-grid-3 { flex: 1; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
        .list-inputs-grid-allergy { flex: 1; display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 8px; }
        .list-action { display: flex; align-items: center; justify-content: center; }

        @media (max-width: 900px) {
            .main-layout-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
            .mobile-scaler {
                width: 112%; 
                transform: scale(0.9);
                transform-origin: top left;
                margin-bottom: -20%; 
            }

            .header-flex { flex-direction: column; align-items: stretch; gap: 10px; }
            .header-actions { justify-content: space-between; }
            .header-actions button { flex: 1; }
            
            .vitals-grid { grid-template-columns: 1fr 1fr; }
            
            .id-grid { grid-template-columns: repeat(2, 1fr); }
            
            .list-item-wrapper { flex-direction: column; align-items: stretch; position: relative; padding-right: 30px; }
            .list-inputs-grid-3 { grid-template-columns: 1fr; gap: 8px; }
            .list-inputs-grid-allergy { grid-template-columns: 1fr; gap: 8px; }
            .list-action { position: absolute; top: 10px; right: 10px; }
        }

        @media print {
            body * { visibility: hidden; }
            .printable-card, .printable-card * { visibility: visible; }
            .printable-card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 1px solid #000; }
        }
      `}</style>
    </div>
  );
};

export default PatientProfile;