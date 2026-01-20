
import React, { useEffect } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CookieProvider } from './context/CookieContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { DownloadPage } from './pages/Download';
import { ContactPage } from './pages/Contact';
import { AuthPage } from './pages/Auth';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LearningPage } from './pages/Learning';
import { KnowledgeBasePage } from './pages/KnowledgeBase';
import { BillingReturn } from './pages/BillingReturn';
import { EulaPage } from './pages/Eula';
import { TermsPage } from './pages/Terms';
import { PrivacyPage } from './pages/Privacy';
import { ImprintPage } from './pages/Imprint';
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
  
  // --- SELF-HEALING ROUTING LOGIC ---
  // This ensures that Supabase recovery links work even if Vercel rewrites 
  // the request to index.html instead of the public/update-password/index.html helper.
  useEffect(() => {
    const { hash, pathname, search } = window.location;
    
    // Case 1: Browser is at /update-password (Real Path) with a Hash (Token)
    // Vercel served the App directly. We must redirect to HashRouter format.
    if (pathname === '/update-password' && (hash.includes('access_token') || hash.includes('type=recovery'))) {
        const params = hash.startsWith('#') ? hash.substring(1) : hash;
        window.location.replace(`/#/update-password?${params}`);
        return;
    }

    // Case 2: Browser is at / (Root) but has a raw Supabase Hash (e.g. #access_token=...&type=recovery)
    // HashRouter will ignore this because it doesn't start with #/
    if (hash.includes('type=recovery') && !hash.includes('#/')) {
         const params = hash.startsWith('#') ? hash.substring(1) : hash;
         window.location.replace(`/#/update-password?${params}`);
    }
  }, []);

  // Robust detection of recovery mode for AuthProvider key
  const isRecovery = window.location.hash.includes('/update-password') || window.location.pathname === '/update-password';

  if (isRecovery) {
    return (
      <AuthProvider key="auth-recovery">
        <CookieProvider>
          {/* We assume the self-healing effect above has put us in HashRouter mode or we are handling the route manually */}
          <HashRouter>
            <Routes>
              <Route path="/update-password" element={<AuthPage mode="update-password" />} />
              <Route path="*" element={<Navigate to="/update-password" />} />
            </Routes>
          </HashRouter>
        </CookieProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider key="auth-normal">
      <CookieProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/eula" element={<EulaPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/imprint" element={<ImprintPage />} />
            
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

            {/* DOCUMENTATION */}
            {/* 1. Learning Campus (Old Help Page Logic, route /learning) */}
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/*" element={<LearningPage />} />
            
            {/* 2. Knowledge Base (New Explorative Page, route /help) */}
            <Route path="/help" element={<KnowledgeBasePage />} />
            <Route path="/help/:id" element={<KnowledgeBasePage />} />
            
            {/* Redirects */}
            <Route path="/knowledge/*" element={<Navigate to="/help" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </CookieProvider>
    </AuthProvider>
  );
};

export default App;
