
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
  hideNavLinks?: boolean; // Option to hide middle navigation (e.g. on Auth pages)
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children, hideNavLinks = false }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* HEADER */}
      <nav className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-100 h-[72px]">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-brand-500 tracking-tighter hover:opacity-80 transition-opacity">KOSMA</Link>
          
          {!hideNavLinks && (
            <div className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
              <Link to="/#pricing" className="hover:text-brand-500 transition-colors">Pricing</Link>
              <Link to="#" className="hover:text-brand-500 transition-colors">Learning Campus</Link>
              <Link to="/help" className="hover:text-brand-500 transition-colors">Help Center</Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-sm font-bold">
          {isAuthenticated ? (
            <>
               <span className="text-gray-400 hidden md:inline text-xs uppercase tracking-widest">Hi, {user?.name}</span>
               <Link to="/dashboard" className="bg-brand-500 text-white px-5 py-2 rounded-xl hover:bg-brand-600 transition-all flex items-center gap-2 font-bold shadow-lg shadow-brand-500/20">
                 <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
               </Link>
            </>
          ) : (
            <>
              {!hideNavLinks && <Link to="#" className="text-brand-500 hover:underline hidden md:block">Download</Link>}
              <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors">Login</Link>
              <Link to="/signup" className="bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
      
      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium">
             <div className="flex gap-8">
                <Link to="/login?reset=true" className="hover:text-brand-500 transition-colors">Passwort vergessen?</Link>
                <Link to="#" className="hover:text-brand-500 transition-colors">Impressum</Link>
                <Link to="#" className="hover:text-brand-500 transition-colors">Datenschutz</Link>
                <Link to="#" className="hover:text-brand-500 transition-colors">Kontakt</Link>
             </div>
             <div className="text-gray-400">© {new Date().getFullYear()} KOSMA Software. All rights reserved.</div>
           </div>
        </div>
      </footer>
    </div>
  );
};
