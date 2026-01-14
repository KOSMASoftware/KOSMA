
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HelpPage } from './pages/Help';
import { BillingReturn } from './pages/BillingReturn';
import { UserRole } from './types';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Automatische Umleitung zur korrekten Root-Ansicht basierend auf der Rolle
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`[Router] Role mismatch. User is ${user?.role}, but page requires ${requiredRole}. Redirecting...`);
    const target = user?.role === UserRole.ADMIN ? '/admin' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/update-password" element={<AuthPage mode="update-password" />} />
          <Route path="/billing-return" element={<BillingReturn />} />

          {/* Kunden-Bereich: Admins werden hier rausgeworfen nach /admin */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin-Bereich: Kunden werden hier rausgeworfen nach /dashboard */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Help Page: Accessible for all authenticated users */}
          <Route 
            path="/help" 
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;