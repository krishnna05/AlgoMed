import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiLogOut, FiMenu } from 'react-icons/fi';

const Navbar = ({ onMenuClick, isMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const styles = {
    nav: {
      height: '60px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      // Reduced side padding slightly on mobile for better spacing
      padding: isMobile ? '0 12px' : '0 24px', 
      position: 'sticky',
      top: 0,
      zIndex: 50
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '12px', // Tighter gap on mobile
      flex: 1,
      // On mobile, let it fill the space. On desktop, cap it.
      maxWidth: isMobile ? '100%' : '400px' 
    },
    menuBtn: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      fontSize: '1.2rem',
      color: '#3b82f6',
      cursor: 'pointer',
      // FIX: Fixed dimensions ensure perfect vertical centering relative to search bar
      width: '40px', 
      height: '40px',
      padding: 0,
      flexShrink: 0 // Prevents button from squishing
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f1f5f9',
      borderRadius: '6px',
      padding: '8px 12px', // Increased vertical padding slightly for better visual balance
      flex: 1,
    },
    input: {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      marginLeft: '10px',
      width: '100%',
      color: '#1e293b',
      fontSize: '0.85rem',
      minWidth: 0,
      // FIX: Removes browser default margins that shift text
      margin: 0, 
      padding: 0 
    },
    actionGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '12px' : '16px',
      flexShrink: 0,
      marginLeft: isMobile ? '12px' : '0' // Ensure space between search and icons
    },
    iconBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: '1.1rem',
      color: '#64748b',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
      justifyContent: 'center',
      height: '32px', // Fixed height for alignment
      width: '32px'
    },
    badge: {
      position: 'absolute',
      top: '4px', // Adjusted to fit inside the new fixed height
      right: '4px',
      width: '6px',
      height: '6px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      border: '1px solid #fff'
    },
    divider: {
      width: '1px',
      height: '20px',
      backgroundColor: '#e2e8f0'
    },
    logoutBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: '0.8rem',
      color: '#ef4444',
      fontWeight: '600',
      gap: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '4px' : '4px 8px'
    },
    logoutText: {
      display: isMobile ? 'none' : 'block'
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <button onClick={onMenuClick} style={styles.menuBtn} aria-label="Open Menu">
          <FiMenu />
        </button>

        <div style={styles.searchContainer}>
          <FiSearch color="#94a3b8" size={16} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search records..."}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.actionGroup}>
        <button style={styles.iconBtn} aria-label="Notifications">
          <FiBell />
          <span style={styles.badge}></span>
        </button>

        <div style={styles.divider}></div>

        <button onClick={handleLogout} style={styles.logoutBtn} aria-label="Logout">
          <span style={styles.logoutText}>Logout</span>
          <FiLogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;