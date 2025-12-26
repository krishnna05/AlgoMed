import React, { useEffect, useState } from 'react';
import { getPatientSummary } from '../services/api';
import { FiX, FiActivity, FiAlertCircle, FiClock, FiUser } from 'react-icons/fi';

const PatientSnapshotDrawer = ({ isOpen, onClose, patientId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchSummary();
    }
  }, [isOpen, patientId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    backgroundColor: 'white',
    boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    ...(isMobile ? {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      width: '90%',
      maxWidth: '350px',
      height: 'auto',
      maxHeight: '85vh',
      borderRadius: '16px',
      transform: isOpen ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -40%) scale(0.95)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
    } : {
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      borderRadius: '0',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    })
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    WebkitOverflowScrolling: 'touch',
  };

  const sectionStyle = {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px dashed #e2e8f0'
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.5px'
  };

  const tagStyle = (type) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginRight: '6px',
    marginBottom: '6px',
    backgroundColor: type === 'danger' ? '#fee2e2' : '#f1f5f9',
    color: type === 'danger' ? '#991b1b' : '#475569'
  });

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', 
    gap: '8px',
    marginTop: '12px'
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.4)', 
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />
      
      <div style={drawerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Patient Snapshot</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '8px',
              display: 'flex',
              color: '#64748b'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
              Loading data...
            </div>
          ) : data ? (
            <>
              {/* Basic Info */}
              <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    backgroundColor: '#eff6ff', color: '#3b82f6', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' 
                  }}>
                    <FiUser />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{data.basic.name}</h2>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      {data.basic.gender} • {data.basic.age} Years
                    </p>
                  </div>
                </div>
                
                <div style={statsGridStyle}>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display:'block' }}>Blood</span>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{data.medical.bloodGroup}</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display:'block' }}>Height</span>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{data.medical.height}</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display:'block' }}>Weight</span>
                        <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{data.medical.weight}</span>
                    </div>
                </div>
              </div>

              {/* Conditions */}
              <div style={sectionStyle}>
                <label style={labelStyle}><FiActivity style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Active Conditions</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {data.medical.activeConditions.length > 0 ? (
                      data.medical.activeConditions.map((cond, i) => (
                          <span key={i} style={tagStyle('danger')}>{cond.condition}</span>
                      ))
                  ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No active conditions.</span>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div style={sectionStyle}>
                <label style={labelStyle}><FiAlertCircle style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Allergies</label>
                {data.medical.allergies.length > 0 ? (
                    data.medical.allergies.map((alg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                            <span style={{ color: '#334155' }}>{alg.allergen}</span>
                            <span style={{ color: alg.severity === 'Severe' ? '#ef4444' : '#64748b', fontWeight: alg.severity === 'Severe' ? '600' : '400' }}>{alg.severity}</span>
                        </div>
                    ))
                ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No known allergies.</span>
                )}
              </div>

              {/* Last Visit */}
              <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <label style={labelStyle}><FiClock style={{ marginRight: '5px', verticalAlign: '-2px' }} /> Last Visit</label>
                {data.lastVisit ? (
                    <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px', alignItems:'center'}}>
                           <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#9a3412' }}>{data.lastVisit.reason}</span>
                           <span style={{ fontSize: '0.75rem', color: '#c2410c' }}>{new Date(data.lastVisit.date).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#c2410c', fontStyle: 'italic' }}>
                            "{data.lastVisit.notes || 'No notes.'}"
                        </p>
                    </div>
                ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>First visit.</span>
                )}
              </div>

            </>
          ) : (
            
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                 <div style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to load data.</div>
                 <button onClick={fetchSummary} style={{ background:'none', border:'none', color:'#3b82f6', textDecoration:'underline', cursor:'pointer' }}>Retry</button>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' }}>
                Open Full Medical Profile
            </button>
        </div>
      </div>
    </>
  );
};

export default PatientSnapshotDrawer;