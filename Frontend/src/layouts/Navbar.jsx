import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navStyle = {
    height: '80px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 5
  };

  const searchContainer = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '10px 16px',
    width: '400px'
  };

  const inputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    marginLeft: '12px',
    width: '100%',
    color: '#1e293b',
    fontSize: '0.9rem'
  };

  const actionGroup = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  };

  const iconBtn = {
    background: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    color: '#64748b',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const badge = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid #fff'
  };

  return (
    <nav style={navStyle}>
      {/* Search Bar */}
      <div style={searchContainer}>
        <FiSearch color="#94a3b8" size={18} />
        <input type="text" placeholder="Search patients, appointments, or records..." style={inputStyle} />
      </div>

      {/* Right Actions */}
      <div style={actionGroup}>
        <button style={iconBtn}>
          <FiBell />
          <span style={badge}></span>
        </button>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

        <button 
          onClick={handleLogout} 
          style={{ ...iconBtn, fontSize: '0.9rem', color: '#ef4444', fontWeight: '500', gap: '8px' }}
        >
          Logout <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;