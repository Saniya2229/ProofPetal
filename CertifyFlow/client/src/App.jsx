import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import CertificateSearch from './pages/CertificateSearch';
import CertificatePreview from './pages/CertificatePreview';
import Support from './pages/Support';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/search" element={<CertificateSearch />} />
          <Route path="/support" element={<Support />} />
          <Route path="/certificate/:id" element={<CertificatePreview />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<CertificateSearch />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
