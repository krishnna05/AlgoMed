import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUsers, FiCalendar, FiActivity, FiSettings, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();

  const sidebarStyle = {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10
  };

  const logoContainer = {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    borderBottom: '1px solid #f1f5f9'
  };

  const logoText = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const menuContainer = {
    padding: '24px 16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  const footerContainer = {
    padding: '24px',
    borderTop: '1px solid #f1f5f9'
  };

  const getLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    color: isActive ? '#3b82f6' : '#64748b',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    marginBottom: '4px'
  });

  let menuItems = [];

  if (user?.role === 'patient') {
    menuItems = [
      { path: '/patient', label: 'Dashboard', icon: <FiGrid /> },
      { path: '/patient/find-doctors', label: 'Find Doctors', icon: <FiUsers /> },
      { path: '/patient/appointments', label: 'My Appointments', icon: <FiCalendar /> },
      { path: '/patient/profile', label: 'Medical Profile', icon: <FiActivity /> },
    ];
  } else if (user?.role === 'doctor') {
    menuItems = [
      { path: '/doctor', label: 'Overview', icon: <FiGrid /> },
      { path: '/doctor/appointments', label: 'Schedule', icon: <FiCalendar /> },
      { path: '/doctor/profile', label: 'Profile & Settings', icon: <FiSettings /> },
    ];
  }

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainer}>
        <div style={logoText}>
          ⚡ AlgoMed
        </div>
      </div>

      <nav style={menuContainer}>
        <div style={{ padding: '0 12px 12px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={getLinkStyle}
            end={item.path === '/patient' || item.path === '/doctor'}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '12px', display: 'flex' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={footerContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;