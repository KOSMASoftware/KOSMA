
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Download } from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
  hideNavLinks?: boolean; // Option to hide middle navigation (e.g. on Auth pages)
}

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children, hideNavLinks = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `transition-colors ${isActive(path) ? 'text-brand-500' : 'hover:text-brand-500'}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* HEADER */}
      <nav className="bg-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-100 h-[72px]">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-brand-500 tracking-tighter hover:opacity-80 transition-opacity">KOSMA</Link>
          
          {!hideNavLinks && (
            <div className="hidden lg:flex gap-6 text-sm font-bold text-gray-500">
              <Link to="/pricing" className={linkClass('/pricing')}>Pricing</Link>
              <Link to="/learning" className={linkClass('/learning')}>Learning Campus</Link>
              <Link to="/help" className={linkClass('/help')}>Knowledge Base</Link>
              <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-sm font-bold">
          {isAuthenticated ? (
            <>
               <span className="text-gray-400 hidden md:inline text-xs uppercase tracking-widest">Hi, {user?.name}</span>
               <Link to="/dashboard" className="bg-brand-500 text-white px-5 py-2 rounded-xl hover:bg-brand-600 transition-all flex items-center gap-2">
                 <LayoutDashboard className="w-4 h-4" /> Dashboard
               </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors">Login</Link>
              <Link to="/signup" className="text-gray-900 hover:text-brand-500 transition-colors">Get Started</Link>
              <Link to="/download" className="bg-brand-500 text-white px-5 py-2 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
