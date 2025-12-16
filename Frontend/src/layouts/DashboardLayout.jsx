import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AIChatWidget from './AIChatWidget';

const DashboardLayout = () => {
  const layoutContainer = {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9', 
  };

  const mainWrapper = {
    marginLeft: '260px', 
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease' 
  };

  const pageContent = {
    flex: 1,
    padding: '32px', 
    overflowX: 'hidden' 
  };

  return (
    <div style={layoutContainer}>
      <Sidebar />
      <div style={mainWrapper}>
        <Navbar />
        
        <main style={pageContent}>
          <Outlet />
        </main>
      </div>

      <AIChatWidget />
    </div>
  );
};

export default DashboardLayout;