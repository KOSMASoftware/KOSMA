
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Download, Globe, ChevronDown } from 'lucide-react';
import { PulsingDotsBackground } from '../ui/pulsing-dots-background';

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
    <PulsingDotsBackground>
      <div className="min-h-screen flex flex-col font-sans">
        {/* HEADER */}
        <nav className="bg-white/80 backdrop-blur-sm py-4 px-4 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-100 min-h-[72px]">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="text-xl md:text-2xl font-black text-brand-500 tracking-tighter hover:opacity-80 transition-opacity">KOSMA</Link>
            
            {!hideNavLinks && (
              <div className="hidden lg:flex gap-6 text-sm font-bold text-gray-500">
                <Link to="/pricing" className={linkClass('/pricing')}>Pricing</Link>
                <Link to="/learning" className={linkClass('/learning')}>Learning Campus</Link>
                <Link to="/help" className={linkClass('/help')}>Knowledge Base</Link>
                <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 text-sm font-bold">
            {/* Language Picker (Visual Only) */}
            <div className="hidden md:flex items-center gap-1.5 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors border-r border-gray-200 pr-4 mr-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs uppercase">EN</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </div>

            {isAuthenticated ? (
              <>
                 <span className="text-gray-400 hidden md:inline text-xs uppercase tracking-widest">Hi, {user?.name}</span>
                 <Link to="/dashboard" className="bg-brand-500 text-white px-3 py-2 md:px-5 md:py-2 rounded-xl hover:bg-brand-600 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20">
                   <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                 </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors">Login</Link>
                <Link to="/signup" className="hidden sm:block text-gray-900 hover:text-brand-500 transition-colors">Get Started</Link>
                <Link to="/download" className="bg-brand-500 text-white px-3 py-2 md:px-5 md:py-2 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>

        {/* FOOTER */}
        <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              
              {/* Spalte 1: Product */}
              <div className="flex flex-col gap-4">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Product</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li><Link to="/#budgeting" className="hover:text-brand-500 transition-colors">Budgeting</Link></li>
                  <li><Link to="/#financing" className="hover:text-brand-500 transition-colors">Financing</Link></li>
                  <li><Link to="/#cashflow" className="hover:text-brand-500 transition-colors">Cash Flow</Link></li>
                  <li><Link to="/#cost-control" className="hover:text-brand-500 transition-colors">Cost Control</Link></li>
                </ul>
              </div>

              {/* Spalte 2: Support */}
              <div className="flex flex-col gap-4">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Support</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li><Link to="/help" className="hover:text-brand-500 transition-colors">Knowledge Base</Link></li>
                  <li><Link to="/learning" className="hover:text-brand-500 transition-colors">Learning Campus</Link></li>
                  <li><Link to="/login?reset=true" className="hover:text-brand-500 transition-colors">Reset Password</Link></li>
                </ul>
              </div>

              {/* Spalte 3: Legal */}
              <div className="flex flex-col gap-4">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li><Link to="/imprint" className="hover:text-brand-500 transition-colors">Imprint</Link></li>
                  <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms / GTC</Link></li>
                  <li><button className="hover:text-brand-500 transition-colors text-left">Cookie Settings</button></li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-xl font-black text-brand-500 tracking-tighter md:hidden">KOSMA</div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  &copy; {new Date().getFullYear()} KOSMA
               </p>
               <div className="hidden md:block text-xl font-black text-brand-500 tracking-tighter opacity-20 hover:opacity-100 transition-opacity">KOSMA</div>
            </div>
          </div>
        </footer>
      </div>
    </PulsingDotsBackground>
  );
};
