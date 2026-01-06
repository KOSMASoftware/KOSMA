import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';

// Guard for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
      );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect customers trying to access admin to their own dash
    return <Navigate to={user?.role === UserRole.ADMIN ? '/admin' : '/dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />

          {/* Customer Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;