import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  const initialRole = location.pathname.includes('doctor') ? 'doctor' : 'patient';
  
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', gender: 'Male',
    specialization: 'General Physician', experience: '', medicalRegNumber: '', 
    clinicAddress: '', clinicName: '',
    dateOfBirth: '', bloodGroup: '', emergencyContactName: '', emergencyContactPhone: ''
  });

  useEffect(() => {
    if (location.pathname === '/signup/doctor') setRole('doctor');
    else if (location.pathname === '/signup/patient') setRole('patient');
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setStep(1);
    navigate(`/signup/${newRole}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const result = await signup(payload);

      if (result.success) {
        navigate(role === 'doctor' ? '/doctor' : '/patient');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- THEME ---
  const isDoc = role === 'doctor';
  
  const theme = isDoc ? {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    headerBg: '#eff6ff', 
    borderColor: '#bfdbfe',
    iconBg: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    blobColor: 'rgba(37, 99, 235, 0.15)',
    text: 'Create Doctor Profile',
    sub: 'Manage patients digitally.',
    heroTitle: 'Healthcare connected.',
    heroSub: 'Expand your practice with our digital suite.',
    icon: '👨‍⚕️'
  } : {
    primary: '#10b981', 
    primaryHover: '#059669',
    headerBg: '#ecfdf5',
    borderColor: '#a7f3d0',
    iconBg: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    blobColor: 'rgba(16, 185, 129, 0.15)',
    text: 'Create Patient Account',
    sub: 'Book appointments online.',
    heroTitle: 'Your health, manageable everywhere.',
    heroSub: 'Connect with specialists from home.',
    icon: '🩺'
  };

  const styles = {
    pageContainer: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '10px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },

    // --- ANIMATED BACKGROUND ELEMENTS ---
    bgGrid: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '30px 30px', opacity: 1, zIndex: 0
    },
    blob1: {
        position: 'absolute', top: '-10%', left: '-5%',
        width: '500px', height: '500px', 
        backgroundColor: theme.blobColor, borderRadius: '50%',
        filter: 'blur(80px)', zIndex: 0,
        animation: 'float 25s infinite ease-in-out'
    },
    blob2: {
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '400px', height: '400px', 
        backgroundColor: theme.blobColor, borderRadius: '50%',
        filter: 'blur(80px)', zIndex: 0,
        animation: 'float 20s infinite ease-in-out reverse'
    },

    splitLayout: {
      display: 'flex', width: '100%', 
      maxWidth: '960px',
      minHeight: '580px',
      backgroundColor: 'white', borderRadius: '12px',
      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)', 
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.8)',
      position: 'relative', zIndex: 10 
    },
    
    // --- LEFT PANEL ---
    leftPanel: {
      flex: 0.8, padding: '40px',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', color: 'white', background: theme.gradient,
      position: 'relative', transition: 'background 0.5s ease'
    },
    leftPanelLogo: {
        position: 'absolute', top: '30px', left: '30px',
        display: 'flex', alignItems: 'center', gap: '8px'
    },
    leftLogoIcon: {
        width: '28px', height: '28px', borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    leftLogoText: { fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' },
    
    heroIcon: { fontSize: '3.5rem', marginBottom: '20px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' },
    heroTitle: { fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '15px', letterSpacing: '-0.02em' },
    heroSub: { fontSize: '1rem', opacity: 0.9, lineHeight: 1.5, maxWidth: '350px' },

    rightPanel: {
      flex: 1.2, padding: '30px 40px',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', maxHeight: '100vh', backgroundColor: '#ffffff'
    },
    
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    
    logoContainer: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' },
    logoIcon: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', borderRadius: '8px',
        backgroundColor: theme.primary, color: 'white',
        boxShadow: `0 4px 10px ${theme.primary}40`,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
    },
    logoText: { fontSize: '1.3rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px', lineHeight: 1 },
    logoAccent: { color: theme.primary, transition: 'color 0.3s ease' },

    switcherContainer: {
      display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '6px',
      padding: '3px', border: '1px solid #e5e7eb'
    },
    switcherBtn: (active) => ({
      padding: '5px 12px', borderRadius: '5px', border: 'none',
      backgroundColor: active ? 'white' : 'transparent',
      color: active ? theme.primary : '#6b7280',
      fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer',
      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.2s ease'
    }),

    // --- HEADER CARD ---
    profileHeader: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '15px', borderRadius: '10px',
        backgroundColor: theme.headerBg,
        border: `1px solid ${theme.borderColor}`,
        marginBottom: '20px', transition: 'background-color 0.3s ease'
    },
    iconBox: {
        width: '40px', height: '40px', borderRadius: '8px',
        backgroundColor: theme.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', color: '#fff', flexShrink: 0
    },
    headerTextContainer: { display: 'flex', flexDirection: 'column' },
    headerTitle: { fontSize: '1rem', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '2px', letterSpacing: '-0.01em' },
    headerSub: { fontSize: '0.8rem', color: '#4b5563', margin: 0 },

    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    fullWidth: { gridColumn: '1 / -1' },
    inputGroup: { marginBottom: '14px' },
    label: { display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' },
    input: {
      width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
      fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: '#fff', color: '#111827'
    },
    
    ctaBtn: {
      width: '100%', padding: '12px', backgroundColor: theme.primary,
      color: 'white', border: 'none', borderRadius: '6px',
      fontSize: '0.9rem', fontWeight: '600', cursor: loading ? 'wait' : 'pointer',
      marginTop: '18px', transition: 'background-color 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    },
    backBtn: {
      background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
      fontWeight: '600', fontSize: '0.85rem', marginRight: '16px'
    },
    
    uploadBox: {
      border: `2px dashed ${theme.primary}40`, padding: '20px', borderRadius: '8px',
      textAlign: 'center', cursor: 'pointer', backgroundColor: 'white',
      position: 'relative', transition: 'all 0.2s'
    },
    microcopy: { fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '12px' },

    footer: {
        marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f3f4f6',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.75rem', color: '#9ca3af'
    },
    footerLinks: { display: 'flex', gap: '12px' },
    footerLink: { color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s' }
  };

  const renderSharedFields = () => (
    <>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Full Name</label>
        <input style={styles.input} name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" />
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Email Address</label>
        <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@company.com" />
      </div>
      <div style={styles.formGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input style={styles.input} type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="00000-00000" />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Gender</label>
          <select style={styles.input} name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" minLength="6" />
      </div>
    </>
  );

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes float {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        input:focus, select:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}20 !important; }
        .footer-link:hover { color: ${theme.primary} !important; }

        @media (max-width: 900px) {
          .left-panel-visual { display: none !important; }
          .page-container { padding: 0 !important; }
          
          .split-container { 
            max-width: 100% !important; 
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .right-panel-form { 
             padding: 20px !important;
             justify-content: flex-start !important;
          }

          /* Simulate 80% Zoom on Mobile Content */
          .mobile-content-wrapper {
             transform: scale(0.9); /* Zoom effect */
             transform-origin: top center;
             width: 111%;
             margin-left: -5.5%;
          }
          
          .mobile-footer-fix {
             transform: scale(0.9);
             transform-origin: bottom center;
             width: 111%;
             margin-left: -5.5%;
          }
          
          .mobile-grid {
             grid-template-columns: 1fr !important;
             gap: 10px !important;
          }
        }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div style={styles.bgGrid}></div>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* --- MAIN CARD --- */}
      <div style={styles.splitLayout} className="split-container">
        
        {/* LEFT PANEL: Visual Storytelling */}
        <div style={styles.leftPanel} className="left-panel-visual">
          <div style={styles.leftPanelLogo}>
             <div style={styles.leftLogoIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 4V20M4 12H20"/>
                </svg>
             </div>
             <span style={styles.leftLogoText}>AlgoMed.</span>
          </div>
          <div style={styles.heroIcon}>{theme.icon}</div>
          <h1 style={styles.heroTitle}>{theme.heroTitle}</h1>
          <p style={styles.heroSub}>{theme.heroSub}</p>
        </div>

        {/* RIGHT PANEL: Form */}
        <div style={styles.rightPanel} className="right-panel-form">
          
          <div className="mobile-content-wrapper">
              {/* Top Bar */}
              <div style={styles.topBar}>
                <div style={styles.logoContainer}>
                    <div style={styles.logoIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 4V20M4 12H20"/>
                        </svg>
                    </div>
                    <span style={styles.logoText}>
                        Algo<span style={styles.logoAccent}>Med</span>
                    </span>
                </div>
                <div style={styles.switcherContainer}>
                  <button type="button" style={styles.switcherBtn(role === 'patient')} onClick={() => handleRoleSwitch('patient')}>
                    Patient
                  </button>
                  <button type="button" style={styles.switcherBtn(role === 'doctor')} onClick={() => handleRoleSwitch('doctor')}>
                    Doctor
                  </button>
                </div>
              </div>

              {/* HEADER BANNER */}
              <div style={styles.profileHeader}>
                <div style={styles.iconBox}>{theme.icon}</div>
                <div style={styles.headerTextContainer}>
                    <h3 style={styles.headerTitle}>{theme.text}</h3>
                    <p style={styles.headerSub}>{theme.sub}</p>
                </div>
              </div>

              {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.8rem', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* --- DOCTOR STEPS --- */}
                {isDoc && (
                  <>
                    {step === 1 && (
                      <>
                        {renderSharedFields()}
                        <button type="button" style={styles.ctaBtn} onClick={() => setStep(2)}>
                          Continue to Details →
                        </button>
                      </>
                    )}

                    {step === 2 && (
                      <div style={styles.formGrid}>
                        <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                          <label style={styles.label}>Specialization</label>
                          <select style={styles.input} name="specialization" value={formData.specialization} onChange={handleChange}>
                            <option value="General Physician">General Physician</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Pediatrician">Pediatrician</option>
                          </select>
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Medical Reg. No</label>
                          <input style={styles.input} name="medicalRegNumber" value={formData.medicalRegNumber} onChange={handleChange} required placeholder="MCI-12345" />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Experience (Yrs)</label>
                          <input style={styles.input} type="number" name="experience" value={formData.experience} onChange={handleChange} required placeholder="5" />
                        </div>
                        <div style={{ ...styles.inputGroup, ...styles.fullWidth }}>
                          <label style={styles.label}>Clinic Name</label>
                          <input style={styles.input} name="clinicName" value={formData.clinicName} onChange={handleChange} required placeholder="City Care Hospital" />
                        </div>
                        
                        <div style={{ ...styles.fullWidth, display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                          <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                          <button type="button" style={{ ...styles.ctaBtn, marginTop: 0, flex: 1 }} onClick={() => setStep(3)}>
                            Verify Profile →
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                          <div style={styles.inputGroup}>
                          <label style={styles.label}>
                            Upload License <span style={{fontWeight: 'normal', color: '#9ca3af', fontSize: '0.7rem'}}>(Optional)</span>
                          </label>
                          <div style={styles.uploadBox}>
                            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>📄</span>
                            <span style={{ color: theme.primary, fontWeight: '500', fontSize: '0.85rem' }}>Click to upload</span>
                            <input type="file" style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', cursor: 'pointer' }} />
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                          <button type="button" style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
                          <button type="submit" style={{ ...styles.ctaBtn, marginTop: 0, flex: 1 }} disabled={loading}>
                            {loading ? '...' : 'Submit Profile'}
                          </button>
                        </div>
                        <p style={styles.microcopy}>* Verification required before activation.</p>
                      </div>
                    )}
                  </>
                )}

                {/* --- PATIENT FLOW --- */}
                {!isDoc && (
                  <>
                    {renderSharedFields()}
                    
                    <div style={{ margin: '20px 0 15px 0', borderTop: '1px solid #f3f4f6' }}></div>
                    <h4 style={{ color: '#374151', fontSize: '0.75rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-0.01em' }}>HEALTH (OPTIONAL) </h4>

                    <div style={styles.formGrid} className="mobile-grid">
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Date of Birth</label>
                        <input style={styles.input} type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Blood Group</label>
                        <select style={styles.input} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="O+">O+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGrid} className="mobile-grid">
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Emergency Contact</label>
                        <input style={styles.input} name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Name" />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input style={styles.input} name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="Phone" />
                      </div>
                    </div>

                    <button type="submit" style={styles.ctaBtn} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </>
                )}
              </form>

              {/* Login Link */}
              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', color: '#6b7280' }}>
                Already a member? <Link to="/login" style={{ color: theme.primary, fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
              </div>
          </div>

          {/* Footer */}
          <div style={styles.footer} className="mobile-footer-fix">
              <span>© 2025 AlgoMed</span>
              <div style={styles.footerLinks}>
                  <a href="#" style={styles.footerLink} className="footer-link">Terms</a>
                  <a href="#" style={styles.footerLink} className="footer-link">Privacy</a>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;