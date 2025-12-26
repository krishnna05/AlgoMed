import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); 
      } else {
        setIsSidebarOpen(false); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  const styles = {
    layoutContainer: {
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontSize: '0.9rem', 
    },
    mainWrapper: {
      marginLeft: isMobile ? '0' : '210px', 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      transition: 'margin-left 0.3s ease-in-out',
      width: isMobile ? '100%' : 'auto'
    },
    pageContent: {
      flex: 1,
      padding: isMobile ? '16px' : '24px', 
      overflowX: 'hidden'
    }
  };

  return (
    <div style={styles.layoutContainer}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isMobile={isMobile}
      />
      
      <div style={styles.mainWrapper}>
        <Navbar 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            isMobile={isMobile}
        />
        
        <main style={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;