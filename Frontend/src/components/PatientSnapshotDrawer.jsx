import React, { useEffect, useState } from 'react';
import { getPatientSummary } from '../services/api';
import { FiX, FiActivity, FiAlertCircle, FiClock, FiUser } from 'react-icons/fi';

const PatientSnapshotDrawer = ({ isOpen, onClose, patientId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchSummary();
    } else {
      setData(null);
    }
  }, [isOpen, patientId]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await getPatientSummary(patientId);
      setData(res.data);
    } catch (error) {
      console.error("Failed to load patient summary", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-450px',
    width: '100%',
    maxWidth: '400px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
    transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  };

  const sectionStyle = {
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px dashed #e2e8f0'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block'
  };

  const tagStyle = (type) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    marginRight: '8px',
    marginBottom: '8px',
    backgroundColor: type === 'danger' ? '#fee2e2' : '#f1f5f9',
    color: type === 'danger' ? '#991b1b' : '#334155'
  });

  if (!isOpen) return <div style={drawerStyle}></div>;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
        />
      )}
      
      <div style={drawerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Patient Snapshot</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>Loading record...</div>
          ) : data ? (
            <>
              {/* Basic Info */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    <FiUser />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{data.basic.name}</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      {data.basic.gender} • {data.basic.age} Years
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Blood</span>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{data.medical.bloodGroup}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Height</span>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{data.medical.height}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Weight</span>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{data.medical.weight}</div>
                    </div>
                </div>
              </div>

              {/* Active Conditions (Risk Factors) */}
              <div style={sectionStyle}>
                <label style={labelStyle}><FiActivity style={{ marginRight: '5px' }} /> Active Conditions</label>
                {data.medical.activeConditions.length > 0 ? (
                    data.medical.activeConditions.map((cond, i) => (
                        <span key={i} style={tagStyle('danger')}>{cond.condition}</span>
                    ))
                ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No active conditions reported.</span>
                )}
              </div>

              {/* Allergies */}
              <div style={sectionStyle}>
                <label style={labelStyle}><FiAlertCircle style={{ marginRight: '5px' }} /> Allergies</label>
                {data.medical.allergies.length > 0 ? (
                    data.medical.allergies.map((alg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <span>{alg.allergen}</span>
                            <span style={{ color: alg.severity === 'Severe' ? '#ef4444' : '#64748b', fontWeight: alg.severity === 'Severe' ? '600' : '400' }}>{alg.severity}</span>
                        </div>
                    ))
                ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No known allergies.</span>
                )}
              </div>

              {/* Last Visit */}
              <div style={{ ...sectionStyle, borderBottom: 'none' }}>
                <label style={labelStyle}><FiClock style={{ marginRight: '5px' }} /> Last Visit Summary</label>
                {data.lastVisit ? (
                    <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                        <div style={{ fontSize: '0.8rem', color: '#c2410c', marginBottom: '4px' }}>
                            {new Date(data.lastVisit.date).toLocaleDateString()}
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#9a3412', marginBottom: '4px' }}>
                            {data.lastVisit.reason}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#c2410c', fontStyle: 'italic' }}>
                            "{data.lastVisit.notes || 'No notes added.'}"
                        </p>
                    </div>
                ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>First visit.</span>
                )}
              </div>

            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#ef4444' }}>Failed to load data.</div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Open Full Medical Profile
            </button>
        </div>
      </div>
    </>
  );
};

export default PatientSnapshotDrawer;