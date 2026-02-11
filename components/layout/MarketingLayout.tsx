
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Download, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { PulsingDotsBackground } from '../ui/pulsing-dots-background';
import { Footer } from './Footer';
import { Logo } from '../ui/Logo';
import { H5, Small, Label } from '../ui/Typography';

interface MarketingLayoutProps {
  children: React.ReactNode;
  hideNavLinks?: boolean; // Option to hide middle navigation (e.g. on Auth pages)
}

const MobileLink = ({ to, children, active, onClick }: { to: string; children?: React.ReactNode; active: boolean; onClick: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`text-2xl font-black ${active ? 'text-brand-500' : 'text-gray-900'} hover:text-brand-500 transition-colors`}
  >
    {children}
  </Link>
);

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children, hideNavLinks = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `transition-colors cursor-pointer font-bold ${isActive(path) ? 'text-brand-500' : 'hover:text-brand-500'}`;

  return (
    <PulsingDotsBackground>
      <div className="min-h-screen flex flex-col font-sans">
        {/* HEADER */}
        <nav className="bg-white/80 backdrop-blur-sm py-4 px-4 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-gray-100 min-h-[72px]">
          <div className="flex items-center gap-4 md:gap-10">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo className="h-8 w-auto text-brand-500" />
            </Link>
            
            {!hideNavLinks && (
              <div className="hidden lg:flex gap-8 text-gray-500">
                <Link to="/pricing"><Label className={linkClass('/pricing')}>Pricing</Label></Link>
                <Link to="/learning"><Label className={linkClass('/learning')}>Learning Campus</Label></Link>
                <Link to="/help"><Label className={linkClass('/help')}>Knowledge Base</Label></Link>
                <Link to="/support"><Label className={linkClass('/support')}>Support</Label></Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Picker (Visual Only) */}
            <div className="hidden md:flex items-center gap-1.5 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors border-r border-gray-200 pr-4 mr-1">
                <Globe className="w-4 h-4" />
                <Small className="uppercase font-bold text-xs">EN</Small>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </div>

            {isAuthenticated ? (
              <>
                 <Small className="hidden md:inline font-bold">Hi, {user?.name}</Small>
                 <Link to="/dashboard" className="bg-brand-500 text-white px-3 py-2 md:px-5 md:py-2 rounded-xl hover:bg-brand-600 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20">
                   <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline text-white text-sm font-bold">Dashboard</span>
                 </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-900 hover:text-brand-500 transition-colors hidden sm:block"><Label className="cursor-pointer font-bold text-sm">Login</Label></Link>
                <Link to="/signup" className="hidden sm:block text-gray-900 hover:text-brand-500 transition-colors"><Label className="cursor-pointer font-bold text-sm">Get Started</Label></Link>
                <Link to="/download" className="bg-brand-500 text-white px-3 py-2 md:px-5 md:py-2 rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline text-white text-sm font-bold">Download</span>
                </Link>
              </>
            )}

            {!hideNavLinks && (
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 <Menu className="w-6 h-6" />
               </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
             <div className="fixed inset-0 z-[100] lg:hidden">
                 <div className="absolute inset-0 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-5 duration-200 flex flex-col p-6">
                     <div className="flex justify-between items-center mb-12">
                         <div className="text-brand-500">
                            <Logo className="h-8 w-auto" />
                         </div>
                         <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors">
                             <X className="w-6 h-6" />
                         </button>
                     </div>
                     <div className="flex flex-col gap-8 items-start px-2">
                         <MobileLink to="/pricing" active={isActive('/pricing')} onClick={() => setIsMobileMenuOpen(false)}>Pricing</MobileLink>
                         <MobileLink to="/learning" active={isActive('/learning')} onClick={() => setIsMobileMenuOpen(false)}>Learning Campus</MobileLink>
                         <MobileLink to="/help" active={isActive('/help')} onClick={() => setIsMobileMenuOpen(false)}>Knowledge Base</MobileLink>
                         <MobileLink to="/support" active={isActive('/support')} onClick={() => setIsMobileMenuOpen(false)}>Support</MobileLink>
                     </div>
                     
                     {!isAuthenticated && (
                        <div className="mt-auto pb-8 flex flex-col gap-4 w-full">
                            <Link to="/login" className="text-center py-4 font-bold text-gray-900 bg-gray-50 rounded-2xl">Login</Link>
                            <Link to="/signup" className="text-center py-4 font-bold text-white bg-gray-900 rounded-2xl">Get Started</Link>
                        </div>
                     )}
                 </div>
             </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 flex flex-col relative z-20">
          {children}
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </PulsingDotsBackground>
  );
};
