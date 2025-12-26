import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Components
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LandingPage from './pages/LandingPage'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import FindDoctors from './pages/FindDoctors';
import MyAppointments from './pages/MyAppointments';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import AIChat from './pages/AIChat'; 

// --- 1. Root Route Wrapper ---
const RootRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-blue-600 font-semibold animate-pulse">Loading AlgoMed...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
  }
  return <LandingPage />;
};

// --- 2. Public Only Route Wrapper (New) ---
const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />

          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/signup/patient" 
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/signup/doctor" 
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } 
          />
          
          <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/ai" element={<AIChat />} />
              <Route path="/doctor/appointments" element={<MyAppointments />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={['patient']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/ai" element={<AIChat />} />
              <Route path="/patient/find-doctors" element={<FindDoctors />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;