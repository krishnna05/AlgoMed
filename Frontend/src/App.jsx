import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import PrivateRoute from "./components/PrivateRoute";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* Default Route */}
      <Route
        path="/"
        element={
          user ? (
            user.role === "doctor" ? (
              <Navigate to="/doctor" />
            ) : (
              <Navigate to="/patient" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        element={
          <PrivateRoute allowedRoles={["doctor"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Route>

      {/* Patient Routes */}
      <Route
        element={
          <PrivateRoute allowedRoles={["patient"]}>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/patient" element={<PatientDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
