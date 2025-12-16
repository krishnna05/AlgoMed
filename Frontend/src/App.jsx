import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Components
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import FindDoctors from './pages/FindDoctors';
import MyAppointments from './pages/MyAppointments';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<Login />} />
          
          {/* --- Signup Routes --- */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/patient" element={<Signup />} />
          <Route path="/signup/doctor" element={<Signup />} />
          
          <Route path="/" element={<HomeRedirect />} />

          {/* --- Protected Doctor Routes --- */}
          <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<MyAppointments />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
            </Route>
          </Route>

          {/* --- Protected Patient Routes --- */}
          <Route element={<PrivateRoute allowedRoles={['patient']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
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