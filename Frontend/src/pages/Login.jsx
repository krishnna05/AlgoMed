import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiDatabase } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemoDoctor = () => {
    setFormData({
      email: 'doctor@algomed.com',
      password: 'doctor#123'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // --- THEME CONFIG ---
  const theme = {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    headerBg: '#eff6ff',
    borderColor: '#bfdbfe',
    iconBg: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    blobColor: 'rgba(37, 99, 235, 0.15)',
    textMain: '#1e293b',
    textSub: '#64748b'
  };

  // --- STYLES ---
  const styles = {
    pageContainer: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },

    // --- ANIMATED BACKGROUND ---
    bgGrid: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '30px 30px',
      opacity: 1,
      zIndex: 0
    },
    blob1: {
      position: 'absolute', top: '-10%', left: '-5%',
      width: '600px', height: '600px',
      backgroundColor: theme.blobColor,
      borderRadius: '50%',
      filter: 'blur(80px)',
      zIndex: 0,
      animation: 'float 25s infinite ease-in-out'
    },
    blob2: {
      position: 'absolute', bottom: '-10%', right: '-5%',
      width: '500px', height: '500px',
      backgroundColor: theme.blobColor,
      borderRadius: '50%',
      filter: 'blur(80px)',
      zIndex: 0,
      animation: 'float 20s infinite ease-in-out reverse'
    },

    // --- SPLIT LAYOUT PANEL ---
    splitLayout: {
      display: 'flex', width: '100%', maxWidth: '1000px',
      minHeight: '600px',
      backgroundColor: 'white', borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.8)',
      position: 'relative', zIndex: 10
    },

    // --- LEFT PANEL ---
    leftPanel: {
      flex: 1, padding: '60px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', color: 'white', background: theme.gradient,
      position: 'relative'
    },
    leftPanelLogo: {
      position: 'absolute', top: '40px', left: '40px',
      display: 'flex', alignItems: 'center', gap: '10px'
    },
    leftLogoIcon: {
      width: '32px', height: '32px', borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    leftLogoText: {
      fontSize: '1.4rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px'
    },
    heroTitle: { fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' },
    heroSub: { fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px' },

    // --- RIGHT PANEL (Form) ---
    rightPanel: {
      flex: 1.1, padding: '50px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', backgroundColor: '#ffffff'
    },

    // --- RESTORED HEADER CARD STYLES ---
    headerCard: {
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px', borderRadius: '12px',
      backgroundColor: theme.headerBg,
      border: `1px solid ${theme.borderColor}`,
      marginBottom: '24px'
    },
    iconBox: {
      width: '42px', height: '42px', borderRadius: '10px',
      backgroundColor: theme.iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem', color: '#fff', flexShrink: 0
    },
    headerTitle: { fontSize: '1.15rem', fontWeight: '700', color: theme.textMain, margin: 0, marginBottom: '2px' },
    headerSub: { fontSize: '0.85rem', color: theme.textSub, margin: 0 },

    // Form
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em' },
    input: {
      width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
      fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
      backgroundColor: '#f9fafb', color: theme.textMain
    },
    // --- RESTORED BUTTON COLOR ---
    ctaBtn: {
      width: '100%', padding: '12px', backgroundColor: theme.primary, // Back to Blue
      color: 'white', border: 'none', borderRadius: '8px',
      fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'wait' : 'pointer',
      marginTop: '8px', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    },

    // --- COMPACT DEMO BOX ---
    demoContainer: {
        marginTop: '24px',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        border: '1px dashed #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'border-color 0.2s'
    },
    demoInfo: {
        display: 'flex', alignItems: 'center', gap: '10px'
    },
    demoIconCircle: {
        width: '32px', height: '32px', borderRadius: '8px',
        backgroundColor: 'rgba(37, 99, 235, 0.1)', 
        color: theme.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.9rem'
    },
    demoTextGroup: { display: 'flex', flexDirection: 'column' },
    demoLabel: { fontSize: '0.85rem', fontWeight: '700', color: '#334155' },
    demoSub: { fontSize: '0.75rem', color: '#64748b' },
    
    demoActionBtn: {
        padding: '6px 12px',
        fontSize: '0.50rem',
        fontWeight: '600',
        color: theme.primary,
        backgroundColor: 'white',
        border: `1px solid ${theme.borderColor}`,
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s'
    },

    signupPrompt: {
      marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280'
    },
    link: { color: theme.primary, fontWeight: '600', textDecoration: 'none' },

    footer: {
      marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f3f4f6',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '0.75rem', color: '#9ca3af', width: '100%'
    },
    footerLinks: { display: 'flex', gap: '12px' },
    footerLink: { color: '#6b7280', textDecoration: 'none', transition: 'color 0.2s' }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes float {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}20 !important; background-color: #fff !important; }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        button:active { transform: translateY(0); }
        .footer-link:hover { color: ${theme.primary} !important; }
        @media (max-width: 900px) {
           .split-container { flexDirection: 'column'; height: auto; max-width: 500px; }
           .left-panel-visual { display: none !important; }
           .right-panel-form { padding: 30px !important; }
        }
      `}</style>

      {/* Background Elements */}
      <div style={styles.bgGrid}></div>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.splitLayout} className="split-container">

        {/* LEFT PANEL */}
        <div style={styles.leftPanel} className="left-panel-visual">
          {/* Branding */}
          <div style={styles.leftPanelLogo}>
            <div style={styles.leftLogoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4V20M4 12H20" />
              </svg>
            </div>
            <span style={styles.leftLogoText}>AlgoMed.</span>
          </div>

          <h1 style={styles.heroTitle}>Welcome back.</h1>
          <p style={styles.heroSub}>
            Sign in to manage your appointments, prescriptions, and health records securely.
          </p>

          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'white', opacity: 0.08 }}></div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel} className="right-panel-form">

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* RESTORED HEADER CARD */}
            <div style={styles.headerCard}>
              <div style={styles.iconBox}>🔐</div>
              <div>
                <h3 style={styles.headerTitle}>Account Login</h3>
                <p style={styles.headerSub}>Please enter your credentials</p>
              </div>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="name@company.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" style={styles.ctaBtn} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            {/* COMPACT DEMO BAR */}
            <div style={styles.demoContainer}>
                <div style={styles.demoInfo}>
                    <div style={styles.demoIconCircle}><FiDatabase /></div>
                    <div style={styles.demoTextGroup}>
                        <span style={styles.demoLabel}>Demo Account</span>
                        <span style={styles.demoSub}>Instant Doctor Access</span>
                    </div>
                </div>

                <button type="button" onClick={fillDemoDoctor} style={styles.demoActionBtn} title="Auto-fill doctor credentials">
                     Auto-Fill <FiArrowRight />
                </button>
            </div>

            <div style={styles.signupPrompt}>
              Don't have an account? <Link to="/signup" style={styles.link}>Create Account</Link>
            </div>
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <span>© 2025 AlgoMed Inc.</span>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink} className="footer-link">Terms</a>
              <a href="#" style={styles.footerLink} className="footer-link">Privacy</a>
              <a href="#" style={styles.footerLink} className="footer-link">Help</a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;