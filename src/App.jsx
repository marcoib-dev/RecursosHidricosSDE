import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import PlantsPage from '@/pages/PlantsPage';
import PlantDetailPage from '@/pages/PlantDetailPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/plants" element={<PrivateRoute><PlantsPage /></PrivateRoute>} />
          <Route path="/plants/:id" element={<PrivateRoute><PlantDetailPage /></PrivateRoute>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;