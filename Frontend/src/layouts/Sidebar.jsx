import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiGrid, FiUsers, FiCalendar, FiActivity, 
  FiSettings, FiCpu, FiX 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { user } = useAuth();

  const styles = {
    sidebar: {
      width: '210px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 0.3s ease-in-out',
      boxShadow: isMobile && isOpen ? '5px 0 15px rgba(0,0,0,0.1)' : 'none',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 90, 
      display: isMobile && isOpen ? 'block' : 'none',
      backdropFilter: 'blur(2px)'
    },
    logoContainer: {
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid #f1f5f9'
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoIconBox: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '1rem',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
      flexShrink: 0
    },
    logoTypography: {
      fontSize: '1.15rem',
      fontWeight: '800',
      color: '#0f172a', 
      letterSpacing: '-0.025em',
      lineHeight: 1
    },
    closeButton: {
      display: isMobile ? 'block' : 'none',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: '1.2rem'
    },
    menuContainer: {
      padding: '20px 12px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    sectionLabel: {
      padding: '0 10px 8px',
      fontSize: '0.7rem',
      fontWeight: '700',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    footerContainer: {
      padding: '16px',
      borderTop: '1px solid #f1f5f9'
    },
    userCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    },
    userInfo: {
      overflow: 'hidden'
    },
    userName: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#1e293b',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    userRole: {
      fontSize: '0.7rem',
      color: '#64748b',
      textTransform: 'capitalize'
    }
  };

  const getLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    color: isActive ? '#3b82f6' : '#64748b',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    marginBottom: '2px'
  });

  let menuItems = [];
  if (user?.role === 'patient') {
    menuItems = [
      { path: '/patient', label: 'Dashboard', icon: <FiGrid /> },
      { path: '/patient/ai', label: 'AlgoMed AI', icon: <FiCpu /> },
      { path: '/patient/find-doctors', label: 'Find Doctors', icon: <FiUsers /> },
      { path: '/patient/appointments', label: 'My Appointments', icon: <FiCalendar /> },
      { path: '/patient/profile', label: 'Medical Profile', icon: <FiActivity /> },
    ];
  } else if (user?.role === 'doctor') {
    menuItems = [
      { path: '/doctor', label: 'Overview', icon: <FiGrid /> },
      { path: '/doctor/ai', label: 'AlgoMed AI', icon: <FiCpu /> },
      { path: '/doctor/appointments', label: 'Schedule', icon: <FiCalendar /> },
      { path: '/doctor/profile', label: 'Profile & Settings', icon: <FiSettings /> },
    ];
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoIconBox}>
              <FiActivity />
            </div>
            <div style={styles.logoTypography}>
              Algo<span style={{ color: '#3b82f6' }}>Med</span>
            </div>
          </div>
          
          <div style={styles.closeButton} onClick={onClose}>
             <FiX />
          </div>
        </div>

        <nav style={styles.menuContainer}>
          <div style={styles.sectionLabel}>
            Menu
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={getLinkStyle}
              end={item.path === '/patient' || item.path === '/doctor'}
            >
              <span style={{ fontSize: '1rem', marginRight: '10px', display: 'flex' }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.footerContainer}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;