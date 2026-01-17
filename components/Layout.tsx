
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, Settings, CreditCard, ShieldCheck, LineChart, Server, X, Zap, TrendingUp, Bug, CircleHelp, BookOpen, GraduationCap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { PulsingDotsBackground } from './ui/pulsing-dots-background';

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
      active 
        ? 'bg-brand-50 text-brand-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
    {label}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return <>{children}</>;

  const isCustomer = user.role === UserRole.CUSTOMER;
  const isAdmin = user.role === UserRole.ADMIN;

  // Shared Sidebar Logic
  const SidebarContent = (onClick?: () => void) => (
    <>
      <div className="p-6 border-b border-gray-100 flex justify-between items-center h-[72px]">
        <div>
          <div className="flex items-center gap-2 font-black text-2xl text-brand-500 tracking-tighter">
            <span>KOSMA</span>
          </div>
          <div className="mt-1 text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block tracking-[0.2em]">
            {isAdmin ? 'ADMIN AREA' : 'CUSTOMER AREA'}
          </div>
        </div>
        {onClick && (
          <button className="md:hidden" onClick={onClick}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {isCustomer && (
          <>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" active={location.pathname === '/dashboard'} onClick={onClick} />
            <NavItem to="/dashboard/subscription" icon={CreditCard} label="Subscription" active={location.pathname === '/dashboard/subscription'} onClick={onClick} />
            <div className="pt-4 mt-4 border-t border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">Support</p>
               <NavItem 
                  to="/learning" 
                  icon={GraduationCap} 
                  label="Learning Campus" 
                  active={location.pathname.startsWith('/learning')} 
                  onClick={onClick}
               />
               <NavItem 
                  to="/help" 
                  icon={BookOpen} 
                  label="Knowledge Base" 
                  active={location.pathname.startsWith('/help')} 
                  onClick={onClick}
               />
               <NavItem 
                  to="/dashboard/settings" 
                  icon={Settings} 
                  label="Settings" 
                  active={location.pathname.includes('settings')} 
                  onClick={onClick}
               />
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/admin'} onClick={onClick} />
            <NavItem to="/admin/users" icon={ShieldCheck} label="Users & Licenses" active={location.pathname === '/admin/users'} onClick={onClick} />
            <NavItem to="/admin/marketing" icon={TrendingUp} label="Marketing" active={location.pathname === '/admin/marketing'} onClick={onClick} />
            <div className="pt-4 pb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">Technical</p>
                <NavItem to="/admin/system" icon={Server} label="System Health" active={location.pathname === '/admin/system'} onClick={onClick} />
                <NavItem to="/admin/debug" icon={Bug} label="Stripe Debug" active={location.pathname === '/admin/debug'} onClick={onClick} />
            </div>
            <div className="pt-4 mt-4 border-t border-gray-100">
                <NavItem 
                  to="/learning" 
                  icon={GraduationCap} 
                  label="Learning Campus" 
                  active={location.pathname.startsWith('/learning')} 
                  onClick={onClick}
               />
                <NavItem 
                  to="/help" 
                  icon={BookOpen} 
                  label="Knowledge Base" 
                  active={location.pathname.startsWith('/help')} 
                  onClick={onClick}
               />
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-lg">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <PulsingDotsBackground containerClassName="z-0">
      <AppShell
        sidebar={SidebarContent()}
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
        mobileMenu={isMobileMenuOpen ? (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              {SidebarContent(() => setIsMobileMenuOpen(false))}
            </aside>
          </div>
        ) : null}
      >
        {children}
      </AppShell>
    </PulsingDotsBackground>
  );
};
