import React, { useState, useEffect } from 'react';
import { getPatientProfile, updatePatientProfile } from '../services/api';

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    // General
    dateOfBirth: '',
    bloodGroup: '',
    height: '',
    weight: '',
    // Arrays
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    // Objects
    lifestyle: {
      smoking: 'No',
      alcohol: 'No',
      activityLevel: 'Moderate'
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching patient profile", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addItem = (field, emptyItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], emptyItem]
    }));
  };

  const removeItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleArrayChange = (field, index, subField, value) => {
    const updated = [...formData[field]];
    updated[index][subField] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updatePatientProfile(formData);
      setMessage({ type: 'success', text: 'Health profile updated successfully!' });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Styles ---
  const containerStyle = { maxWidth: '850px', margin: '0 auto', paddingBottom: '40px' };
  
  const sectionCard = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  const headerTitle = {
    fontSize: '1.3rem',
    color: '#2c3e50',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f2f6',
    paddingBottom: '10px',
    fontWeight: '600'
  };

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
  const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };

  const label = { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#34495e', fontSize: '0.9rem' };
  const input = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' };
  const select = { ...input, backgroundColor: 'white' };

  const arrayItemStyle = {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    position: 'relative',
    border: '1px solid #e9ecef'
  };

  const removeBtn = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#e74c3c',
    cursor: 'pointer',
    fontSize: '1.2rem'
  };

  const addBtn = {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    marginTop: '10px'
  };

  const saveBtn = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: saving ? 'wait' : 'pointer',
    opacity: saving ? 0.7 : 1,
    marginTop: '20px'
  };

  const messageBox = (type) => ({
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
    color: type === 'success' ? '#155724' : '#721c24',
    textAlign: 'center'
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading health record...</div>;

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '25px', color: '#2c3e50' }}>Medical Profile</h1>
      
      {message.text && <div style={messageBox(message.type)}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        
        {/* 1. Basic Medical Info */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Basic Details</h2>
          <div style={grid2}>
            <div>
              <label style={label}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleBasicChange} style={input} />
            </div>
            <div>
              <label style={label}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleBasicChange} style={select}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={label}>Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleBasicChange} placeholder="175" style={input} />
            </div>
            <div>
              <label style={label}>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleBasicChange} placeholder="70" style={input} />
            </div>
          </div>
        </div>

        {/* 2. Lifestyle */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Lifestyle</h2>
          <div style={grid3}>
            <div>
              <label style={label}>Smoking</label>
              <select value={formData.lifestyle.smoking} onChange={(e) => handleNestedChange('lifestyle', 'smoking', e.target.value)} style={select}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Occasionally">Occasionally</option>
              </select>
            </div>
            <div>
              <label style={label}>Alcohol</label>
              <select value={formData.lifestyle.alcohol} onChange={(e) => handleNestedChange('lifestyle', 'alcohol', e.target.value)} style={select}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Occasionally">Occasionally</option>
              </select>
            </div>
            <div>
              <label style={label}>Activity Level</label>
              <select value={formData.lifestyle.activityLevel} onChange={(e) => handleNestedChange('lifestyle', 'activityLevel', e.target.value)} style={select}>
                <option value="Sedentary">Sedentary</option>
                <option value="Moderate">Moderate</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Medical History */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Medical History</h2>
          {formData.medicalHistory.map((item, index) => (
            <div key={index} style={arrayItemStyle}>
              <button type="button" onClick={() => removeItem('medicalHistory', index)} style={removeBtn}>&times;</button>
              <div style={grid3}>
                <div>
                  <label style={label}>Condition</label>
                  <input type="text" placeholder="e.g. Diabetes" value={item.condition} onChange={(e) => handleArrayChange('medicalHistory', index, 'condition', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Date Diagnosed</label>
                  <input type="date" value={item.diagnosedDate ? item.diagnosedDate.split('T')[0] : ''} onChange={(e) => handleArrayChange('medicalHistory', index, 'diagnosedDate', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Status</label>
                  <select value={item.status} onChange={(e) => handleArrayChange('medicalHistory', index, 'status', e.target.value)} style={select}>
                    <option value="Active">Active</option>
                    <option value="Managed">Managed</option>
                    <option value="Cured">Cured</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem('medicalHistory', { condition: '', diagnosedDate: '', status: 'Active' })} style={addBtn}>
            + Add Condition
          </button>
        </div>

        {/* 4. Allergies */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Allergies</h2>
          {formData.allergies.map((item, index) => (
            <div key={index} style={arrayItemStyle}>
              <button type="button" onClick={() => removeItem('allergies', index)} style={removeBtn}>&times;</button>
              <div style={grid3}>
                <div>
                  <label style={label}>Allergen</label>
                  <input type="text" placeholder="e.g. Peanuts" value={item.allergen} onChange={(e) => handleArrayChange('allergies', index, 'allergen', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Reaction</label>
                  <input type="text" placeholder="e.g. Rash" value={item.reaction} onChange={(e) => handleArrayChange('allergies', index, 'reaction', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Severity</label>
                  <select value={item.severity} onChange={(e) => handleArrayChange('allergies', index, 'severity', e.target.value)} style={select}>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem('allergies', { allergen: '', reaction: '', severity: 'Mild' })} style={addBtn}>
            + Add Allergy
          </button>
        </div>

        {/* 5. Current Medications */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Current Medications</h2>
          {formData.currentMedications.map((item, index) => (
            <div key={index} style={arrayItemStyle}>
              <button type="button" onClick={() => removeItem('currentMedications', index)} style={removeBtn}>&times;</button>
              <div style={grid3}>
                <div>
                  <label style={label}>Medication Name</label>
                  <input type="text" placeholder="e.g. Paracetamol" value={item.name} onChange={(e) => handleArrayChange('currentMedications', index, 'name', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Dosage</label>
                  <input type="text" placeholder="e.g. 500mg" value={item.dosage} onChange={(e) => handleArrayChange('currentMedications', index, 'dosage', e.target.value)} style={input} />
                </div>
                <div>
                  <label style={label}>Frequency</label>
                  <input type="text" placeholder="e.g. Twice daily" value={item.frequency} onChange={(e) => handleArrayChange('currentMedications', index, 'frequency', e.target.value)} style={input} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem('currentMedications', { name: '', dosage: '', frequency: '' })} style={addBtn}>
            + Add Medication
          </button>
        </div>

        {/* 6. Emergency Contact */}
        <div style={sectionCard}>
          <h2 style={headerTitle}>Emergency Contact</h2>
          <div style={grid3}>
            <div>
              <label style={label}>Name</label>
              <input type="text" value={formData.emergencyContact.name} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Phone</label>
              <input type="text" value={formData.emergencyContact.phone} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Relation</label>
              <input type="text" value={formData.emergencyContact.relation} onChange={(e) => handleNestedChange('emergencyContact', 'relation', e.target.value)} style={input} />
            </div>
          </div>
        </div>

        <button type="submit" style={saveBtn} disabled={saving}>
          {saving ? 'Saving Profile...' : 'Save Medical Profile'}
        </button>
      </form>
    </div>
  );
};

export default PatientProfile;