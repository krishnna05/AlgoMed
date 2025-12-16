import React, { useState, useEffect } from 'react'; // <--- Added useEffect here
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- DEMO RESET TRIGGER ---
  // This resets the database every time a user lands on the Login page.
  // This ensures every new demo starts fresh.
  useEffect(() => {
    const resetDemo = async () => {
        try {
            await fetch('http://localhost:8080/api/reset', { method: 'POST' });
            console.log("🔄 Demo Database Reset Successfully");
        } catch (err) {
            console.error("⚠️ Failed to reset demo database:", err);
        }
    };
    resetDemo();
  }, []);
  // ---------------------------

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    primary: '#2563eb', // Brand Blue
    primaryHover: '#1d4ed8',
    headerBg: '#eff6ff', 
    borderColor: '#bfdbfe',
    iconBg: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Deep Blue Gradient
    blobColor: 'rgba(37, 99, 235, 0.15)', // Blue Glow
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
      display: 'flex', width: '100%', maxWidth: '1100px',
      minHeight: '600px',
      backgroundColor: 'white', borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
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
    // Logo (White)
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
      flex: 1.1, padding: '60px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', backgroundColor: '#ffffff'
    },

    // Header Card (Sign In)
    headerCard: {
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '20px', borderRadius: '12px',
        backgroundColor: theme.headerBg,
        border: `1px solid ${theme.borderColor}`,
        marginBottom: '32px'
    },
    iconBox: {
        width: '48px', height: '48px', borderRadius: '10px',
        backgroundColor: theme.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', color: '#fff', flexShrink: 0
    },
    headerTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '4px' },
    headerSub: { fontSize: '0.9rem', color: '#4b5563', margin: 0 },

    // Form
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' },
    input: {
      width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
      fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
      backgroundColor: '#fff', color: '#111827'
    },
    
    ctaBtn: {
      width: '100%', padding: '14px', backgroundColor: theme.primary,
      color: 'white', border: 'none', borderRadius: '8px',
      fontSize: '1rem', fontWeight: '600', cursor: loading ? 'wait' : 'pointer',
      marginTop: '10px', transition: 'background-color 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    },

    signupPrompt: {
        marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280'
    },
    link: { color: theme.primary, fontWeight: '600', textDecoration: 'none' },

    // --- FOOTER SECTION ---
    footer: {
        marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #f3f4f6',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.8rem', color: '#9ca3af', width: '100%'
    },
    footerLinks: { display: 'flex', gap: '15px' },
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
        input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}20 !important; }
        .footer-link:hover { color: ${theme.primary} !important; }
        @media (max-width: 900px) {
           .split-container { flexDirection: 'column'; height: auto; max-width: 500px; }
           .left-panel-visual { display: none !important; }
           .right-panel-form { padding: 40px !important; }
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
                   <path d="M12 4V20M4 12H20"/>
                </svg>
             </div>
             <span style={styles.leftLogoText}>AlgoMed.</span>
          </div>

          <h1 style={styles.heroTitle}>Welcome back.</h1>
          <p style={styles.heroSub}>
            Sign in to manage your appointments, prescriptions, and health records securely.
          </p>
          
          {/* Decorative Circles */}
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'white', opacity: 0.08 }}></div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel} className="right-panel-form">
          
          {/* Main Content Wrapper for Vertical Spacing */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* Header Card */}
            <div style={styles.headerCard}>
                <div style={styles.iconBox}>🔐</div>
                <div>
                    <h3 style={styles.headerTitle}>Account Login</h3>
                    <p style={styles.headerSub}>Please enter your credentials</p>
                </div>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

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
                    placeholder="Enter your password" 
                />
                </div>

                <button type="submit" style={styles.ctaBtn} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>

            <div style={styles.signupPrompt}>
                Don't have an account? <Link to="/signup" style={styles.link}>Create Account</Link>
            </div>
          </div>

          {/* FOOTER SECTION */}
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